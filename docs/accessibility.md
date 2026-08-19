# Accessibility

DiceLab treats accessibility as a product requirement rather than a release polish task.

## Current design commitments

- Full core workflows are reachable with a keyboard.
- Interactive controls use native buttons, inputs, selects, and links where possible.
- Visible focus styles are provided globally.
- A skip link moves keyboard users directly to main content.
- Roll results do not rely on color alone: dropped dice also use reduced opacity and strike-through treatment.
- Errors use text and `aria-invalid`/live regions rather than color alone.
- Light and dark themes use shared semantic tokens.
- Reduced-motion mode disables decorative animation and honors the operating-system preference.
- Mobile controls use comfortable target sizes.
- Main navigation exposes `aria-current` for the active view.
- Dice results and important state changes are announced through appropriate live regions.
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

## Motion

Two settings are available:

- **Reduced motion:** disables non-essential transitions and animation.
- **Dice animations:** allows subtle result transitions only when reduced motion is off.

Persisted and imported settings normalize `animations` to `false` whenever reduced motion is enabled, preventing contradictory state after corrupted storage or backup restore. CSS also honors `prefers-reduced-motion: reduce` independently of the app setting.

## Semantics

Prefer semantic HTML before ARIA. Use ARIA only to fill a real accessibility gap. Avoid replacing native buttons with clickable `div` elements.

Modal dialogs must:

- have an accessible name;
- expose `aria-modal="true"` where interaction outside the dialog is unavailable;
- move focus to a sensible first control;
- keep keyboard focus inside the modal while open;
- restore focus to the invoking control when a dismissible modal closes.

## Automated coverage

Vitest + Testing Library currently checks:

- command-palette initial focus, backwards focus wrapping, Escape dismissal, focus restoration, filtering, and Enter activation;
- onboarding dialog name/description and primary-action focus;
- reduced-motion Settings behavior;
- Settings → About navigation through the application integration suite.

These tests guard DOM semantics and keyboard state. They do not replace real-browser accessibility trees or screen-reader testing.

## Manual release checklist

For each release candidate:

1. Navigate onboarding and every main view using only a keyboard.
2. Verify modal focus stays inside the command palette and returns to its trigger after closing.
3. Check focus remains visible in light and dark themes.
4. Zoom the web UI to 200% and verify content remains usable without horizontal page scrolling at common viewport sizes.
5. Test reduced motion with both the application preference and operating-system preference.
6. Review form labels, errors, and status messages with a screen reader.
7. Verify links have meaningful text out of context.
8. Confirm destructive actions require deliberate intent.
9. Check that charts/distributions have a textual interpretation or labels.
10. Check contrast for primary, muted, danger, success, borders, and focus indicators.
11. Verify touch targets on narrow/mobile layouts.

## Pre-1.0 accessibility roadmap

Add real-browser automated accessibility scanning and E2E keyboard journeys before 1.0. Automated scans supplement, but do not replace, manual screen-reader and keyboard review.

## Reporting accessibility issues

Open a GitHub issue for non-sensitive accessibility bugs or contact `supportramsandesh@gmail.com` if public reporting would expose private information.
