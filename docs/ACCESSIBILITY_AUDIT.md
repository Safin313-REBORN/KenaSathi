# Accessibility review

**Review date:** 5 November 2026. This is a focused review, not a certified WCAG conformance audit.

## Confirmed and addressed

- Intake wizard now exposes a labelled modal dialog, closes with Escape, traps Tab navigation, and returns focus to its opener.
- Document search and document-type select controls have accessible names.
- Quick search exposes a labelled modal and query field, contains keyboard focus, uses semantic result buttons, closes with Escape, and returns focus to its invoking control (including the mobile menu trigger).
- Mobile masthead spacing was adjusted after 125% text scaling caused horizontal overflow. At a 390×844 viewport with largest text enabled, measured document width was 382px and viewport width 390px.
- Accessibility settings provide text scaling, high contrast, reduced motion, and link underlining. Manual review covered toggling and reset behavior.
- Shared button, input, and select sizing now uses a 44px minimum target height; keyboard focus is reinforced globally even when a component resets its outline.
- At 390×844, the case privacy notice stacks its identifier below the explanatory text so long demo IDs do not push beyond the phone card. The intake dialog's step strip scrolls horizontally while fields remain full-width.

## Remaining limits

- No screen-reader testing across browser/OS combinations was completed.
- The entire interface has not been measured against every WCAG 2.2 criterion, including all color pairs and every interactive target.
- This was a visual and keyboard spot check of representative workflows, not an exhaustive screen-by-screen assistive-technology review.

See `ACCEPTANCE_MATRIX.md` for tested routes and `IMPECCABLE_DETECT.md` for the detector result.
