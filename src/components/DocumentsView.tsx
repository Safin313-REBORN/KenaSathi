import React, { useState } from 'react';
import {
  FolderOpen,
  ExternalLink,
  Search,
  Filter,
  Upload,
  FileText,
} from 'lucide-react';
import { ConsumerInspectionResult, EvidenceItem } from '../types/consumer';

interface DocumentsViewProps {
  cases: ConsumerInspectionResult[];
  language: 'bn' | 'en';
  onSelectCase: (caseId: string) => void;
  onOpenNewDispute: () => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  cases,
  language,
  onSelectCase,
  onOpenNewDispute,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'receipt' | 'chat_screenshot' | 'pdf'>('all');

  // Collate all evidence items across all cases with case metadata
  const allDocuments: {
    evidence: EvidenceItem;
    caseId: string;
    caseName: string;
    caseProcessingMode?: string;
    isDemo?: boolean;
  }[] = [];

  cases.forEach((c) => {
    const isCaseDemo = Boolean(c.isDemo || c.complaintDossier?.isDemo);
    (c.evidenceItems || []).forEach((ev) => {
      allDocuments.push({
        evidence: ev,
        caseId: c.id,
        caseName: c.productName || c.complaintDossier?.productName || c.id,
        caseProcessingMode: c.processingMode,
        isDemo: isCaseDemo,
      });
    });
  });

  const filteredDocs = allDocuments.filter((item) => {
    const matchesSearch =
      item.evidence.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.caseName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedFilter === 'all' || item.evidence.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  // Accurate Status Resolver
  const resolveProcessingStatus = (ev: EvidenceItem, caseProcessingMode?: string) => {
    if (ev.textExtractionStatus === 'text_extracted_from_pdf') {
      return {
        labelBn: 'টেক্সট এক্সট্রাক্টেড',
        labelEn: 'Text extracted',
        color: 'text-[#176B53] bg-[#EAF3EE] border-[#ABCFC3]',
      };
    }
    if (caseProcessingMode === 'live_ai_success') {
      return {
        labelBn: 'ঐচ্ছিক ক্লাউড এআই দ্বারা বিশ্লেষিত',
        labelEn: 'Analysed using optional cloud AI',
        color: 'text-[#176B53] bg-[#EAF3EE] border-[#ABCFC3]',
      };
    }
    if (ev.textExtractionStatus === 'ocr_not_run_in_local_mode') {
      return {
        labelBn: 'টেক্সটবিহীন স্ক্যান (প্রসেস করা হয়নি)',
        labelEn: 'Not processed (Non-selectable scan)',
        color: 'text-[#526359] bg-[#F5F7F5] border-[#DDE4DF]',
      };
    }
    if (ev.textExtractionStatus === 'unreadable') {
      return {
        labelBn: 'প্রসেসিং ব্যর্থ / অপাঠ্য',
        labelEn: 'Processing failed (Unreadable)',
        color: 'text-[#B42318] bg-rose-50 border-rose-200',
      };
    }
    return {
      labelBn: 'লোকাল ডিভাইসে সংরক্ষিত',
      labelEn: 'Saved locally',
      color: 'text-[#172B3A] bg-[#F5F7F5] border-[#DDE4DF]',
    };
  };

  const hasDemoDocuments = filteredDocs.some((d) => d.isDemo);

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto py-4 px-4 sm:px-6">
      {/* Explicit Fictional Demo Banner */}
      {hasDemoDocuments && (
        <div
          role="status"
          className="bg-[#FFF8E6] border border-[#F3D78A] text-[#7A4B04] px-4 py-2.5 rounded-md flex items-center justify-between gap-3 text-xs font-semibold shadow-xs"
        >
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#E08A00] shrink-0" />
            <span>
              {language === 'bn'
                ? 'নমুনা কাল্পনিক তথ্য — প্রকৃত অভিযোগ নয়'
                : 'Fictional demonstration data — not a real consumer complaint.'}
            </span>
          </div>
          <span className="text-xs font-mono opacity-80 uppercase tracking-wider">
            {language === 'bn' ? 'ডেমো কেস নথি' : 'Demo Documents'}
          </span>
        </div>
      )}

      {/* Header & Search Bar */}
      <div className="bg-white border border-[#DDE4DF] p-6 rounded-md space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-[#176B53] uppercase tracking-wider mb-1">
              {language === 'bn' ? 'নাগরিক প্রমাণাদি রেজিস্টার' : 'Evidence & Document Register'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#172B3A]">
              {language === 'bn' ? 'আমার নথিপত্র' : 'My Documents'}
            </h1>
            <p className="text-xs text-[#526359] mt-1">
              {language === 'bn'
                ? 'আপনার ব্রাউজারের IndexedDB-তে থাকা প্রমাণপত্রের তালিকা। ব্রাউজার স্টোরেজ এনক্রিপ্টেড ভল্ট নয়।'
                : 'Your evidence register, stored locally in this browser.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenNewDispute}
            className="ks-btn ks-btn-primary text-xs py-2 px-4 font-bold self-start sm:self-auto shrink-0"
          >
            <Upload className="w-4 h-4" />
            <span>{language === 'bn' ? 'নতুন নথি আপলোড' : 'Upload Document'}</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-[#DDE4DF]">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#526359] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'bn' ? 'নথির নাম বা বিরোধের শিরোনাম খুঁজুন...' : 'Search by file name or case title...'}
              aria-label={language === 'bn' ? 'নথির নাম বা বিরোধের শিরোনাম খুঁজুন' : 'Search documents by file name or case title'}
              className="w-full pl-9 pr-3 py-2 rounded border border-[#DDE4DF] bg-[#F5F7F5] text-xs text-[#26352E] focus:outline-none focus:border-[#176B53]"
            />
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto text-xs">
            <Filter className="w-3.5 h-3.5 text-[#526359]" />
            <select
              aria-label={language === 'bn' ? 'নথির ধরন অনুযায়ী ফিল্টার করুন' : 'Filter documents by type'}
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as typeof selectedFilter)}
              className="p-2 rounded border border-[#DDE4DF] bg-[#F5F7F5] text-xs text-[#26352E] font-medium focus:outline-none focus:border-[#176B53]"
            >
              <option value="all">{language === 'bn' ? 'সকল ধরনের নথি' : 'All Document Types'}</option>
              <option value="receipt">{language === 'bn' ? 'পেমেন্ট রসিদ' : 'Receipts'}</option>
              <option value="chat_screenshot">{language === 'bn' ? 'কথোপকথন (চ্যাট)' : 'Chat Logs'}</option>
              <option value="pdf">{language === 'bn' ? 'পিডিএফ চালান' : 'PDF Invoices'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      {filteredDocs.length > 0 ? (
        <div className="bg-white border border-[#DDE4DF] rounded-md overflow-hidden shadow-sm">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm text-[#26352E]">
              <thead className="bg-[#F5F7F5] text-[#172B3A] font-bold border-b border-[#DDE4DF] uppercase text-xs tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">{language === 'bn' ? 'নথির নাম (Document)' : 'Document'}</th>
                  <th className="py-3.5 px-4">{language === 'bn' ? 'সংশ্লিষ্ট বিরোধ (Related Case)' : 'Related Case'}</th>
                  <th className="py-3.5 px-4">{language === 'bn' ? 'ধরন (Type)' : 'Type'}</th>
                  <th className="py-3.5 px-4">{language === 'bn' ? 'সংযুক্তি তারিখ (Added On)' : 'Added On'}</th>
                  <th className="py-3.5 px-4">{language === 'bn' ? 'প্রসেসিং অবস্থা (Status)' : 'Processing Status'}</th>
                  <th className="py-3.5 px-4 text-right">{language === 'bn' ? 'পদক্ষেপ (Action)' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE4DF]">
                {filteredDocs.map(({ evidence, caseId, caseName, caseProcessingMode }) => {
                  const statusInfo = resolveProcessingStatus(evidence, caseProcessingMode);
                  return (
                    <tr key={evidence.id} className="group hover:bg-[#F2F7F4] transition-colors duration-fast">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-[#176B53] shrink-0" />
                          <div className="font-semibold text-[#172B3A] max-w-xs truncate" title={evidence.name}>
                            {evidence.name}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs text-[#526359] block truncate max-w-[200px]" title={caseName}>
                          {caseId} • {caseName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#F5F7F5] border border-[#DDE4DF]">
                          {evidence.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-[#526359]">
                        {evidence.uploadedAt?.split('T')[0] || '২০২৬-১১-০১'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold border ${statusInfo.color}`}>
                          {language === 'bn' ? statusInfo.labelBn : statusInfo.labelEn}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onSelectCase(caseId)}
                          className="text-[#176B53] font-bold group-hover:underline inline-flex items-center space-x-1 min-h-[44px]"
                        >
                          <span>{language === 'bn' ? 'বিরোধ দেখুন' : 'Open Case'}</span>
                          <ExternalLink className="w-3.5 h-3.5 transition-transform duration-standard ease-standard group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Responsive Rows View */}
          <div className="md:hidden divide-y divide-[#DDE4DF]">
            {filteredDocs.map(({ evidence, caseId, caseName, caseProcessingMode }) => {
              const statusInfo = resolveProcessingStatus(evidence, caseProcessingMode);
              return (
                <div key={evidence.id} className="p-4 space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-bold text-[#172B3A] break-all">
                      {evidence.name}
                    </div>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#F5F7F5] border border-[#DDE4DF] shrink-0">
                      {evidence.type}
                    </span>
                  </div>

                  <div className="text-xs text-[#526359] space-y-0.5">
                    <div>
                      <span>বিরোধ:</span> <span className="font-mono text-[#172B3A]">{caseId} • {caseName}</span>
                    </div>
                    <div>
                      <span>তারিখ:</span> <span className="font-mono">{evidence.uploadedAt?.split('T')[0] || '২০২৬-১১-০১'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold border ${statusInfo.color}`}>
                      {language === 'bn' ? statusInfo.labelBn : statusInfo.labelEn}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectCase(caseId)}
                      className="text-[#176B53] font-bold text-xs hover:underline inline-flex items-center space-x-1"
                    >
                      <span>{language === 'bn' ? 'বিরোধ খুলুন' : 'Open Case'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#DDE4DF] rounded-md p-12 text-center space-y-3">
          <FolderOpen className="w-8 h-8 text-[#526359] mx-auto" />
          <h2 className="text-base font-bold text-[#172B3A]">
            {language === 'bn' ? 'কোনো সংরক্ষিত নথি পাওয়া যায়নি' : 'No Documents Found'}
          </h2>
          <p className="text-xs text-[#526359] max-w-sm mx-auto leading-relaxed">
            {language === 'bn'
              ? 'আপনার অনুসন্ধানের সাথে মিলে এমন কোনো প্রমাণপত্র বা রসিদ পাওয়া যায়নি।'
              : 'No documents match your query. Upload new transaction evidence to populate your register.'}
          </p>
        </div>
      )}
    </div>
  );
};
