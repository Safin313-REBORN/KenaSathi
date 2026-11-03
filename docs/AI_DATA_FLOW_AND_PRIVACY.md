# KENASATHI AI — ARCHITECTURAL DATA FLOW & CITIZEN PRIVACY MANIFESTO
**Event**: Ostad Presents YUNet AIgnite Buildathon 2026  
**Document**: `/docs/AI_DATA_FLOW_AND_PRIVACY.md`  
**Classification**: System Architecture, Threat Modeling & Statutory Compliance  
**Last Updated**: November 3, 2026  

---

## 1. Privacy-by-Design Architecture Overview

KenaSathi AI (*কেনাসাথী*) is built on a **Client-First, Privacy-Preserving Architecture** engineered specifically for civic-tech and consumer dispute handling in Bangladesh.

Unlike typical cloud wrappers that pipeline raw consumer records, payment screenshots, and personal identities to centralized servers, KenaSathi AI maintains complete offline-first independence with optional, citizen-controlled ephemeral cloud assistance.

```mermaid
graph TD
    User["Bangladeshi Citizen"] -->|Uploads Receipts, Invoices & Screenshots| Device["Client Browser Sandbox"]
    
    subgraph LocalDevice["Client-Side Sandbox (100% Privacy by Default)"]
        BlobStore["IndexedDB Blob Store (kenasathi_evidence_db_v1)"]
        SanitizedStore["LocalStorage Case Metadata (Zero base64 dataUrl)"]
        PdfParser["Bounded pdfjs-dist Text Stream Parser (Max 10 pages)"]
        RegexEngine["Pattern Extractor (bKash/Nagad TrxID, BDT currency)"]
        LimitationEngine["Section 60 Limitation Engine (UTC+6 Bangladesh Time)"]
        LocalEngine["Local Deterministic Legal Rules (CRPA 2009)"]
        PiiScrubber["Client-Side PII Minimizer (sanitizePiiForCloud)"]
    end

    Device --> BlobStore
    Device --> PdfParser
    PdfParser --> RegexEngine
    RegexEngine --> LocalEngine
    LimitationEngine --> LocalEngine
    LocalEngine --> SanitizedStore

    subgraph OptionalCloud["Optional Consented Cloud Assistance (Gemini 3.8 Flash)"]
        UserConsent{"Citizen Consented & Included Files Checked?"}
        HeaderAuth["Request with x-goog-api-key Header (Never in URL Query)"]
        Gemini38["Google Gemini 3.8 Flash Multimodal API"]
        ZodValidator["Runtime Schema Validator (ModelAnalysisOutputSchema)"]
    end

    Device -.->|Only If Consented + In-Memory BYOK Provided| UserConsent
    UserConsent --> HeaderAuth
    HeaderAuth -->|Sanitized Text + Extracted PDF Streams + Selected Images| Gemini38
    Gemini38 -->|JSON Response| ZodValidator
    ZodValidator -->|Mapped Observations (model_suggested)| LocalEngine

    LocalEngine --> Redress["Structured Complaint Draft + CCMS Portal Link + 16121 Call"]
```

---

## 2. PII Scrubbing & Data Minimization Protocol

Before any free-text narrative is transmitted to an external model (such as Google Gemini 3.8 Flash), KenaSathi AI automatically executes client-side scrubbing:

```typescript
export function sanitizePiiForCloud(text: string): string {
  if (!text) return '';
  return text
    // Bangladeshi phone numbers: 017..., 018..., +8801... with spaces or hyphens
    .replace(/(?:\+?880\s*|0)?1[3-9]\d{1,2}[-\s]?\d{6,7}\b|\b01[3-9]\d{8}\b/g, '[PHONE_REDACTED]')
    // National Identity (NID) numbers: 10-digit Smart, 13-digit legacy, 17-digit birth-year prefixed
    .replace(/\b\d{10,17}\b/g, '[NID_REDACTED]')
    // Citizen email addresses
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[EMAIL_REDACTED]');
}
```

### Visual & Image Redaction Notice
For uploaded screenshots (e.g., MFS balance confirmations, courier slips, or national ID cards), users are presented with a clear pre-upload advisory:
> **গোপনীয়তা সতর্কতা**: আপলোডকৃত ছবিতে আপনার ব্যক্তিগত ফোন নম্বর, জাতীয় পরিচয়পত্র (NID) বা সংবেদনশীল ব্যাংক একাউন্ট নম্বর থাকলে তা আপলোডের পূর্বে ঢেকে বা ব্লার করে দিন। টেক্সট স্যানিটাইজার ছবির মধ্যকার লেখা স্বয়ংক্রিয়ভাবে ব্লার করে না।

In `NewDisputeModal.tsx`, users can individually check which specific evidence files to include in cloud transmission via `cloudIncludedFiles`.

---

## 3. Ephemeral In-Memory BYOK Security Architecture

1. **Zero Secret Persistence**: API keys provided for Google Gemini 3.8 Flash are held strictly in React component memory (`useState`) for the duration of the modal session.
2. **Elimination of Plaintext Storage**: Keys are never written to `localStorage`, `sessionStorage`, cookies, or browser caches.
3. **Header Authentication**: Requests target `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent` using the `x-goog-api-key: <key>` request header. Keys are never exposed in URL query parameters (`?key=...`).
4. **Transparent Evaluation Disclaimer**: The intake modal clearly informs users:
   > *"Notice: In this prototype evaluation mode, your API key is held ephemerally in browser memory and transmitted directly via secure HTTPS headers. In a production multi-tenant deployment, credentials must reside on a hardened server-side proxy with rate limiting and IP access control."*

---

## 4. Storage Decoupling & Quota Crash Prevention

To permanently eliminate browser `QuotaExceededError`:
1. **IndexedDB Blob Isolation**: Large document binaries and full-resolution images are saved into IndexedDB (`kenasathi_evidence_db_v1`, object store `evidence_blobs`).
2. **LocalStorage Sanitization**: Before serializing case metadata to `localStorage`, `sanitizeCaseForLocalStorage` strips all base64 `dataUrl` strings. The stored case holds only the unique `blobId` pointer and brief metadata snippets.
3. **Cascade Deletion**: When a user deletes a case, KenaSathi deletes both the `localStorage` metadata and the corresponding blobs from IndexedDB.

---

## 5. Honest Fact Attribution & Provenance Standards

| Data Field | Source / Trigger | Fact Status (`factStatus`) | Verification (`verified`) | Display Label |
| :--- | :--- | :--- | :--- | :--- |
| **bKash / Nagad TrxID** | Regex pattern match on statement snippet | `pattern_extracted` | `false` | প্যাটার্ন ম্যাচ (অসমর্থিত) |
| **Transaction Ref** | Citizen input in dispute form | `user_reported` | `false` | ভোক্তা কর্তৃক প্রদত্ত |
| **Paid Amount (BDT)** | Form or regex match | `user_reported` / `pattern_extracted` | `false` | দাবিকৃত ক্রয়মূল্য |
| **Section 60 Countdown** | Calculated from citizen `incidentDate` | `calculated_from_user_date` | `false` | ধারা ৬০ তামাদি মেয়াদ |
| **AI Candidate Facts** | Google Gemini 3.8 Flash inference | `model_suggested` | `false` | এআই প্রস্তাবিত পর্যবেক্ষণ |
| **Bank / Gateway Confirmation**| Future external API (not in prototype) | `externally_verified` | `true` | সংস্থাগত যাচাইকৃত |

Under no circumstances does KenaSathi AI mark an unverified pattern match or user statement as `verified: true` or claim that an AI draft constitutes a "court-admissible verdict".
