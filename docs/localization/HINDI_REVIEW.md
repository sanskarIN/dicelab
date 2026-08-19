# Hindi localization review

This document records the repository-level review for the first non-English DiceLab message catalog.

## Locale

- Locale identifier: `hi`
- Language: Hindi
- Number formatting locale: `hi-IN`
- Source catalog: `src/i18n/en.ts`
- Reviewed catalog: `src/i18n/hi.ts`

## Translation principles

- Keep product and technical identifiers such as DiceLab, Rust, Tauri, TypeScript, CSV, JSON, MIT License, and dice-expression syntax unchanged.
- Translate actions and navigation labels into concise Hindi suitable for buttons and compact desktop layouts.
- Keep tabletop terms that are commonly understood as transliterated words, including रोल, डाइस, प्रीसेट, मॉडिफ़ायर, सीड, एडवांटेज, and डिसएडवांटेज, where a literal translation would be less clear.
- Preserve all interpolation parameters and numeric meanings from the English catalog.
- Preserve accessibility meaning rather than translating labels word-for-word.
- Do not translate user-created preset names, expressions, seeds, history entries, exported data, or stored identifiers.

## Review checklist

- [x] Every English message key has a Hindi counterpart through the `MessageCatalog` type contract.
- [x] Dynamic message helpers preserve the same arguments and output meaning.
- [x] Dice syntax examples remain valid parser inputs.
- [x] Error messages remain actionable and do not expose internal implementation details.
- [x] Backup and privacy copy preserves the offline/local-data model.
- [x] Accessibility labels remain understandable without relying on icons alone.
- [x] Number-format helpers use `hi-IN` where locale-sensitive formatting is appropriate.
- [x] The default exported `messages` catalog remains English until an explicit language-selection preference is implemented.

## Exposure policy

The Hindi catalog is registered and testable through `getMessages('hi')`, but DiceLab continues to render English by default. Language selection should only be exposed after the settings persistence and document-language update paths are implemented and covered by component/integration tests.

## Future review

Before adding another locale, repeat this checklist and add a locale-specific review record. Any change to the English catalog should keep TypeScript catalog compatibility green so missing translated keys are caught during type checking.
