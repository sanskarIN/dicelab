use rand::{rngs::OsRng, Rng};
use regex::Regex;
use serde::Serialize;
use std::sync::OnceLock;
use tauri_plugin_dialog::DialogExt;

const MAX_DICE: usize = 1_000;
const MAX_SIDES: u32 = 1_000_000;
const MAX_ABS_MODIFIER: i64 = 1_000_000_000;
const MAX_EXPORT_BYTES: usize = 6_000_000;
const MAX_EXPORT_FILENAME_BYTES: usize = 160;
const UINT32_RANGE: u64 = 0x1_0000_0000;
const SEEDED_FALLBACK_STATE: u32 = 0x9e37_79b9;

#[derive(Debug, Clone, Copy)]
enum SelectionKind {
    KeepHighest,
    KeepLowest,
    DropHighest,
    DropLowest,
}

#[derive(Debug, Clone)]
struct Selection {
    kind: SelectionKind,
    count: usize,
}

#[derive(Debug, Clone)]
struct Expression {
    count: usize,
    sides: u32,
    modifier: i64,
    selection: Option<Selection>,
    normalized: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct DieRoll {
    value: u32,
    kept: bool,
    index: usize,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct NativeRollResult {
    expression: String,
    total: i64,
    dice: Vec<DieRoll>,
    modifier: i64,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
struct ExportSpec {
    filter_name: &'static str,
    extension: &'static str,
}

#[derive(Debug, Clone)]
struct SeededRandomSource {
    state: u32,
}

impl SeededRandomSource {
    fn new(seed: &str) -> Self {
        let hash = hash_seed(seed);
        Self {
            state: if hash == 0 {
                SEEDED_FALLBACK_STATE
            } else {
                hash
            },
        }
    }

    fn next_int(&mut self, max_exclusive: u32) -> u32 {
        debug_assert!(max_exclusive > 0);
        let mut x = self.state;
        x ^= x << 13;
        x ^= x >> 17;
        x ^= x << 5;
        self.state = x;
        ((u64::from(self.state) * u64::from(max_exclusive)) / UINT32_RANGE) as u32
    }
}

#[tauri::command]
fn roll_expression(
    expression: String,
    mode: String,
    seed: Option<String>,
) -> Result<NativeRollResult, String> {
    let parsed = parse_expression(&expression)?;
    match mode.as_str() {
        "secure" => {
            let mut rng = OsRng;
            Ok(roll_with_rng(&parsed, &mut rng))
        }
        "seeded" => {
            let seed_text = seed.unwrap_or_else(|| "dicelab".to_string());
            let mut rng = SeededRandomSource::new(&seed_text);
            Ok(roll_with_seeded_rng(&parsed, &mut rng))
        }
        _ => Err("Random mode must be either 'secure' or 'seeded'.".to_string()),
    }
}

#[tauri::command]
async fn save_text_export(
    app: tauri::AppHandle,
    filename: String,
    contents: String,
    format: String,
) -> Result<bool, String> {
    let spec = validate_export_request(&filename, &contents, &format)?;
    let selected = app
        .dialog()
        .file()
        .set_title("Save DiceLab export")
        .set_file_name(filename)
        .add_filter(spec.filter_name, &[spec.extension])
        .blocking_save_file();

    let Some(file_path) = selected else {
        return Ok(false);
    };
    let path = file_path
        .into_path()
        .map_err(|_| "DiceLab could not resolve the selected file path.".to_string())?;
    std::fs::write(path, contents.as_bytes())
        .map_err(|_| "DiceLab could not save the selected file.".to_string())?;
    Ok(true)
}

fn validate_export_request(filename: &str, contents: &str, format: &str) -> Result<ExportSpec, String> {
    if filename.is_empty()
        || filename.len() > MAX_EXPORT_FILENAME_BYTES
        || filename
            .chars()
            .any(|character| character.is_control() || matches!(character, '/' | '\\'))
    {
        return Err("Export filename is invalid.".to_string());
    }
    if contents.len() > MAX_EXPORT_BYTES {
        return Err(format!(
            "Export is larger than the supported {MAX_EXPORT_BYTES} byte limit."
        ));
    }

    let spec = match format {
        "csv" => ExportSpec {
            filter_name: "CSV",
            extension: "csv",
        },
        "json" => ExportSpec {
            filter_name: "JSON",
            extension: "json",
        },
        _ => return Err("Export format must be either 'csv' or 'json'.".to_string()),
    };

    let expected_suffix = format!(".{}", spec.extension);
    if !filename.to_ascii_lowercase().ends_with(&expected_suffix) {
        return Err(format!(
            "Export filename must end with {expected_suffix}."
        ));
    }

    Ok(spec)
}

fn parse_expression(input: &str) -> Result<Expression, String> {
    static PATTERN: OnceLock<Regex> = OnceLock::new();
    let regex = PATTERN.get_or_init(|| {
        Regex::new(r"(?i)^\s*(\d*)d(\d+)(?:(kh|kl|dh|dl)(\d+))?\s*([+-]\s*\d+)?\s*$")
            .expect("dice expression regex must compile")
    });
    let captures = regex
        .captures(input)
        .ok_or_else(|| "Use an expression such as 2d6+3, 4d6kh3, or 1d20.".to_string())?;

    let raw_count = captures.get(1).map_or("", |item| item.as_str());
    let count = if raw_count.is_empty() {
        1
    } else {
        raw_count
            .parse::<usize>()
            .map_err(|_| "Dice count is invalid.".to_string())?
    };
    let sides = captures[2]
        .parse::<u32>()
        .map_err(|_| "Side count is invalid.".to_string())?;
    let modifier = captures
        .get(5)
        .map(|item| item.as_str().replace(char::is_whitespace, ""))
        .map_or(Ok(0_i64), |item| {
            item.parse::<i64>()
                .map_err(|_| "Modifier is invalid.".to_string())
        })?;

    if !(1..=MAX_DICE).contains(&count) {
        return Err(format!("Dice count must be between 1 and {MAX_DICE}."));
    }
    if !(2..=MAX_SIDES).contains(&sides) {
        return Err(format!("Sides must be between 2 and {MAX_SIDES}."));
    }
    if !(-MAX_ABS_MODIFIER..=MAX_ABS_MODIFIER).contains(&modifier) {
        return Err(format!(
            "Modifier magnitude must not exceed {MAX_ABS_MODIFIER}."
        ));
    }

    let selection = match (captures.get(3), captures.get(4)) {
        (Some(raw_kind), Some(raw_count)) => {
            let selection_count = raw_count
                .as_str()
                .parse::<usize>()
                .map_err(|_| "Keep/drop count is invalid.".to_string())?;
            let kind = match raw_kind.as_str().to_ascii_lowercase().as_str() {
                "kh" => SelectionKind::KeepHighest,
                "kl" => SelectionKind::KeepLowest,
                "dh" => SelectionKind::DropHighest,
                "dl" => SelectionKind::DropLowest,
                _ => return Err("Unknown keep/drop operation.".to_string()),
            };
            let is_keep = matches!(kind, SelectionKind::KeepHighest | SelectionKind::KeepLowest);
            if selection_count == 0
                || (is_keep && selection_count > count)
                || (!is_keep && selection_count >= count)
            {
                return Err(if is_keep {
                    "Keep count must be between 1 and the number of dice.".to_string()
                } else {
                    "Drop count must leave at least one die.".to_string()
                });
            }
            Some(Selection {
                kind,
                count: selection_count,
            })
        }
        _ => None,
    };

    let selection_text = selection.as_ref().map_or(String::new(), |item| {
        let code = match item.kind {
            SelectionKind::KeepHighest => "kh",
            SelectionKind::KeepLowest => "kl",
            SelectionKind::DropHighest => "dh",
            SelectionKind::DropLowest => "dl",
        };
        format!("{code}{}", item.count)
    });
    let modifier_text = match modifier.cmp(&0) {
        std::cmp::Ordering::Greater => format!("+{modifier}"),
        std::cmp::Ordering::Less => modifier.to_string(),
        std::cmp::Ordering::Equal => String::new(),
    };

    Ok(Expression {
        count,
        sides,
        modifier,
        selection,
        normalized: format!("{count}d{sides}{selection_text}{modifier_text}"),
    })
}

#[cfg(feature = "fuzzing")]
pub fn fuzz_parse_expression(input: &str) {
    if let Ok(first) = parse_expression(input) {
        let normalized = first.normalized.clone();
        let second = parse_expression(&normalized).expect("normalized parser output must parse again");
        assert_eq!(second.normalized, normalized);
        assert_eq!(second.count, first.count);
        assert_eq!(second.sides, first.sides);
        assert_eq!(second.modifier, first.modifier);
    }
}

fn roll_with_rng<R: Rng + ?Sized>(expression: &Expression, rng: &mut R) -> NativeRollResult {
    let values: Vec<u32> = (0..expression.count)
        .map(|_| rng.gen_range(1..=expression.sides))
        .collect();
    roll_from_values(expression, values)
}

fn roll_with_seeded_rng(
    expression: &Expression,
    rng: &mut SeededRandomSource,
) -> NativeRollResult {
    let values: Vec<u32> = (0..expression.count)
        .map(|_| rng.next_int(expression.sides) + 1)
        .collect();
    roll_from_values(expression, values)
}

fn roll_from_values(expression: &Expression, values: Vec<u32>) -> NativeRollResult {
    let kept = select_kept(&values, expression.selection.as_ref());
    let dice: Vec<DieRoll> = values
        .into_iter()
        .enumerate()
        .map(|(index, value)| DieRoll {
            value,
            kept: kept[index],
            index,
        })
        .collect();
    let subtotal: i64 = dice
        .iter()
        .filter(|die| die.kept)
        .map(|die| i64::from(die.value))
        .sum();

    NativeRollResult {
        expression: expression.normalized.clone(),
        total: subtotal + expression.modifier,
        dice,
        modifier: expression.modifier,
    }
}

fn select_kept(values: &[u32], selection: Option<&Selection>) -> Vec<bool> {
    let Some(selection) = selection else {
        return vec![true; values.len()];
    };

    let mut ranked: Vec<(usize, u32)> = values.iter().copied().enumerate().collect();
    ranked.sort_by_key(|(index, value)| (*value, *index));

    match selection.kind {
        SelectionKind::KeepLowest => {
            let mut kept = vec![false; values.len()];
            ranked
                .iter()
                .take(selection.count)
                .for_each(|(index, _)| kept[*index] = true);
            kept
        }
        SelectionKind::KeepHighest => {
            let mut kept = vec![false; values.len()];
            ranked
                .iter()
                .rev()
                .take(selection.count)
                .for_each(|(index, _)| kept[*index] = true);
            kept
        }
        SelectionKind::DropLowest => {
            let mut kept = vec![true; values.len()];
            ranked
                .iter()
                .take(selection.count)
                .for_each(|(index, _)| kept[*index] = false);
            kept
        }
        SelectionKind::DropHighest => {
            let mut kept = vec![true; values.len()];
            ranked
                .iter()
                .rev()
                .take(selection.count)
                .for_each(|(index, _)| kept[*index] = false);
            kept
        }
    }
}

fn hash_seed(seed: &str) -> u32 {
    let mut hash = 0x811c_9dc5_u32;
    for byte in seed.as_bytes() {
        hash ^= u32::from(*byte);
        hash = hash.wrapping_mul(0x0100_0193);
    }
    hash
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![roll_expression, save_text_export])
        .run(tauri::generate_context!())
        .expect("error while running DiceLab");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_keep_highest_expression() {
        let expression = parse_expression("4d6kh3 + 2").expect("expression should parse");
        assert_eq!(expression.count, 4);
        assert_eq!(expression.sides, 6);
        assert_eq!(expression.modifier, 2);
        assert_eq!(expression.normalized, "4d6kh3+2");
    }

    #[test]
    fn rejects_drop_all_dice() {
        assert!(parse_expression("2d6dl2").is_err());
    }

    #[test]
    fn rejects_extreme_modifier_without_overflow() {
        assert!(parse_expression("1d6-9223372036854775808").is_err());
    }

    #[test]
    fn keep_highest_marks_exact_count() {
        let expression = parse_expression("4d6kh3").expect("expression should parse");
        let kept = select_kept(&[2, 6, 4, 1], expression.selection.as_ref());
        assert_eq!(kept, vec![true, true, true, false]);
    }

    #[test]
    fn seeded_rng_matches_web_reference_vector() {
        let mut rng = SeededRandomSource::new("reproducible");
        let values = [
            rng.next_int(20) + 1,
            rng.next_int(20) + 1,
            rng.next_int(20) + 1,
            rng.next_int(6) + 1,
        ];
        assert_eq!(values, [2, 19, 10, 6]);
    }

    #[test]
    fn seed_hash_matches_web_utf8_reference() {
        assert_eq!(hash_seed("reproducible"), 2_201_898_953);
        assert_eq!(hash_seed("🎲 DiceLab"), 1_755_545_114);
    }

    #[test]
    fn seeded_rolls_are_reproducible() {
        let expression = parse_expression("3d20+5").expect("expression should parse");
        let mut first_rng = SeededRandomSource::new("reproducible");
        let mut second_rng = SeededRandomSource::new("reproducible");
        let first = roll_with_seeded_rng(&expression, &mut first_rng);
        let second = roll_with_seeded_rng(&expression, &mut second_rng);
        let first_values: Vec<_> = first.dice.iter().map(|die| die.value).collect();
        let second_values: Vec<_> = second.dice.iter().map(|die| die.value).collect();
        assert_eq!(first_values, vec![2, 19, 10]);
        assert_eq!(first_values, second_values);
        assert_eq!(first.total, 36);
        assert_eq!(first.total, second.total);
    }

    #[test]
    fn validates_native_export_formats_and_extensions() {
        assert_eq!(
            validate_export_request("dicelab-rolls.csv", "a,b\n1,2\n", "csv"),
            Ok(ExportSpec {
                filter_name: "CSV",
                extension: "csv"
            })
        );
        assert_eq!(
            validate_export_request("dicelab-backup.JSON", "{}\n", "json"),
            Ok(ExportSpec {
                filter_name: "JSON",
                extension: "json"
            })
        );
    }

    #[test]
    fn rejects_unsafe_native_export_requests() {
        assert!(validate_export_request("../rolls.csv", "data", "csv").is_err());
        assert!(validate_export_request("folder\\rolls.csv", "data", "csv").is_err());
        assert!(validate_export_request("rolls.txt", "data", "csv").is_err());
        assert!(validate_export_request("rolls.csv", "data", "txt").is_err());
        assert!(validate_export_request("", "data", "csv").is_err());
    }

    #[test]
    fn rejects_oversized_native_exports() {
        let oversized = "x".repeat(MAX_EXPORT_BYTES + 1);
        assert!(validate_export_request("rolls.csv", &oversized, "csv").is_err());
    }

    #[test]
    fn generated_valid_expressions_round_trip_normalization() {
        let selection_codes = ["kh", "kl", "dh", "dl"];
        for sample in 1_usize..=500 {
            let count = (sample % 30) + 1;
            let sides = ((sample * 17) % 99) + 2;
            let modifier = ((sample as i64 * 7_919) % 2_001) - 1_000;
            let selection_code = selection_codes[sample % selection_codes.len()];
            let is_keep = matches!(selection_code, "kh" | "kl");
            let maximum_selection = if is_keep {
                count
            } else {
                count.saturating_sub(1)
            };
            let selection_text = if maximum_selection == 0 {
                String::new()
            } else {
                format!(
                    "{selection_code}{}",
                    (sample % maximum_selection) + 1
                )
            };
            let modifier_text = match modifier.cmp(&0) {
                std::cmp::Ordering::Greater => format!("+{modifier}"),
                std::cmp::Ordering::Less => modifier.to_string(),
                std::cmp::Ordering::Equal => String::new(),
            };
            let input = format!("{count}d{sides}{selection_text}{modifier_text}");

            let first = parse_expression(&input).expect("generated expression should parse");
            let second = parse_expression(&first.normalized).expect("normalized expression should parse");
            assert_eq!(second.normalized, first.normalized);
            assert_eq!(second.count, first.count);
            assert_eq!(second.sides, first.sides);
            assert_eq!(second.modifier, first.modifier);
        }
    }

    #[test]
    fn adversarial_parser_corpus_is_rejected_without_panics() {
        let corpus = [
            "",
            " ",
            "dice",
            "d",
            "d0",
            "d1",
            "0d6",
            "1001d6",
            "1d1000001",
            "2d6kh0",
            "2d6kh3",
            "2d6kl3",
            "2d6dh2",
            "2d6dl2",
            "1d6+1000000001",
            "1d6-1000000001",
            "1d6+9223372036854775808",
            "184467440737095516160d6",
            "1d42949672960",
            "1d6kh999999999999999999999",
            "1d6\0+1",
            "🎲",
            "٢d٦",
            "1d6 + + 2",
            "1d6 -- 2",
            "1d6kz1",
            "1d6kh1 trailing",
            "prefix 1d6",
            "1e6d6",
            "-1d6",
        ];

        for input in corpus {
            assert!(
                parse_expression(input).is_err(),
                "adversarial input unexpectedly parsed: {input:?}"
            );
        }
    }
}
