# Hindi localization review

This document records the repository-level review for the first non-English DiceLab message catalog.

## Locale

- Locale identifier: `hi`
- Language: Hindi
- Number/date/time formatting locale: `hi-IN`
- Source catalog: `src/i18n/en.ts`
- Reviewed catalog: `src/i18n/hi.ts`
- Presentation formatters: `src/i18n/format.ts`

## Translation principles

- Keep product and technical identifiers such as DiceLab, Rust, Tauri, TypeScript, CSV, JSON, MIT License, and dice-expression syntax unchanged.
- Translate actions and navigation labels into concise Hindi suitable for buttons and compact desktop layouts.
- Keep tabletop terms that are commonly understood as transliterated words, including रोल, डाइस, प्रीसेट, मॉडिफ़ायर, सीड, एडवांटेज, and डिसएडवांटेज, where a literal translation would be less clear.
- Preserve all interpolation parameters and numeric meanings from the English catalog.
- Preserve accessibility meaning rather than translating labels word-for-word.
- Do not translate user-created preset names, expressions, seeds, history entries, exported data, or stored identifiers.
- Use the shared locale-aware formatting boundary for displayed numeric/date/time values instead of inheriting the host browser locale independently from the selected interface language.

## Review checklist

- [x] Every English message key has a Hindi counterpart through the `MessageCatalog` type contract.
- [x] Dynamic message helpers preserve the same arguments and output meaning.
- [x] Dice syntax examples remain valid parser inputs.
- [x] Error messages remain actionable and do not expose internal implementation details.
- [x] Backup and privacy copy preserves the offline/local-data model.
- [x] Accessibility labels remain understandable without relying on icons alone.
- [x] Shared formatting helpers map Hindi presentation to `hi-IN` and English presentation to `en-US`.
- [x] Roll results use the active locale for time, total, die-value, and modifier presentation.
- [x] History uses the active locale for statistics, histogram labels, totals, die values, and timestamps.
- [x] Probability presentation uses the active locale for expected value, range, finite outcome counts, totals, and percentages.
- [x] Language selection persists through local settings.
- [x] Backup import/export preserves a supported locale while legacy schema-v1 backups default safely to English.
- [x] The document `lang` attribute follows the active locale.
- [x] Built-in presets use the active catalog without translating user-created preset copy.
- [x] Unit, component, storage/backup, and integration tests cover catalog switching, locale formatting, persistence, and the live Hindi interface.

## Exposure policy

English remains the default locale. The Settings screen exposes English and Hindi as explicit local preferences. Changing the preference switches the live message catalog, updates the document language metadata, and regenerates only built-in preset labels and descriptions. User-created names, expressions, seeds, history entries, and exported values remain unchanged.

Displayed application-generated numbers, dates, and times follow the active DiceLab locale through `src/i18n/format.ts`. This avoids a Hindi interface rendering English/host-locale grouping or timestamp conventions simply because the operating system or browser uses a different locale.

Unsupported or missing locale values in persisted settings and compatible schema-v1 backups fall back to English. Adding another locale requires extending the typed locale preference and formatter mapping, adding a complete catalog, recording a review, and adding storage/backup/interface/formatting regression coverage before exposing it in Settings.

## Future review

Before adding another locale, repeat this checklist and add a locale-specific review record. Any change to the English catalog should keep TypeScript catalog compatibility green so missing translated keys are caught during type checking. Any new locale-sensitive numeric/date/time presentation should use the shared formatting helpers rather than direct default-locale `Intl`/`toLocaleString` calls in components.
