# Product

<!-- impeccable:product-schema 1 -->

## Platform
web

## Users
- Bangladeshi consumers and online shoppers.
- Bengali-first citizens with varying levels of digital literacy.
- People experiencing online shopping disputes, non-delivery, damaged goods, or deceptive merchant practices.
- Mobile-first citizens accessing assistance primarily via smartphones on mobile networks.
- Citizens who need clear statutory guidance and formal document preparation without intimidating legal jargon.

## Product Purpose
KenaSathi (কেনাসাথী) is an independent civic consumer assistance platform. It helps citizens organize purchase evidence in browser storage, understand guidance about the Consumer Rights Protection Act, 2009 (ভোক্তা অধিকার সংরক্ষণ আইন, ২০০৯), calculate a date window under Section 60 / ধারা ৬০, and prepare structured complaint drafts for citizen review before the user submits through an official DNCRP channel.

## Positioning
An independent, privacy-respecting civic assistant that equips citizens with factual evidence organization and structured complaint drafts, operating locally in the browser with explicit consent for cloud services. It never masquerades as a government body, never files complaints without citizen agency, and never fabricates legal outcomes.

## Operating Context
- Citizens often arrive while experiencing distress or frustration over financial loss or merchant unresponsive behavior.
- Evidence materials include physical receipts, mobile screenshots (bKash/Nagad/Rocket SMS), courier receipts, and merchant chat logs.
- Dual storage architecture: lightweight metadata in localStorage, heavy binary evidence in IndexedDB, with optional consented Gemini extraction.
- Strict boundary between independent civic assistance and authoritative government channels (National Consumer Helpline 16121, National Emergency Service 999, Legal Aid Helpline 16699, and the official DNCRP complaint portal).

## Capabilities and Constraints
- Bengali-first user experience with complete English toggle across all pages.
- Authentic empty state: no sample case active on fresh start; sample demo cases must be chosen explicitly.
- Honest provenance labels: facts labeled as "User Reported" (নাগরিক প্রদত্ত), "Pattern Extracted" (প্যাটার্ন শনাক্তকরণ), "AI Extracted" (এআই নিষ্কাশিত), or "Pending Confirmation" (যাচাই প্রয়োজন).
- Statutory date calculation: precise 30-day limitation calculation under Section 60.
- Formal complaint drafting: structured A4 complaint letter generation with print/PDF export, clearly marked as a citizen-reviewable draft.
- Independent service disclosure: prominent, unequivocal notices across the website stating KenaSathi is an independent civic platform and not an official government agency.

## Brand Commitments
- Brand name: KenaSathi (কেনাসাথী).
- Category: Independent civic consumer assistance.
- Personality: Trustworthy, composed, clear, empathetic, professional, and accessible.
- Visual direction: Refined public-service editorial design, not generic SaaS or administrative dashboard design.
- Zero competition branding, event names, judging rubrics, or pitch-deck references anywhere in the codebase.

## Evidence on Hand
- Full React 18 + TypeScript + Vite single-page application.
- Current test suite: 23 passing tests covering core logic, Section 60 calculation, storage, provenance labeling, and state isolation.
- Public DNCRP hotline 16121 and complaint route were checked against official DNCRP sources; NLASO lists 16699 as a toll-free hotline. The local office directory has not been fully re-certified in this review.
- DNCRP headquarters, the National Consumer Complaint Centre, and directory records across all 8 divisions; unconfirmed contact details must remain explicitly marked.

## Product Principles
1. Clarity over Decoration: Every element must serve citizen understanding and task completion.
2. Honest Independence: Never impersonate government agencies; clearly distinguish civic guidance from official statutory actions.
3. Local-First Privacy: Citizen evidence stays on their device unless explicit consent is granted.
4. Dignity & Empathy: Support stressed citizens with clear Bengali prose, comfortable typography, and predictable workflows.
5. Structural Rigor: High contrast, accessible typography, and genuine editorial hierarchy over repetitive dashboard cards.

## Accessibility & Inclusion
- Accessibility target: WCAG 2.2 AA; no full conformance audit has been completed.
- High contrast: minimum 4.5:1 for body copy and 3:1 for large text.
- Comfortable Bengali typography with relaxed line heights for complex ligatures.
- Touch target sizes minimum 44×44px on mobile devices.
- Screen-reader labels, keyboard focus indicators, and semantic HTML structure.
