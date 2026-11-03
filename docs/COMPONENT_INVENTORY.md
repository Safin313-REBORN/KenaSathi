# কেনাসাথী (KenaSathi) — Active Component Inventory
**Document**: `/docs/COMPONENT_INVENTORY.md`  
**Application**: KenaSathi Consumer Rights Assistance & Guidance Portal  
**Version**: 4.0.0 (Official Institutional Public Service Architecture)  
**Verification Date**: November 3, 2026  

---

## 1. Active Application Component Map

The KenaSathi application contains no obsolete 3D prisms, simulated forensic gauges, or abandoned prototype components. All components listed below are actively imported and rendered by `src/App.tsx`.

| Component Name | Source File | Core Role & Experience |
| :--- | :--- | :--- |
| **App** | `src/App.tsx` | Main application shell, reactive state routing, language synchronization, sub-tab coordinator, global modal triggers. |
| **Navbar** | `src/components/Navbar.tsx` | Official civic header featuring slim top utility bar (helpline 16121, language switch, high contrast), institutional masthead with clean brand mark, and 5 citizen-facing navigation workspaces. |
| **LandingHero** | `src/components/LandingHero.tsx` | Professional public-service homepage featuring 2-column introduction, verified national helplines (16121, 999, 16430, ccms.dncrp.com), 4 structured service rows, 3-step usage rules, formal notices, accordion FAQ, and clearly identified fictional demo. |
| **ServicesView** | `src/components/ServicesView.tsx` | Central citizen services directory presenting 5 structured public services detailing purpose, required information, citizen deliverables, and local/optional cloud processing modes. |
| **PurchaseInspectionView** | `src/components/PurchaseInspectionView.tsx` | Purchase and receipt inspection workspace. Displays pricing comparison (consideration vs MSRP), detected evidence facts with explicit provenance badges, and statutory limitation status. |
| **CaseWorkspaceView** | `src/components/CaseWorkspaceView.tsx` | Structured citizen record with desktop side navigation. Contains 6 sub-sections: Case Summary, Timeline & Limitation, Evidence Vault, Action Tasks, Financial Details, and Complaint Draft. Includes clear local storage disclosure. |
| **ComplaintBuilder** | `src/components/ComplaintBuilder.tsx` | Formal A4 complaint document generator. Prepares clean, printable draft with real uploaded attachments; provides genuine actions: Copy Complaint Draft, Print Complaint, Open Email Draft (`mailto:` to `nccc@dncrp.gov.bd`), and Open Official CCMS Portal (`https://ccms.dncrp.com/`). |
| **DocumentsView** | `src/components/DocumentsView.tsx` | Official evidence and document register table on desktop and responsive rows on mobile. Accurately distinguishes saved locally, text extracted, cloud analyzed, and unreadable files. |
| **ConsumerGuideDirectory** | `src/components/ConsumerGuideDirectory.tsx` | Educational guide to consumer rights under CRPA 2009, featuring the complete 6-division DNCRP deputy director office directory, hotlines (16121, 999, 16430), and statutory section details. |
| **NewDisputeModal** | `src/components/NewDisputeModal.tsx` | Comprehensive case intake modal. Distinguishes purchase date from cause-of-action date; renders image thumbnail previews; provides selective cloud transmission controls and image pixel privacy disclosures. |
| **EmptyStateView** | `src/components/EmptyStateView.tsx` | Authentic empty state rendered when 0 cases exist. Presents 3 honest paths: Record New Dispute, Explore Demonstration, or Read Consumer Guide. |
| **CommandPalette** | `src/components/CommandPalette.tsx` | Accessible keyboard-driven omnibox (`⌘K` / `Ctrl+K`) for switching cases, toggling language/contrast, and quick navigation. |
| **OnboardingModal** | `src/components/OnboardingModal.tsx` | Citizen onboarding and educational guide outlining evidence collection, Section 60 limitation periods, and optional demonstration scenarios. |
| **LoadingOverlay** | `src/components/LoadingOverlay.tsx` | Clean, non-distracting legal rule engine execution and cloud AI analysis status indicator. |

---

## 2. Decommissioned & Removed Components

The following obsolete, prototype, or competition-specific components have been cleanly removed from the source tree:
- `src/components/PitchDeckModal.tsx` (Removed — deleted pitch-deck presentation component)
- `src/components/InspectionDashboard.tsx` (Removed — replaced by `PurchaseInspectionView.tsx`)
- `src/components/RiskAnalysisView.tsx` (Removed — integrated into `CaseWorkspaceView.tsx`)
- `src/components/SpatialWorkspace.tsx` (Removed — obsolete CSS 3D prism unsuitable for stressed consumers)
- `src/App.css` (Removed — deleted unused Vite starter styles)

---

## 3. Core Supporting Services

| Service Name | Source File | Purpose |
| :--- | :--- | :--- |
| **Limitation Engine** | `src/services/limitationService.ts` | Timezone-safe (UTC+6) calculation of Section 60 30-calendar-day deadline; handles missing, boundary, and future dates without fabrication. |
| **AI & Legal Rules** | `src/services/aiService.ts` | Deterministic legal reasoning engine for CRPA 2009; evidence-driven timeline generator; multimodal Gemini 3.8 Flash caller with header auth and structured JSON. |
| **Evidence Processor** | `src/services/evidenceProcessor.ts` | Regex text pattern extraction for TrxIDs, BDT currency; client-side selectable text extraction from PDFs using `pdfjs-dist`. |
| **Storage Service** | `src/services/storageService.ts` | Local storage management; base64 dataUrl stripping to prevent quota overflow; isolated fictional demo loader. |
| **Evidence Database** | `src/services/evidenceDb.ts` | Client-side IndexedDB binary blob store for offline receipt images and PDF documents. |
| **Speech Service** | `src/services/speechService.ts` | Accessible Web Speech API narrator for bilingual screen reading without third-party audio servers. |
