# Responsive visual QA

**Review date:** 5 November 2026  
**Browser:** Codex in-app Chromium browser  
**Viewports:** desktop 1383×900 (browser default), tablet 768×1024, phone 390×844

This is a manual visual and interaction review of the running app. Screenshots were inspected in-browser at the listed dimensions; this note records the observed findings and fixes. It is not a pixel-by-pixel review of every content permutation, a screen-reader audit, or a WCAG conformance claim.

## Route and screen coverage

| Route / state | Desktop | Tablet | Phone | Notes |
|---|---:|---:|---:|---|
| Home / public landing page | Reviewed | Reviewed | Reviewed | Header, hero, service overview, help links, FAQ and fictional example state inspected. |
| Services directory (`?tab=services`) | Reviewed | Reviewed | Reviewed | Service actions and required/deliverable/storage details inspected; tablet details now use two columns, with three at wide desktop. |
| Purchase inspection demo (`?tab=check_purchase&demo=1`) | Reviewed | Reviewed | Reviewed | Form and evidence workflow composition inspected. |
| Cases, empty state (`?tab=cases`) | Reviewed | Reviewed | Reviewed | Empty panel fit and action sizing inspected. |
| Case workspace, demo record (`?tab=cases&case=case_demo_headphone_nondelivery`) | Reviewed | Reviewed | Reviewed | Summary, timeline, evidence, tasks, financial details, and complaint draft navigated. Long privacy-banner ID now stacks and wraps at phone width. |
| Document register (`?tab=documents&demo=1`) | Reviewed | Reviewed | Reviewed | Populated desktop table, tablet-contained horizontal table scroll, and phone stacked records inspected. |
| Guide (`?tab=guide`) | Reviewed | Reviewed | Reviewed | Directory and FAQ composition inspected. |
| New-dispute dialog (opened from header) | Not rechecked after final edits | Not rechecked after final edits | Reviewed | Form control sizing, step strip, footer actions and narrow-screen scrolling inspected on phone. |
| Accessibility settings panel | — | — | Reviewed | Controls opened on phone; 125% text sizing was checked, then preferences reset to defaults. |

## Findings and changes

- **Header density:** desktop navigation previously wrapped at medium widths. It now switches to the compact/mobile header below 1280px; the search hotkey label appears only when there is enough width. Desktop tabs remain on one line.
- **Controls:** shared buttons and text fields/selects use a 44px minimum height, consistent horizontal padding and a visible keyboard focus ring. Long button labels keep their natural width and wrap only at group level.
- **Services:** three metadata columns were crowded at tablet width. They now use two columns at tablet and three at 1280px and wider, with 14px supporting text.
- **Empty state:** excess vertical padding was reduced; the panel is narrower and its icon and heading no longer dominate the action.
- **Case privacy notice:** the long case identifier overflowed its phone card. On narrow screens, the notice stacks and the ID can break safely; at wider widths it stays inline.
- **Intake dialog:** the mobile heading and actions were tightened, the subtitle is hidden at phone width, form copy remains readable, and the multi-step strip scrolls horizontally instead of compressing step labels.
- **Documents:** the desktop/tablet table has a contained horizontal scroller; phones use stacked records. The register description now accurately says that records are stored in this browser.

## Limits

- No physical-device matrix, browser-engine comparison, screen-reader study, or exhaustive long-content permutation was performed.
- Tablet table scrolling is intentional and confined to the table wrapper; the page itself should remain within the viewport.
- Manual contrast values for every component/state pair were not computed. A high-contrast preference exists, but this review does not certify WCAG compliance.
- The visual checks covered representative routes and major states at all three sizes. The intake dialog and accessibility panel were rechecked on phone after the final modal sizing changes; they were not separately re-screenshoted at desktop/tablet after those changes.
- The local Vite app responded with HTTP 200 at `http://127.0.0.1:4173/` after the review.
