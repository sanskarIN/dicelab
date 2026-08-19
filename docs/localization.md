# Localization

DiceLab ships with reviewed English and Hindi interface catalogs behind a typed locale boundary. English remains the default locale.

## Current locales

- English locale ID: `en`
- Hindi locale ID: `hi`
- English catalog: `src/i18n/en.ts`
- Hindi catalog: `src/i18n/hi.ts`
- Locale boundary: `src/i18n/index.ts`
- Presentation formatting boundary: `src/i18n/format.ts`
- Catalog contract: `MessageCatalog`
- Error-to-copy mapping: `src/i18n/errors.ts`
- Hindi review record: `docs/localization/HINDI_REVIEW.md`

The Settings screen exposes the reviewed English/Hindi choice. The selected locale is stored locally, preserved in backups, applied to the document `lang` attribute, and used by shared number/date/time formatters.

## Live catalog rule

`messages` is a live exported binding whose catalog is replaced by `setLocale()`. Components that read `messages.*` during render receive the current catalog after `App` updates locale state and rerenders.

Do **not** capture translated string values into module-level constants that are created once when a module is imported. For example, avoid:

```ts
const navigation = [
  { label: messages.navigation.roll },
  { label: messages.navigation.history },
];
```

Those strings would reflect whichever locale was active when the module first evaluated and could remain stale after a live language change.

Instead, construct catalog-backed arrays/objects inside the component render or in a function called during render:

```ts
function getNavigation() {
  return [
    { label: messages.navigation.roll },
    { label: messages.navigation.history },
  ];
}
```

The same rule applies to command definitions, menu entries, accessibility labels, preset display metadata, and any other user-visible value that must update without a page reload. Technical constants that are not localized may remain module-level.

Live-switch integration coverage must include persistent shell/navigation surfaces and dialogs/menus—not only the currently selected content panel—so module-level catalog capture regressions are caught.

## Adding a locale

1. Copy the structure of `src/i18n/en.ts` into a new locale file.
2. Type the new catalog as `MessageCatalog` so missing or incorrectly shaped entries fail TypeScript checks.
3. Preserve placeholders and function parameters used by dynamic messages.
4. Extend `LocalePreference` in `src/domain/types.ts`.
5. Register the catalog in `src/i18n/index.ts`.
6. Extend the explicit locale-to-`Intl` mapping in `src/i18n/format.ts`.
7. Add the locale to Settings only after the catalog and formatting mapping are complete.
8. Verify storage normalization and schema-v1 backup compatibility for the locale.
9. Add tests for representative static/dynamic messages, validation/error mappings, number/date/time formatting, storage, backups, and live UI switching.
10. Add a locale-specific human-review record under `docs/localization/`.
11. Manually review narrow layouts, long translated labels, text scaling, keyboard navigation, screen-reader names, date/time conventions, and number grouping.
12. Update screenshots and release documentation only after the translated UI has been reviewed in a real candidate build.

Example shape:

```ts
import type { MessageCatalog } from './en';

export const exampleLocale: MessageCatalog = {
  // Every key from the English catalog must be present.
};
```

## What belongs in the catalog

Catalog user-visible product copy including:

- headings, labels, buttons, placeholders, helper text, empty states, and status text;
- accessibility labels that should be spoken to users;
- built-in preset names/descriptions;
- dynamic phrases such as histogram counts or truncated-result notices;
- parser, probability, backup, import, and export validation/status messages presented to users.

Stable technical values generally do not require translation, including dice expressions, storage keys, file extensions, URL paths, event names, and internal error codes.

User-created content must not be silently translated. Preset names created by users, seeds, expressions, history records, exported values, and identifiers retain their original values when the UI locale changes.

## Error localization contract

Domain and backup boundaries expose stable error codes plus bounded numeric context. React components do not use raw `Error.message` as their translation source.

Current code families include:

- dice parser errors such as `invalid-format`, `side-count-out-of-range`, and `drop-count-removes-all`;
- probability errors such as `unsafe-outcome-count` and `keep-drop-too-complex`;
- backup errors such as `invalid-json`, `duplicate-roll-ids`, and `invalid-random-mode`.

`src/i18n/errors.ts` maps those codes to the active catalog. Unknown/native failures use a generic localized fallback instead of displaying arbitrary thrown text.

The exception classes still carry a developer-oriented message for diagnostics/backwards compatibility, but presentation code must treat the stable code and context as the contract. This prevents a future wording change from becoming a behavioral/API change.

Do not translate security or validation meaning loosely. Equivalent locale messages must preserve the same constraints and remediation guidance. If a new code needs values such as a minimum/maximum/limit, add that value to the error context instead of parsing it back out of English prose.

## Number, date, and time formatting

Application-generated display values should follow the selected DiceLab locale, not whatever locale the host browser happens to inherit.

Use the helpers in `src/i18n/format.ts`:

- `formatInteger`
- `formatDecimal`
- `formatFixedDecimal`
- `formatDateTime`
- `formatTime`
- `getIntlLocale`

The current explicit mappings are:

- `en` → `en-US`
- `hi` → `hi-IN`

Do not call default-locale `toLocaleString()`, `Intl.NumberFormat()`, or `Intl.DateTimeFormat()` directly in a localized component unless there is a documented reason. Centralizing the mapping prevents a Hindi interface from displaying unrelated host-locale grouping/timestamps and makes presentation behavior deterministic in tests.

Raw machine-readable data remains locale-neutral. JSON backups, CSV field values, persisted ISO timestamps, expressions, identifiers, and parser inputs must not be rewritten into localized display formats.

## Dynamic translated messages

Do not build translated sentences by concatenating independently translated fragments when word order may vary. Prefer one catalog function that receives the required values.

Use formatter helpers for standalone numbers/dates/times. For a number embedded inside a translated sentence, keep sentence structure in the catalog and pass bounded values through an appropriately typed helper.

## Review checklist

- No missing catalog keys.
- No untranslated user-visible strings accidentally introduced into migrated React surfaces.
- No localized string value that needs live switching is captured in a module-level constant.
- Persistent shell/navigation/menu/dialog copy changes immediately when locale changes.
- Dynamic message functions preserve all values and units.
- Error-code mappings are exhaustive and unknown errors return the intended localized fallback.
- Active-locale number/date/time formatting uses the shared formatter boundary.
- Machine-readable exports and stored values remain locale-neutral.
- User-created content remains unchanged when switching locale.
- Keyboard shortcuts remain understandable for the target platform/locale.
- Text expansion does not overlap or clip controls.
- Form labels and accessible names still identify the same controls.
- The document `lang` attribute follows the selected locale.
- Supported locale values survive local persistence and backup round trips; unsupported values fall back safely.
- Support, privacy, license, and funding URLs remain correct.
- Dice notation examples remain syntactically valid and are not translated as prose.
