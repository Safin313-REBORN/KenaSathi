# কেনাসাথী (KenaSathi) — Active Component Inventory
**Document**: `/docs/COMPONENT_INVENTORY.md`
**Application**: KenaSathi Consumer Rights Assistance & Guidance Portal (কেনাসাথী)
**Snapshot**: 5 November 2026

This inventory describes source components; it is not a directory-verification, accessibility, or production-readiness report. See `ACCEPTANCE_MATRIX.md` for current review scope and limits.

---

## 1. Active Application Component Map

The KenaSathi application contains no obsolete 3D prisms, simulated forensic gauges, or abandoned prototype components. All components listed below are actively imported and rendered by `src/App.tsx`.

| Component Name | Source File | Core Role & Experience |
| :--- | :--- | :--- |
| **App** | `src/App.tsx` | Main application shell, reactive state routing, language synchronization, sub-tab coordinator, global modal triggers. |
| **Navbar** | `src/components/Navbar.tsx` | Refined 2-tier civic masthead. Mobile header streamlined with brand logo, language toggle (`বাং / EN`), primary dispute CTA (`#btn-open-new-dispute`), and hamburger menu. Secondary utilities (High Contrast, helpline 16121, tour, command palette) accessible in slide drawer with ≥44px touch targets. |
| **LandingHero** | `src/components/LandingHero.tsx` | Asymmetric editorial homepage featuring institutional introduction, national helplines (16121, 999, 16699), service rows, usage guidance, formal notices, FAQ, and a clearly identified fictional demo. |
| **ServicesView** | `src/components/ServicesView.tsx` | Numbered civic services directory (`০১` to `০৫`) detailing purpose, required information, citizen deliverables, and local browser vs optional cloud processing disclosures. |
| **PurchaseInspectionView** | `src/components/PurchaseInspectionView.tsx` | Purchase and receipt inspection workspace. Displays pricing comparison, detected evidence facts with explicit provenance badges, statutory limitation status, and neutral demo banner when `isDemo: true`. |
| **CaseWorkspaceView** | `src/components/CaseWorkspaceView.tsx` | Refined civic workspace hierarchy: 1. Case Title & ID, 2. Status badge & browser storage disclosure, 3. Next action callout banner, 4. Compact essential facts definition list (`text-xs`), 5. Dossier chapter subtabs (Summary, Timeline, Evidence, Tasks, Financial, Complaint Draft). Prominent demo banner when `isDemo: true`. |
| **ComplaintBuilder** | `src/components/ComplaintBuilder.tsx` | Citizen draft preparation workbench. Draft titled `নাগরিক পর্যালোচনার জন্য অভিযোগপত্রের খসড়া` (`Structured Complaint Draft for Citizen Review`). Features target office dropdown mapped to all 11 `DNCRP_OFFICES` (`id="complaint-target-office"`), demo watermark ribbon, neutral Section 76(4) provisions, and direct actions (Copy, Print/PDF, Open Email Draft, Open CCMS Portal). |
| **DocumentsView** | `src/components/DocumentsView.tsx` | Official evidence register table on desktop and responsive rows on mobile. Tracks `isDemo` status and renders neutral demo banner when demo records are loaded. |
| **ConsumerGuideDirectory** | `src/components/ConsumerGuideDirectory.tsx` | Legal and directory guide with 11 office records and source links. Contact details still need record-by-record rechecking before the directory can be described as fully verified. Mobile hierarchy places search input (`#guide-search-input`) immediately after heading, before helpline strip and tabs. |
| **NewDisputeModal** | `src/components/NewDisputeModal.tsx` | 5-step guided intake stepper (`১. বিরোধ`, `২. লেনদেন`, `৩. প্রমাণাদি`, `৪. অভিযোগকারী`, `৫. পর্যালোচনা`) with `min-h-[44px]` touch targets. Explicitly distinguishes Purchase Date from Cause-of-Action Date for Section 60 calculation. |
| **EmptyStateView** | `src/components/EmptyStateView.tsx` | Authentic empty state rendered when 0 cases exist in storage. Presents 3 honest paths: Record New Dispute, Explore Demonstration, or Read Consumer Guide. |
| **CommandPalette** | `src/components/CommandPalette.tsx` | Accessible keyboard-driven omnibox (`⌘K` / `Ctrl+K`) for switching cases, toggling language/contrast, and quick navigation. |
| **OnboardingModal** | `src/components/OnboardingModal.tsx` | Citizen onboarding and educational guide outlining evidence collection, Section 60 limitation periods, and optional demonstration scenarios. |
| **LoadingOverlay** | `src/components/LoadingOverlay.tsx` | Clean, non-distracting legal rule engine execution and cloud AI analysis status indicator. |

---

## 2. Decommissioned & Cleaned Legacy Components

The following obsolete, experimental, or dead prototype components have been cleanly removed from the source tree:
- `src/components/OverviewDashboard.tsx` (Removed — deleted unimported legacy component)
- `src/components/InspectionDashboard.tsx` (Removed — superseded by `PurchaseInspectionView.tsx`)
- `src/components/RiskAnalysisView.tsx` (Removed — merged into `CaseWorkspaceView.tsx`)
- `src/components/SpatialWorkspace.tsx` (Removed — legacy 3D prism component)
- `src/components/presentation-deck` (Removed — pitch deck remnants)
- `src/App.css` (Removed — unused Vite starter styles)

---

## 3. Core Supporting Services

| Service Name | Source File | Purpose |
| :--- | :--- | :--- |
| **Limitation Engine** | `src/services/limitationService.ts` | Timezone-safe (UTC+6) calculation of Section 60 30-calendar-day deadline; handles missing, boundary, and future dates without fabrication. |
| **AI & Legal Rules** | `src/services/aiService.ts` | Deterministic legal reasoning engine for CRPA 2009; evidence-driven timeline generator; multimodal Gemini 3.8 Flash caller with header auth and structured JSON. |
| **Evidence Processor** | `src/services/evidenceProcessor.ts` | Regex text pattern extraction for TrxIDs, BDT currency; client-side selectable text extraction from PDFs using `pdfjs-dist`. |
| **Storage Service** | `src/services/storageService.ts` | Local storage management; base64 dataUrl stripping to prevent quota overflow; isolated fictional demo loader with `isDemo: true`. |
| **Evidence Database** | `src/services/evidenceDb.ts` | Client-side IndexedDB binary blob store for offline receipt images and PDF documents. |
| **Speech Service** | `src/services/speechService.ts` | Accessible Web Speech API narrator for bilingual screen reading without third-party audio servers. |
