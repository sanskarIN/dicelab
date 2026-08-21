# Accessibility

DiceLab treats accessibility as a product requirement rather than a release polish task across desktop, mobile, and browser targets.

## Current design commitments

- Full core desktop/web workflows are reachable with a keyboard.
- Mobile core workflows are designed for direct touch without requiring a hardware keyboard.
- Interactive controls use native buttons, inputs, selects, and links where possible.
- Visible focus styles are provided globally.
- A skip link moves keyboard users directly to main content.
- Roll results do not rely on color alone: dropped dice also use reduced opacity and strike-through treatment.
- Errors use text and `aria-invalid`/live regions rather than color alone.
- Light and dark themes use shared semantic tokens.
- Reduced-motion mode disables decorative animation and honors the operating-system preference.
- Coarse-pointer/mobile interactive controls use at least 44px minimum target height where the shared component does not already exceed it.
- Mobile content, bottom navigation, and modal overlays account for `safe-area-inset-*` so notches, rounded corners, and home indicators do not cover required controls.
- The mobile root uses dynamic viewport height behavior to better tolerate browser/native system UI changes.
- Main navigation exposes `aria-current` for the active view.
- Dice results and important state changes are announced through appropriate live regions.
- The command-palette trigger declares dialog intent with `aria-haspopup="dialog"` and advertises the `Control+K` / `Meta+K` shortcuts through `aria-keyshortcuts`.
- The command palette moves focus into the modal, traps Tab/Shift+Tab within it, supports Escape, and restores focus to the invoking control when closed.
- First-run onboarding exposes modal semantics, an accessible description, and initial focus on the primary action.

## Keyboard map

| Shortcut | Action |
| --- | --- |
| `Ctrl/Cmd + K` | Open/close quick actions |
| `Escape` | Close quick actions |
| `Enter` | Submit focused forms / run first filtered quick action |
| `Tab` / `Shift+Tab` | Move through interactive controls; modal dialogs wrap focus internally |

Do not add shortcuts that conflict with typing inside inputs or common browser/OS commands.

Mobile users must not be forced to discover or use these shortcuts for core product functionality.

## Touch and mobile layout

`src/mobile.css` adds the mobile-specific accessibility/ergonomic layer after shared styles.

Release review must verify at least:

- top content is not hidden behind a notch/status area;
- the bottom navigation remains above home/system gesture areas;
- modal controls remain reachable inside safe areas;
- 44px coarse-pointer target rules are not overridden by later CSS;
- portrait and landscape orientations preserve required actions;
- dynamic viewport changes do not hide form submit/confirmation controls;
- Android and iOS system file pickers can be opened/cancelled/returned from without leaving focus or UI state unusable;
- Android/iPhone/iPad screen-reader navigation exposes meaningful control names and status changes.

The CSS rules are a baseline, not proof that every physical device is correct. Physical-device evidence is part of the 2.0.12 release gate.

## Motion

Two settings are available:

- **Reduced motion:** disables non-essential transitions and animation.
- **Dice animations:** allows subtle result transitions only when reduced motion is off.

Persisted and imported settings normalize `animations` to `false` whenever reduced motion is enabled, preventing contradictory state after corrupted storage or backup restore. CSS also honors `prefers-reduced-motion: reduce` independently of the app setting.

This behavior should be checked on desktop and representative Android/iOS devices because operating-system motion preferences can interact with the embedded webview differently across targets.

## Semantics

Prefer semantic HTML before ARIA. Use ARIA only to fill a real accessibility gap. Avoid replacing native buttons with clickable `div` elements.

Modal dialogs must:

- have an accessible name;
- expose `aria-modal="true"` where interaction outside the dialog is unavailable;
- move focus to a sensible first control for keyboard users;
- keep keyboard focus inside the modal while open;
- restore focus to the invoking control when a dismissible modal closes.

Touch-only operation must remain possible even where keyboard focus-management behavior exists.

## Automated coverage

Vitest + Testing Library currently checks:

- command-palette initial focus, backwards focus wrapping, Escape dismissal, focus restoration, filtering, and Enter activation;
- onboarding dialog name/description and primary-action focus;
- reduced-motion Settings behavior;
- Settings → About navigation through the application integration suite;
- responsive application behavior exercised by component/integration tests where DOM semantics are platform-independent.

A dependency-free repository accessibility contract is also part of `scripts/check-policy-boundaries.mjs`. It protects high-value semantics that should not silently disappear during refactors, including:

- the localized skip link and `#main-content` landmark;
- active-navigation `aria-current` semantics;
- command-palette trigger dialog/shortcut metadata;
- roll-result live-region and validation announcement semantics;
- command-palette dialog naming, focus restoration, and Tab containment;
- onboarding modal naming/description/initial focus;
- Settings status/toggle/file-input semantics;
- visible focus indicators and skip-link reveal styling.

Use these commands for the focused contract:

```bash
npm run policy:accessibility:test
npm run policy:accessibility
```

The accessibility contract is also included in the canonical aggregate policy audit, so `npm run policy:boundaries`, `npm run policy:test`, and release-facing `npm run policy:all` coverage protect the same boundary. Normal CI and the dependency-free repository-audit workflow execute the focused accessibility checks before dependency installation.

Normal CI also compiles Android and an iOS simulator target so mobile platform integration breakage can be caught at build time.

These automated checks guard source-level invariants, DOM semantics, keyboard state, and build integration. They do not replace real-browser accessibility trees, screen-reader testing, touch testing, color/contrast review, text scaling, or physical-device safe-area review.

## Manual release checklist

For each release candidate:

1. Navigate onboarding and every desktop/web main view using only a keyboard.
2. Verify modal focus stays inside the command palette and returns to its trigger after closing.
3. Check focus remains visible in light and dark themes.
4. Zoom/scaled-text test to 200% where supported and verify content remains usable without hiding required controls.
5. Test reduced motion with both the application preference and operating-system preference.
6. Review form labels, errors, and status messages with a screen reader.
7. Verify links have meaningful text out of context.
8. Confirm destructive actions require deliberate intent.
9. Check that charts/distributions have a textual interpretation or labels.
10. Check contrast for primary, muted, danger, success, borders, and focus indicators.
11. Verify touch targets on Android/iPhone/iPad layouts.
12. Verify Android portrait and landscape layouts on a physical supported device.
13. Verify iPhone portrait/landscape and notch/home-indicator safe areas.
14. Verify iPad portrait/landscape, tablet spacing, and safe areas.
15. Complete a core touch journey on Android and iOS without relying on a hardware keyboard.
16. Complete representative Android and iOS screen-reader journeys.
17. Open/cancel/complete native export pickers and verify returning to DiceLab leaves controls reachable.
18. Review English and Hindi layouts on representative phone/tablet sizes for clipping/overlap.

Record exact device/OS details in [`release-candidate-evidence-template.md`](release-candidate-evidence-template.md).

## 2.0.12 accessibility release gate

The cross-platform UI implementation and executable source-level accessibility contract are present, including safe-area, coarse-pointer, dialog, live-region, focus, and shortcut semantics. The following remain evidence-gated before the 2.0.12 candidate can be approved:

- observed Android touch/screen-reader/layout review;
- observed iPhone touch/screen-reader/safe-area review;
- observed iPad tablet/orientation review;
- observed desktop keyboard/screen-reader/200% scaling review;
- real candidate screenshots proving representative layouts;
- any corrective regression tests required by findings from those reviews.

Automated accessibility checks supplement this matrix, but they do not replace manual screen-reader, keyboard, touch, and physical-device review.

## Reporting accessibility issues

Open a GitHub issue for non-sensitive accessibility bugs or contact `supportramsandesh@gmail.com` if public reporting would expose private information.
