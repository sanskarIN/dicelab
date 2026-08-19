# Localization

DiceLab ships English first while keeping user-facing UI copy behind a typed locale catalog.

## Current locale

- Supported locale ID: `en`
- Catalog: `src/i18n/en.ts`
- Locale boundary: `src/i18n/index.ts`
- Catalog contract: `MessageCatalog`

The application does not expose a language selector until at least one complete additional locale exists. This avoids presenting a setting that has no meaningful effect.

## Adding a locale

1. Copy the structure of `src/i18n/en.ts` into a new locale file such as `src/i18n/hi.ts`.
2. Export the new catalog using `satisfies MessageCatalog` so missing/incorrect entries fail TypeScript checks.
3. Preserve placeholders and function parameters used by dynamic messages.
4. Extend `SupportedLocale` and the `catalogs` map in `src/i18n/index.ts`.
5. Add locale persistence/default-resolution logic before exposing the locale in Settings.
6. Add tests for representative static and dynamic messages.
7. Manually review narrow layouts, long translated labels, text scaling, keyboard navigation, and screen-reader names.
8. Update screenshots and documentation only after the translated UI has been reviewed in a real build.

Example shape:

```ts
import type { MessageCatalog } from './en';

export const exampleLocale = {
  // Every key from the English catalog must be present.
} satisfies MessageCatalog;
```

## What belongs in the catalog

Catalog user-visible product copy including:

- headings, labels, buttons, placeholders, helper text, empty states, and status text;
- accessibility labels that should be spoken to users;
- built-in preset names/descriptions;
- dynamic phrases such as histogram counts or truncated-result notices.

Stable technical values generally do not require translation, including dice expressions, storage keys, file extensions, URL paths, and internal IDs.

## Domain errors

Some parser/domain exceptions currently contain English user-safe messages because the product has only one locale. Before a second locale ships, replace translatable domain prose with stable error codes plus catalog mappings so core business logic remains locale-neutral.

Do not translate security or validation meaning loosely. Equivalent locale messages must preserve the same constraints and remediation guidance.

## Formatting

Do not build translated sentences by concatenating independently translated fragments when word order may vary. Prefer one catalog function that receives the required values.

Locale-sensitive numbers, dates, and times should use `Intl`/`toLocale*` APIs with the selected locale once runtime locale selection is added.

## Review checklist

- No missing catalog keys.
- No untranslated user-visible strings accidentally introduced into migrated React surfaces.
- Dynamic message functions preserve all values and units.
- Keyboard shortcuts remain understandable for the target platform/locale.
- Text expansion does not overlap or clip controls.
- Form labels and accessible names still identify the same controls.
- Support, privacy, license, and funding URLs remain correct.
- Dice notation examples remain syntactically valid and are not translated as prose.
