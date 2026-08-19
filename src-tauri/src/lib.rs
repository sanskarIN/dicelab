use rand::{rngs::OsRng, rngs::StdRng, Rng, SeedableRng};
use regex::Regex;
use serde::Serialize;
use std::sync::OnceLock;

const MAX_DICE: usize = 1_000;
const MAX_SIDES: u32 = 1_000_000;
const MAX_ABS_MODIFIER: i64 = 1_000_000_000;

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
            let mut rng = StdRng::seed_from_u64(hash_seed(&seed_text));
            Ok(roll_with_rng(&parsed, &mut rng))
        }
        _ => Err("Random mode must be either 'secure' or 'seeded'.".to_string()),
    }
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
    if modifier.abs() > MAX_ABS_MODIFIER {
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

fn roll_with_rng<R: Rng + ?Sized>(expression: &Expression, rng: &mut R) -> NativeRollResult {
    let values: Vec<u32> = (0..expression.count)
        .map(|_| rng.gen_range(1..=expression.sides))
        .collect();
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
            ranked.iter().take(selection.count).for_each(|(index, _)| kept[*index] = true);
            kept
        }
        SelectionKind::KeepHighest => {
            let mut kept = vec![false; values.len()];
            ranked.iter().rev().take(selection.count).for_each(|(index, _)| kept[*index] = true);
            kept
        }
        SelectionKind::DropLowest => {
            let mut kept = vec![true; values.len()];
            ranked.iter().take(selection.count).for_each(|(index, _)| kept[*index] = false);
            kept
        }
        SelectionKind::DropHighest => {
            let mut kept = vec![true; values.len()];
            ranked.iter().rev().take(selection.count).for_each(|(index, _)| kept[*index] = false);
            kept
        }
    }
}

fn hash_seed(seed: &str) -> u64 {
    let mut hash = 0xcbf29ce484222325_u64;
    for byte in seed.as_bytes() {
        hash ^= u64::from(*byte);
        hash = hash.wrapping_mul(0x100000001b3);
    }
    hash
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![roll_expression])
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
    fn keep_highest_marks_exact_count() {
        let expression = parse_expression("4d6kh3").expect("expression should parse");
        let kept = select_kept(&[2, 6, 4, 1], expression.selection.as_ref());
        assert_eq!(kept, vec![true, true, true, false]);
    }

    #[test]
    fn seeded_rolls_are_reproducible() {
        let expression = parse_expression("3d20+5").expect("expression should parse");
        let seed = hash_seed("reproducible");
        let first = roll_with_rng(&expression, &mut StdRng::seed_from_u64(seed));
        let second = roll_with_rng(&expression, &mut StdRng::seed_from_u64(seed));
        let first_values: Vec<_> = first.dice.iter().map(|die| die.value).collect();
        let second_values: Vec<_> = second.dice.iter().map(|die| die.value).collect();
        assert_eq!(first_values, second_values);
        assert_eq!(first.total, second.total);
    }
}
