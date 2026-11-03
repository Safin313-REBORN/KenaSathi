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
  }[] = [];

  cases.forEach((c) => {
    (c.evidenceItems || []).forEach((ev) => {
      allDocuments.push({
        evidence: ev,
        caseId: c.id,
        caseName: c.productName || c.complaintDossier?.productName || c.id,
        caseProcessingMode: c.processingMode,
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
        color: 'text-[#176B53] bg-[#EAF3F0] border-[#ABCFC3]',
      };
    }
    if (caseProcessingMode === 'live_ai_success') {
      return {
        labelBn: 'ঐচ্ছিক ক্লাউড এআই দ্বারা বিশ্লেষিত',
        labelEn: 'Analysed using optional cloud AI',
        color: 'text-[#176B53] bg-[#EAF3F0] border-[#ABCFC3]',
      };
    }
    if (ev.textExtractionStatus === 'ocr_not_run_in_local_mode') {
      return {
        labelBn: 'টেক্সটবিহীন স্ক্যান (প্রসেস করা হয়নি)',
        labelEn: 'Not processed (Non-selectable scan)',
        color: 'text-[#64716A] bg-[#F4F6F5] border-[#D9E0DC]',
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
      color: 'text-[#172B3A] bg-[#F4F6F5] border-[#D9E0DC]',
    };
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto py-2">
      {/* Header & Search Bar */}
      <div className="bg-white border border-[#D9E0DC] p-6 rounded-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-[#176B53] uppercase tracking-wider mb-1">
              {language === 'bn' ? 'নাগরিক প্রমাণাদি রেজিস্টার' : 'Evidence & Document Register'}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#172B3A]">
              {language === 'bn' ? 'আমার নথিপত্র' : 'My Documents'}
            </h1>
            <p className="text-xs text-[#64716A] mt-1">
              {language === 'bn'
                ? 'আপনার ব্রাউজারের নিজস্ব IndexedDB স্টোরেজে নিরাপদে সংরক্ষিত প্রমাণপত্রের তালিকা।'
                : 'Official register of evidence and transaction artifacts stored locally in your browser.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenNewDispute}
            className="ks-btn ks-btn-primary text-xs py-2 px-4 font-bold self-start sm:self-auto shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'নতুন নথি আপলোড' : 'Upload Document'}</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-[#E8ECE9]">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#8A9790] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'bn' ? 'নথির নাম বা বিরোধের শিরোনাম খুঁজুন...' : 'Search by file name or case title...'}
              className="w-full pl-9 pr-3 py-2 rounded border border-[#D9E0DC] bg-[#F4F6F5] text-xs text-[#26352E] focus:outline-none focus:border-[#176B53]"
            />
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto text-xs">
            <Filter className="w-3.5 h-3.5 text-[#64716A]" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as typeof selectedFilter)}
              className="p-2 rounded border border-[#D9E0DC] bg-[#F4F6F5] text-xs text-[#26352E] font-medium focus:outline-none focus:border-[#176B53]"
            >
              <option value="all">{language === 'bn' ? 'সকল ধরনের নথি' : 'All Document Types'}</option>
              <option value="receipt">{language === 'bn' ? 'পেমেন্ট রসিদ' : 'Receipts'}</option>
              <option value="chat_screenshot">{language === 'bn' ? 'কথোপকথন (চ্যাট)' : 'Chat Logs'}</option>
              <option value="pdf">{language === 'bn' ? 'পিডিএফ চালান' : 'PDF Invoices'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Professional Desktop Table */}
      {filteredDocs.length > 0 ? (
        <div className="bg-white border border-[#D9E0DC] rounded-lg overflow-hidden shadow-sm">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-[#26352E]">
              <thead className="bg-[#F4F6F5] text-[#172B3A] font-bold border-b border-[#D9E0DC] uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">{language === 'bn' ? 'নথির নাম (Document)' : 'Document'}</th>
                  <th className="py-3 px-4">{language === 'bn' ? 'সংশ্লিষ্ট বিরোধ (Related Case)' : 'Related Case'}</th>
                  <th className="py-3 px-4">{language === 'bn' ? 'ধরন (Type)' : 'Type'}</th>
                  <th className="py-3 px-4">{language === 'bn' ? 'সংযুক্তি তারিখ (Added On)' : 'Added On'}</th>
                  <th className="py-3 px-4">{language === 'bn' ? 'প্রসেসিং অবস্থা (Status)' : 'Processing Status'}</th>
                  <th className="py-3 px-4 text-right">{language === 'bn' ? 'পদক্ষেপ (Action)' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8ECE9]">
                {filteredDocs.map(({ evidence, caseId, caseName, caseProcessingMode }) => {
                  const statusInfo = resolveProcessingStatus(evidence, caseProcessingMode);
                  return (
                    <tr key={evidence.id} className="hover:bg-[#F4F6F5] transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-[#176B53] shrink-0" />
                          <div className="font-semibold text-[#172B3A] max-w-xs truncate" title={evidence.name}>
                            {evidence.name}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] text-[#64716A] block truncate max-w-[200px]" title={caseName}>
                          {caseId} • {caseName}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#F4F6F5] border border-[#D9E0DC]">
                          {evidence.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[#64716A]">
                        {evidence.uploadedAt?.split('T')[0] || '২০২৬-১১-০১'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${statusInfo.color}`}>
                          {language === 'bn' ? statusInfo.labelBn : statusInfo.labelEn}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onSelectCase(caseId)}
                          className="text-[#176B53] font-bold hover:underline inline-flex items-center space-x-1"
                        >
                          <span>{language === 'bn' ? 'বিরোধ দেখুন' : 'Open Case'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Responsive Rows View */}
          <div className="md:hidden divide-y divide-[#E8ECE9]">
            {filteredDocs.map(({ evidence, caseId, caseName, caseProcessingMode }) => {
              const statusInfo = resolveProcessingStatus(evidence, caseProcessingMode);
              return (
                <div key={evidence.id} className="p-4 space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-bold text-[#172B3A] break-all">
                      {evidence.name}
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#F4F6F5] border border-[#D9E0DC] shrink-0">
                      {evidence.type}
                    </span>
                  </div>

                  <div className="text-[11px] text-[#64716A] space-y-0.5">
                    <div>
                      <span>বিরোধ:</span> <span className="font-mono text-[#172B3A]">{caseId} • {caseName}</span>
                    </div>
                    <div>
                      <span>তারিখ:</span> <span className="font-mono">{evidence.uploadedAt?.split('T')[0] || '২০২৬-১১-০১'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${statusInfo.color}`}>
                      {language === 'bn' ? statusInfo.labelBn : statusInfo.labelEn}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectCase(caseId)}
                      className="text-[#176B53] font-bold text-xs hover:underline inline-flex items-center space-x-1"
                    >
                      <span>{language === 'bn' ? 'বিরোধ খুলুন' : 'Open Case'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#D9E0DC] rounded-lg p-12 text-center space-y-3">
          <FolderOpen className="w-8 h-8 text-[#8A9790] mx-auto" />
          <h2 className="text-sm font-bold text-[#172B3A]">
            {language === 'bn' ? 'কোনো সংরক্ষিত নথি পাওয়া যায়নি' : 'No Documents Found'}
          </h2>
          <p className="text-xs text-[#64716A] max-w-sm mx-auto leading-relaxed">
            {language === 'bn'
              ? 'আপনার অনুসন্ধানের সাথে মিলে এমন কোনো প্রমাণপত্র বা রসিদ পাওয়া যায়নি।'
              : 'No documents match your query. Upload new transaction evidence to populate your register.'}
          </p>
        </div>
      )}
    </div>
  );
};
