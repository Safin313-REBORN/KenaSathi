import React, { FormEvent, useEffect, useState } from 'react';
import { ChevronDown, CircleHelp, LoaderCircle, MessageCircle, Search, Send, ShieldAlert } from 'lucide-react';

interface HelpFaq {
  id: string;
  category: string;
  question: string;
  answer: string;
}

interface ChatReply {
  answer: string;
  matched: boolean;
  related: Array<{ id: string; question: string }>;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  matched?: boolean;
  related?: ChatReply['related'];
}

interface HelpCenterViewProps {
  language: 'bn' | 'en';
}

export const HelpCenterView: React.FC<HelpCenterViewProps> = ({ language }) => {
  const [faqs, setFaqs] = useState<HelpFaq[]>([]);
  const [faqQuery, setFaqQuery] = useState('');
  const [faqLoading, setFaqLoading] = useState(true);
  const [faqError, setFaqError] = useState(false);
  const [question, setQuestion] = useState('');
  const [chatBusy, setChatBusy] = useState(false);
  const [chatError, setChatError] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setFaqLoading(true);
      setFaqError(false);
      try {
        const params = new URLSearchParams({ lang: language, q: faqQuery.trim() });
        const response = await fetch(`/api/help/faqs?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error('FAQ request failed');
        const data = await response.json() as { faqs: HelpFaq[] };
        setFaqs(data.faqs);
      } catch {
        if (!controller.signal.aborted) setFaqError(true);
      } finally {
        if (!controller.signal.aborted) setFaqLoading(false);
      }
    }, faqQuery.trim() ? 220 : 0);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [language, faqQuery]);

  const sendQuestion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = question.trim();
    if (message.length < 2 || chatBusy) return;

    setQuestion('');
    setChatBusy(true);
    setChatError(false);
    setMessages((previous) => [...previous, { id: crypto.randomUUID(), role: 'user', text: message }]);
    try {
      const response = await fetch('/api/help/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ lang: language, message }),
      });
      if (!response.ok) throw new Error('Chat request failed');
      const reply = await response.json() as ChatReply;
      setMessages((previous) => [...previous, {
        id: crypto.randomUUID(), role: 'assistant', text: reply.answer,
        matched: reply.matched, related: reply.related,
      }]);
    } catch {
      setChatError(true);
    } finally {
      setChatBusy(false);
    }
  };

  const copy = language === 'bn'
    ? {
        title: 'সহায়তা কেন্দ্র', subtitle: 'KenaSathi ব্যবহার, নথি সংরক্ষণ ও সরকারি সহায়তা সম্পর্কে উত্তর খুঁজুন।',
        chat: 'সহায়তা চ্যাট', chatHint: 'সাইটের সহায়িকা থেকে উত্তর দেওয়া হয়। এখানে ব্যক্তিগত কেসের তথ্য লিখবেন না।',
        placeholder: 'আপনার প্রশ্ন লিখুন', send: 'প্রশ্ন পাঠান', search: 'প্রশ্নোত্তর খুঁজুন',
        faqs: 'সাধারণ প্রশ্নোত্তর', loading: 'প্রশ্নোত্তর লোড হচ্ছে…', noFaq: 'এই শব্দে কোনো প্রশ্ন পাওয়া যায়নি।',
        loadError: 'সহায়িকা লোড করা যায়নি। আবার চেষ্টা করুন।', chatError: 'চ্যাটে সংযোগ করা যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।',
        privacy: 'এই চ্যাটে আপনার বার্তা সংরক্ষণ করা হয় না। জাতীয় পরিচয়পত্র, ফোন নম্বর, ঠিকানা বা কেসের নথি দেবেন না।',
        answerLabel: 'সহায়িকা', unanswered: 'উত্তরটি সহায়িকার বাইরে হতে পারে', suggested: 'সম্পর্কিত প্রশ্ন',
      }
    : {
        title: 'Help center', subtitle: 'Find answers about using KenaSathi, storing records, and getting official assistance.',
        chat: 'Help chat', chatHint: 'Answers come from the site help guide. Do not enter personal case details here.',
        placeholder: 'Type your question', send: 'Send question', search: 'Search FAQs',
        faqs: 'Frequently asked questions', loading: 'Loading FAQs…', noFaq: 'No questions match that search.',
        loadError: 'The help guide could not be loaded. Try again.', chatError: 'The chat service could not be reached. Try again shortly.',
        privacy: 'Chat messages are not saved. Do not share your NID, phone number, address, or case documents.',
        answerLabel: 'Help guide', unanswered: 'This answer may be outside the help guide', suggested: 'Related questions',
      };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4 px-4 sm:px-6 animate-fadeIn">
      <header className="border-b border-[#DDE4DF] pb-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#176B53]">
          <CircleHelp className="w-5 h-5" aria-hidden="true" />
          <span>{language === 'bn' ? 'সহায়তা ও নির্দেশিকা' : 'Support and guidance'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#172B3A] mt-2">{copy.title}</h1>
        <p className="text-base text-[#526359] mt-2 max-w-2xl">{copy.subtitle}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6 items-start">
        <section className="bg-white border border-[#DDE4DF] rounded-md shadow-sm overflow-hidden" aria-labelledby="help-chat-title">
          <div className="bg-[#172B3A] text-white p-5">
            <h2 id="help-chat-title" className="flex items-center gap-2 text-xl font-bold">
              <MessageCircle className="w-5 h-5" aria-hidden="true" />{copy.chat}
            </h2>
            <p className="text-sm text-[#DDE4DF] mt-2">{copy.chatHint}</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="rounded bg-[#F5F7F5] border border-[#DDE4DF] p-3 text-sm text-[#526359]" role="note">
              <ShieldAlert className="w-4 h-4 inline mr-2 text-[#945607]" aria-hidden="true" />{copy.privacy}
            </div>
            <div className="min-h-32 max-h-80 overflow-y-auto space-y-3" aria-live="polite" aria-relevant="additions text">
              {messages.length === 0 ? (
                <p className="text-sm text-[#65736B] py-4 text-center">
                  {language === 'bn' ? 'যেমন: “আমার তথ্য কোথায় থাকে?”' : 'Try: “Where are my files stored?”'}
                </p>
              ) : messages.map((entry) => (
                <div key={entry.id} className={`max-w-[92%] rounded p-3 text-sm leading-relaxed ${entry.role === 'user' ? 'ml-auto bg-[#EAF3EE] text-[#124A3B]' : 'mr-auto bg-[#F5F7F5] text-[#26352E] border border-[#DDE4DF]'}`}>
                  {entry.role === 'assistant' && <span className="block text-xs font-bold text-[#176B53] mb-1">{copy.answerLabel}</span>}
                  {entry.text}
                  {entry.role === 'assistant' && entry.matched === false && <span className="block mt-2 text-xs text-[#7A4B04]">{copy.unanswered}</span>}
                  {!!entry.related?.length && (
                    <div className="mt-3 border-t border-[#DDE4DF] pt-2">
                      <p className="text-xs font-semibold mb-1">{copy.suggested}</p>
                      {entry.related.map((item) => <p key={item.id} className="text-xs mt-1">{item.question}</p>)}
                    </div>
                  )}
                </div>
              ))}
              {chatBusy && <p className="text-sm text-[#526359] flex items-center gap-2"><LoaderCircle className="w-4 h-4 animate-spin" aria-hidden="true" />{language === 'bn' ? 'উত্তর খোঁজা হচ্ছে…' : 'Finding an answer…'}</p>}
            </div>
            {chatError && <p className="text-sm text-[#B42318]" role="alert">{copy.chatError}</p>}
            <form onSubmit={sendQuestion} className="flex gap-2 items-end">
              <label htmlFor="help-chat-question" className="sr-only">{copy.placeholder}</label>
              <textarea
                id="help-chat-question"
                rows={2}
                maxLength={500}
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder={copy.placeholder}
                className="flex-1 min-w-0 resize-y rounded border border-[#C2CDC6] p-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#176B53]"
              />
              <button type="submit" disabled={chatBusy || question.trim().length < 2} className="ks-btn ks-btn-primary px-3 min-w-11 disabled:opacity-50" aria-label={copy.send}>
                <Send className="w-4 h-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </section>

        <section className="space-y-4" aria-labelledby="help-faq-title">
          <div>
            <h2 id="help-faq-title" className="text-2xl font-bold text-[#172B3A]">{copy.faqs}</h2>
            <label htmlFor="help-faq-search" className="sr-only">{copy.search}</label>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-[#65736B]" aria-hidden="true" />
              <input id="help-faq-search" value={faqQuery} onChange={(event) => setFaqQuery(event.target.value)} placeholder={copy.search} className="w-full pl-10 pr-3 py-3 rounded border border-[#C2CDC6] bg-white" />
            </div>
          </div>
          {faqLoading ? (
            <p className="text-sm text-[#526359] flex items-center gap-2"><LoaderCircle className="w-4 h-4 animate-spin" aria-hidden="true" />{copy.loading}</p>
          ) : faqError ? (
            <p className="text-sm text-[#B42318]" role="alert">{copy.loadError}</p>
          ) : faqs.length === 0 ? (
            <p className="text-sm text-[#526359] bg-white border border-[#DDE4DF] rounded p-5">{copy.noFaq}</p>
          ) : (
            <div className="bg-white border border-[#DDE4DF] rounded-md divide-y divide-[#DDE4DF]">
              {faqs.map((faq) => (
                <details key={faq.id} className="group p-4 sm:p-5">
                  <summary className="cursor-pointer list-none flex justify-between gap-3 items-start text-sm sm:text-base font-semibold text-[#26352E] min-h-11">
                    <span>{faq.question}</span>
                    <ChevronDown className="w-4 h-4 text-[#176B53] shrink-0 mt-1 transition-transform group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <p className="text-sm text-[#526359] leading-relaxed pt-3 pr-6">{faq.answer}</p>
                </details>
              ))}
            </div>
          )}
          <p className="text-xs text-[#65736B]">{language === 'bn' ? 'উত্তরগুলো সাধারণ পণ্য-সহায়িকা; এগুলো আইনি পরামর্শ বা অভিযোগ গ্রহণের নিশ্চয়তা নয়।' : 'These are general product-help answers, not legal advice or a promise that a complaint will be accepted.'}</p>
        </section>
      </div>
    </div>
  );
};
