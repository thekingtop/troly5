
import React, { useState, useRef, useEffect } from 'react';
import type { AnalysisReport, ApplicableLaw, LawArticle, UploadedFile, LitigationType, LegalLoophole, ChatMessage, CaseTimelineEvent, OpponentArgument, SupportingEvidence, CrossExamQuestion } from '../types.ts';
import { MagicIcon } from './icons/MagicIcon.tsx';
import { explainLaw, continueContextualChat, analyzeOpponentArguments, predictOpponentArguments, runDevilAdvocateAnalysis } from '../services/geminiService.ts';
import { Loader } from './Loader.tsx';
import { SearchIcon } from './icons/SearchIcon.tsx';
import { getStageLabel } from '../constants.ts';
import { PlusIcon } from './icons/PlusIcon.tsx';
import { TrashIcon } from './icons/TrashIcon.tsx';
import { ChatIcon } from './icons/ChatIcon.tsx';
import { SendIcon } from './icons/SendIcon.tsx';
import { CaseTimeline } from './CaseTimeline.tsx';
import { DownloadIcon } from './icons/DownloadIcon.tsx';
import { RefreshIcon } from './icons/RefreshIcon.tsx';
import { EditIcon } from './icons/EditIcon.tsx';
import { LandInfoDisplay } from './LandInfoDisplay.tsx';

// --- Internal Components and Icons ---
declare var html2canvas: any;

const BrainIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
  </svg>
);

const ShieldCheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
  </svg>
);

const ProcedureIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
  </svg>
);

// --- Icons for Loophole Categories ---
const ContractIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
);
const LawIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52v16.5m-3.5-16.5v16.5m-3.5-16.5v16.5m0 0C5.116 20.507 3 19.742 3 18.25V8.75c0-1.492 2.116-2.257 4.5-2.257m0 11.75c2.384 0 4.5-.765 4.5-2.257V8.75C12 7.258 9.884 6.5 7.5 6.5m0 11.75 4.5-11.75" />
  </svg>
);
const InfoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
  </svg>
);
const OtherCategoryIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
  </svg>
);

// Icon for Devil's Advocate
const DevilIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
    </svg>
);

const CunningLawyerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM4.5 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM15.375 16.125a2.625 2.625 0 1 1 5.25 0 2.625 2.625 0 0 1-5.25 0ZM12 18.75a.75.75 0 0 0 .75.75h.008a.75.75 0 0 0 .75-.75V18a3 3 0 0 0-1.5 0v.75ZM12 21a.75.75 0 0 0 .75.75h.008a.75.75 0 0 0 .75-.75v-.375a3 3 0 0 0-1.5 0v.375Z" clipRule="evenodd" />
    <path d="M12 1.5c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 1.5 12 1.5ZM8.625 15a.75.75 0 0 0-1.5 0v.625H6.375a.75.75 0 0 0 0 1.5h.75v.625a.75.75 0 0 0 1.5 0v-.625h.75a.75.75 0 0 0 0-1.5h-.75V15Zm6 0a.75.75 0 0 0-1.5 0v.625H12.375a.75.75 0 0 0 0 1.5h.75v.625a.75.75 0 0 0 1.5 0v-.625h.75a.75.75 0 0 0 0-1.5h-.75V15Z" />
  </svg>
);

const TargetIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.223 7.942-5.281.318Zm-3.182 0-2.51 2.225.569-9.47 5.223 7.942-5.281.318Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Z" />
    </svg>
);

const CunningLawyerText: React.FC<{ text: string | string[] | undefined }> = ({ text }) => {
    if (!text) return null;
    const content = Array.isArray(text) ? text.join('\n') : text;
    const parts = content.split(/(<cg>.*?<\/cg>)/g);
    return (
        <>
            {parts.map((part, index) => {
                if (part.startsWith('<cg>')) {
                    const tip = part.replace(/<\/?cg>/g, '');
                    return (
                        <div key={index} className="my-2 p-3 bg-amber-50 border-l-4 border-amber-300 rounded-r-md">
                            <div className="flex items-start gap-2">
                                <CunningLawyerIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-amber-900">
                                    <span className="font-bold">Mẹo chiến thuật:</span>
                                    <span className="ml-1">{tip}</span>
                                </div>
                            </div>
                        </div>
                    );
                }
                // Render text with newlines
                return <React.Fragment key={index}>{part.split('\n').map((line, i) => <React.Fragment key={i}>{line}<br/></React.Fragment>)}</React.Fragment>;
            })}
        </>
    );
};


const HighlightedText: React.FC<{ text: string | undefined; term: string }> = React.memo(({ text, term }) => {
    if (!term.trim() || !text) { return <>{text}</>; }
    const escapedTerm = term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    const parts = text.split(regex);
    return (<>{parts.map((part, i) => regex.test(part) ? (<mark key={i} className="bg-yellow-200 text-yellow-900 px-0.5 rounded-sm">{part}</mark>) : (<React.Fragment key={i}>{part}</React.Fragment>))}</>);
});

const getLoopholeIcon = (classification: LegalLoophole['classification']) => {
  const iconProps = { className: "w-5 h-5 flex-shrink-0" };
  switch (classification) {
    case 'Hợp đồng': return <ContractIcon {...iconProps} />;
    case 'Quy phạm Pháp luật': return <LawIcon {...iconProps} />;
    case 'Tố tụng': return <ProcedureIcon {...iconProps} />;
    default: return <OtherCategoryIcon {...iconProps} />;
  }
};

const getLoopholeSeverityClasses = (severity: LegalLoophole['severity']) => {
    switch (severity) {
        case 'Cao': return 'border-red-300 bg-red-50/80';
        case 'Trung bình': return 'border-amber-300 bg-amber-50/80';
        case 'Thấp': return 'border-slate-300 bg-slate-50/80';
        default: return 'border-slate-300 bg-slate-50/80';
    }
};

// ... (Keep ChatWindow and other helper components as is)
const ChatWindow: React.FC<{
    chatHistory: ChatMessage[];
    onSendMessage: (message: string) => void;
    isLoading: boolean;
    onClose: () => void;
    title: string;
}> = ({ chatHistory, onSendMessage, isLoading, onClose, title }) => {
    const [userInput, setUserInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;
        onSendMessage(userInput);
        setUserInput('');
    };

    return (
      <div className="mt-4 border border-slate-300 bg-slate-50/50 rounded-lg p-3 animate-fade-in">
        <div className="flex justify-between items-center mb-2">
            <h5 className="font-bold text-sm text-slate-700">{title}</h5>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-xl leading-none">&times;</button>
        </div>
        <div className="h-64 overflow-y-auto space-y-3 p-2 bg-white border rounded-md">
            {chatHistory.map((msg, index) => (
                <div key={index} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                    {msg.role === 'model' && <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0"><MagicIcon className="w-4 h-4 text-white"/></div>}
                    <div className={`max-w-[80%] p-2 rounded-lg text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}><p className="whitespace-pre-wrap">{msg.content}</p></div>
                </div>
            ))}
            {isLoading && <div className="flex gap-2.5"><div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0"><MagicIcon className="w-4 h-4 text-white"/></div><div className="p-2 rounded-lg bg-slate-100"><Loader /></div></div>}
            <div ref={chatEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
            <input type="text" value={userInput} onChange={e => setUserInput(e.target.value)} placeholder="Hỏi AI để có giải pháp..." className="flex-grow p-2 border border-slate-300 rounded-md text-sm" disabled={isLoading} />
            <button type="submit" disabled={isLoading || !userInput.trim()} className="p-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-slate-400"><SendIcon className="w-5 h-5"/></button>
        </form>
      </div>
    );
};

interface ReportSectionProps {
    title: string;
    children: React.ReactNode;
    chatHistory?: ChatMessage[];
    onChatToggle?: () => void;
    isChatOpen?: boolean;
    headerAction?: React.ReactNode;
}

const ReportSection: React.FC<ReportSectionProps> = ({ title, children, chatHistory, onChatToggle, isChatOpen, headerAction }) => {
    const hasHistory = chatHistory && chatHistory.length > 0;
    
    let buttonClasses = 'p-1.5 rounded-md transition-colors';
    if (isChatOpen) {
        buttonClasses += ' bg-blue-100 text-blue-600';
    } else if (hasHistory) {
        buttonClasses += ' bg-blue-50 text-blue-600 hover:bg-blue-100';
    } else {
        buttonClasses += ' text-slate-500 hover:bg-slate-100';
    }

    return (
        <div className="bg-white p-4 rounded-lg border border-slate-200/80 soft-shadow">
            <div className="flex justify-between items-center mb-3">
                <h4 className="text-base font-bold text-slate-800">{title}</h4>
                <div className="flex items-center gap-2">
                  {headerAction}
                  {chatHistory !== undefined && onChatToggle && (
                      <button onClick={onChatToggle} className={buttonClasses} title="Trao đổi với AI về mục này">
                          <ChatIcon className="w-5 h-5" />
                      </button>
                  )}
                </div>
            </div>
            <div className="text-sm text-slate-700 space-y-2">{children}</div>
        </div>
    );
};

const DevilAdvocateSection: React.FC<{ report: AnalysisReport }> = ({ report }) => {
    const [critique, setCritique] = useState<{ weakness: string, counterStrategy: string }[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [show, setShow] = useState(false);

    const handleRun = async () => {
        setIsLoading(true);
        try {
            const result = await runDevilAdvocateAnalysis(report);
            setCritique(result);
            setShow(true);
        } catch (error) {
            alert("Không thể chạy giả lập đối thủ lúc này.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!show && !isLoading) {
        return (
             <button 
                onClick={handleRun}
                className="w-full mt-2 py-2 px-4 bg-gray-800 text-gray-100 font-semibold rounded-lg hover:bg-black flex items-center justify-center gap-2 border border-gray-600"
            >
                <DevilIcon className="w-5 h-5 text-red-500" />
                <span>Giả lập Đối thủ Phản biện (Devil's Advocate)</span>
            </button>
        );
    }

    return (
        <div className="mt-4 p-4 bg-gray-900 rounded-lg border border-gray-700 text-gray-200 animate-fade-in">
            <h4 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <DevilIcon className="w-5 h-5 text-red-500" />
                <span>Góc nhìn của Đối thủ (Phản biện)</span>
            </h4>
            
            {isLoading ? (
                <div className="flex justify-center py-4"><Loader /></div>
            ) : (
                <div className="space-y-4">
                    <p className="text-xs text-gray-400 italic">Cảnh báo: Dưới đây là những điểm yếu và chiến thuật mà đối phương có thể sử dụng để tấn công bạn.</p>
                    {critique?.map((point, i) => (
                        <div key={i} className="p-3 bg-gray-800 rounded border-l-2 border-red-500">
                            <p className="text-sm font-bold text-red-400 mb-1">Điểm yếu bị tấn công:</p>
                            <p className="text-sm mb-2">{point.weakness}</p>
                            <p className="text-sm font-bold text-amber-400 mb-1">Chiến thuật của đối phương:</p>
                            <p className="text-sm italic text-gray-300">"{point.counterStrategy}"</p>
                        </div>
                    ))}
                    <button onClick={() => setShow(false)} className="text-xs text-gray-500 underline hover:text-gray-300 mt-2">Ẩn phản biện</button>
                </div>
            )}
        </div>
    );
};

// --- WAR ROOM COMPONENT (NEW) ---
const WarRoomSection: React.FC<{ report: AnalysisReport }> = ({ report }) => {
    const { winProbabilityAnalysis, proposedStrategy } = report;
    const layeredStrategy = proposedStrategy?.layeredStrategy;
    const crossExamPlan = proposedStrategy?.crossExaminationPlan;

    if (!winProbabilityAnalysis && !layeredStrategy && !crossExamPlan) return null;

    return (
        <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 text-slate-200 mb-6 soft-shadow">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
                <TargetIcon className="w-6 h-6 text-red-500" />
                <h3 className="text-lg font-bold text-white">PHÒNG CHIẾN THUẬT (WAR ROOM)</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Win Probability */}
                {winProbabilityAnalysis && (
                    <div className="bg-slate-800 p-4 rounded-lg border border-slate-600">
                        <h4 className="text-sm font-bold text-blue-400 mb-2 uppercase">Xác suất Thắng Kiện</h4>
                        <div className="flex items-center gap-4 mb-3">
                            <div className={`text-4xl font-black ${winProbabilityAnalysis.score > 70 ? 'text-green-500' : (winProbabilityAnalysis.score > 40 ? 'text-yellow-500' : 'text-red-500')}`}>
                                {winProbabilityAnalysis.score}%
                            </div>
                            <div className="text-xs text-slate-400 italic">{winProbabilityAnalysis.rationale}</div>
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-slate-400">Biến số (Swing Factors):</span>
                            <ul className="list-disc list-inside text-xs text-slate-300 mt-1">
                                {winProbabilityAnalysis.swingFactors.map((f, i) => <li key={i}>{f}</li>)}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Hidden Strategy */}
                {layeredStrategy && (
                    <div className="bg-slate-800 p-4 rounded-lg border border-slate-600">
                        <h4 className="text-sm font-bold text-purple-400 mb-2 uppercase">Chiến lược Ẩn - Hiện</h4>
                        <div className="space-y-3 text-sm">
                            <div className="border-l-2 border-blue-500 pl-2">
                                <span className="text-xs font-bold text-blue-300 block">BỀ NỔI (Công khai):</span>
                                <ul className="list-disc list-inside text-slate-300">{layeredStrategy.surfaceStrategy.map((s, i) => <li key={i}>{s}</li>)}</ul>
                            </div>
                            <div className="border-l-2 border-red-500 pl-2 bg-red-900/20 p-1 rounded-r">
                                <span className="text-xs font-bold text-red-400 block flex items-center gap-1"><CunningLawyerIcon className="w-3 h-3"/> BỀ CHÌM (Mục tiêu thực):</span>
                                <ul className="list-disc list-inside text-red-200 italic">{layeredStrategy.deepStrategy.map((s, i) => <li key={i}>{s}</li>)}</ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Cross Examination Plan */}
            {crossExamPlan && crossExamPlan.length > 0 && (
                <div className="mt-6 bg-slate-800 p-4 rounded-lg border border-slate-600">
                    <h4 className="text-sm font-bold text-amber-400 mb-3 uppercase flex items-center gap-2">
                        <BrainIcon className="w-4 h-4"/> Kế hoạch Thẩm vấn Chéo (Cross-Exam)
                    </h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left text-slate-300">
                            <thead className="text-slate-400 uppercase bg-slate-700/50">
                                <tr>
                                    <th className="px-2 py-2 rounded-tl">Đối tượng</th>
                                    <th className="px-2 py-2">Loại câu hỏi</th>
                                    <th className="px-2 py-2">Nội dung</th>
                                    <th className="px-2 py-2 rounded-tr">Mục đích</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {crossExamPlan.map((q, i) => (
                                    <tr key={i} className="hover:bg-slate-700/30">
                                        <td className="px-2 py-2 font-semibold text-white">{q.target}</td>
                                        <td className="px-2 py-2">
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${q.type === 'Leading' ? 'bg-red-900 text-red-200' : (q.type === 'Locking' ? 'bg-blue-900 text-blue-200' : 'bg-slate-600 text-slate-200')}`}>
                                                {q.type === 'Leading' ? 'Dẫn dắt' : (q.type === 'Locking' ? 'Khóa' : q.type)}
                                            </span>
                                        </td>
                                        <td className="px-2 py-2 italic text-slate-200">"{q.question}"</td>
                                        <td className="px-2 py-2 text-amber-200/80">{q.goal}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

// ... (Keep OpponentAnalysisSection as is)
interface OpponentAnalysisSectionProps {
  report: AnalysisReport | null;
  files: UploadedFile[];
  onUpdateReport: (report: AnalysisReport) => void;
  highlightTerm: string;
}

const OpponentAnalysisSection: React.FC<OpponentAnalysisSectionProps> = ({ report, files, onUpdateReport, highlightTerm }) => {
    const [opponentArgs, setOpponentArgs] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPredicting, setIsPredicting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePredictArguments = async () => {
        if (!report) return;
        setIsPredicting(true);
        setError(null);
        try {
            const predictedArgs = await predictOpponentArguments(report, files);
            setOpponentArgs(predictedArgs.join('\n\n- ')); // Format as a list
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi không xác định khi giả định');
        } finally {
            setIsPredicting(false);
        }
    };

    const handleAnalyze = async () => {
        if (!report || !opponentArgs.trim()) return;
        setIsLoading(true);
        setError(null);
        try {
            const analysisResult = await analyzeOpponentArguments(report, files, opponentArgs);
            const updatedReport = { ...report, opponentAnalysis: analysisResult };
            onUpdateReport(updatedReport);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi không xác định');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ReportSection title="Phân tích Lập luận Đối phương">
            <div className="space-y-4">
                <div>
                    <label htmlFor="opponentArgs" className="block text-sm font-semibold text-slate-700 mb-1.5">Nhập hoặc để AI giả định các luận điểm của đối phương:</label>
                    <textarea
                        id="opponentArgs"
                        value={opponentArgs}
                        onChange={(e) => setOpponentArgs(e.target.value)}
                        placeholder="Ví dụ: Nguyên đơn cho rằng hợp đồng vô hiệu do bị lừa dối. Bằng chứng là email ngày X..."
                        className="w-full h-28 p-2.5 bg-slate-50 border border-slate-300 rounded-md text-sm"
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={handlePredictArguments} disabled={isPredicting || isLoading} className="w-full py-2 px-4 bg-slate-100 text-slate-800 font-semibold rounded-lg hover:bg-slate-200 border border-slate-300 disabled:bg-slate-200/50 flex items-center justify-center gap-2">
                        {isPredicting ? <><Loader /> <span>Đang giả định...</span></> : <> <MagicIcon className="w-4 h-4" /> <span>AI Giả định Lập luận</span></>}
                    </button>
                    <button onClick={handleAnalyze} disabled={isLoading || isPredicting || !opponentArgs.trim()} className="w-full py-2 px-4 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-800 disabled:bg-slate-400 flex items-center justify-center gap-2">
                        {isLoading ? <><Loader /> <span>Đang phân tích...</span></> : 'Phân tích & Tìm điểm yếu'}
                    </button>
                </div>
                {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

                {report?.opponentAnalysis && (
                    <div className="mt-4 space-y-4 animate-fade-in">
                         {report.opponentAnalysis.map((analysis, index) => (
                            <div key={index} className="p-3 border border-slate-200 rounded-lg bg-slate-50/50">
                                <h5 className="font-semibold text-slate-800 mb-2">Đối Luận điểm: "<HighlightedText text={analysis.argument as string} term={highlightTerm} />"</h5>
                                <table className="w-full text-left text-xs">
                                    <tbody>
                                        <tr className="border-b">
                                            <td className="font-semibold p-2 align-top w-1/3 bg-slate-100">Điểm yếu đã xác định</td>
                                            <td className="p-2"><ul className="list-disc list-inside space-y-1">{analysis.weaknesses.map((item, i) => <li key={i}><HighlightedText text={item as string} term={highlightTerm} /></li>)}</ul></td>
                                        </tr>
                                         <tr className="border-b">
                                            <td className="font-semibold p-2 align-top bg-slate-100">Luận điểm phản bác</td>
                                            <td className="p-2"><ul className="list-disc list-inside space-y-1">{analysis.counterArguments.map((item, i) => <li key={i}><HighlightedText text={item as string} term={highlightTerm} /></li>)}</ul></td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold p-2 align-top bg-slate-100">Chứng cứ hỗ trợ</td>
                                            <td className="p-2"><ul className="list-disc list-inside space-y-1">{analysis.supportingEvidence.map((item, i) => <li key={i}><HighlightedText text={item as string} term={highlightTerm} /></li>)}</ul></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                         ))}
                    </div>
                )}
            </div>
        </ReportSection>
    );
};

interface ReportDisplayProps {
  report: AnalysisReport | null;
  files: UploadedFile[];
  onPreview: (file: UploadedFile) => void;
  onClearSummary: () => void;
  litigationType: LitigationType;
  onUpdateUserLaws: (laws: ApplicableLaw[]) => void;
  onUpdateReport: (report: AnalysisReport) => void;
  caseSummary: string;
  clientRequestSummary: string;
  onReanalyze: (report: AnalysisReport) => void;
  isReanalyzing: boolean;
}

export const ReportDisplay: React.FC<ReportDisplayProps> = ({ report, onClearSummary, litigationType, onUpdateUserLaws, onUpdateReport, caseSummary, clientRequestSummary, onReanalyze, isReanalyzing, files }) => {
    // ... (Keep state and handlers as is)
    const [highlightTerm, setHighlightTerm] = useState('');
    const [newLaw, setNewLaw] = useState({ documentName: '', articles: [{ articleNumber: '', summary: '' }] });
    const [isAddingLaw, setIsAddingLaw] = useState(false);
    const [explainingLaw, setExplainingLaw] = useState<string | null>(null);
    const [explanation, setExplanation] = useState('');
    const [explanationError, setExplanationError] = useState<string | null>(null);
    const [activeChat, setActiveChat] = useState<keyof Pick<AnalysisReport, 'gapAnalysisChat' | 'prospectsChat' | 'strategyChat' | 'resolutionPlanChat' | 'applicableLawsChat' | 'contingencyPlanChat'> | null>(null);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [isEditingSummary, setIsEditingSummary] = useState(false);
    const [editedSummary, setEditedSummary] = useState(report?.editableCaseSummary || '');
    
    useEffect(() => {
        if (report?.editableCaseSummary) {
            setEditedSummary(report.editableCaseSummary);
        }
    }, [report?.editableCaseSummary]);

    const handleExplainLaw = async (lawText: string) => {
        setExplainingLaw(lawText);
        setExplanation('');
        setExplanationError(null);
        try {
            const result = await explainLaw(lawText);
            setExplanation(result);
        } catch (err) {
            setExplanationError(err instanceof Error ? err.message : 'Lỗi không xác định');
        }
    };
    
    const allLaws = [...(report?.applicableLaws || []), ...(report?.userAddedLaws || [])];

    const handleAddNewLaw = () => {
        if (!newLaw.documentName.trim() || newLaw.articles.some(a => !a.articleNumber.trim() || !a.summary.trim())) {
            alert("Vui lòng điền đầy đủ thông tin.");
            return;
        }
        const updatedUserLaws = [...(report?.userAddedLaws || []), { ...newLaw, articles: [...newLaw.articles] }];
        onUpdateUserLaws(updatedUserLaws);
        setNewLaw({ documentName: '', articles: [{ articleNumber: '', summary: '' }] });
        setIsAddingLaw(false);
    };
    
    const handleRemoveUserLaw = (docName: string, articleNum: string) => {
        if (!report?.userAddedLaws) return;
        const updatedLaws = report.userAddedLaws.map(law => {
            if (law.documentName === docName) {
                const filteredArticles = law.articles.filter(a => a.articleNumber !== articleNum);
                return { ...law, articles: filteredArticles };
            }
            return law;
        }).filter(law => law.articles.length > 0); // Remove law if no articles are left
        onUpdateUserLaws(updatedLaws);
    };

    const handleChatSendMessage = async (chatKey: NonNullable<typeof activeChat>, message: string) => {
        if (!report) return;
        
        const currentHistory = report[chatKey] || [];
        const newUserMessage: ChatMessage = { role: 'user', content: message };
        const updatedHistory = [...currentHistory, newUserMessage];
        
        onUpdateReport({ ...report, [chatKey]: updatedHistory });
        setIsChatLoading(true);

        try {
            const sectionTitles: Record<NonNullable<typeof activeChat>, string> = {
                gapAnalysisChat: "Phân tích Lỗ hổng & Hành động",
                prospectsChat: "Đánh giá Triển vọng Vụ việc",
                strategyChat: "Đề xuất Lộ trình & Chiến lược",
                resolutionPlanChat: "Phương án giải quyết theo Yêu cầu",
                applicableLawsChat: "Cơ sở pháp lý áp dụng",
                contingencyPlanChat: "Phương án xử lý nếu thua kiện"
            };
            const aiResponse = await continueContextualChat(report, currentHistory, message, sectionTitles[chatKey]);
            const aiMessage: ChatMessage = { role: 'model', content: aiResponse };
            const finalHistory = [...updatedHistory, aiMessage];
            onUpdateReport({ ...report, [chatKey]: finalHistory });
        } catch (err) {
            console.error(err);
        } finally {
            setIsChatLoading(false);
        }
    };
    
    const handleSaveSummary = () => {
        if (report) {
            onUpdateReport({ ...report, editableCaseSummary: editedSummary });
        }
        setIsEditingSummary(false);
    };
    const handleCancelEditSummary = () => {
        setEditedSummary(report?.editableCaseSummary || '');
        setIsEditingSummary(false);
    };
    const handleReanalyzeClick = () => {
        if (report) {
            const reportToReanalyze = isEditingSummary ? { ...report, editableCaseSummary: editedSummary } : report;
            onReanalyze(reportToReanalyze);
            setIsEditingSummary(false);
        }
    };

    if (!report && !caseSummary && !clientRequestSummary) {
        return null;
    }
    
    // Check if the case is land-related to show specialized UI
    const isLandCase = !!report?.landInfo;

    return (
        <div className="space-y-6" id="report-content">
            <div className="flex justify-between items-center">
                <div className="relative flex-grow">
                     <SearchIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                     <input
                        type="text"
                        value={highlightTerm}
                        onChange={(e) => setHighlightTerm(e.target.value)}
                        placeholder="Tìm kiếm & highlight trong báo cáo..."
                        className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                    />
                </div>
                <button onClick={handleReanalyzeClick} disabled={isReanalyzing} className="ml-3 flex items-center gap-2 px-4 py-2 text-sm bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-800 disabled:bg-slate-400">
                    {isReanalyzing ? <Loader /> : <RefreshIcon className="w-4 h-4" />}
                    Phân tích lại
                </button>
            </div>
            
            {report && <WarRoomSection report={report} />}

            {report?.quickSummary && (
                <ReportSection title="Tóm tắt Nhanh" headerAction={<button onClick={onClearSummary} className="px-3 py-1.5 text-xs bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200">Xóa</button>}>
                    <pre className="whitespace-pre-wrap font-sans text-sm"><HighlightedText text={report.quickSummary} term={highlightTerm} /></pre>
                </ReportSection>
            )}

             {caseSummary && (
                <ReportSection title="Tóm tắt Diễn biến Vụ việc (AI trích xuất)">
                    <p><HighlightedText text={caseSummary} term={highlightTerm} /></p>
                </ReportSection>
             )}
              {clientRequestSummary && (
                <ReportSection title="Tóm tắt Yêu cầu của Khách hàng (AI trích xuất)">
                    <p><HighlightedText text={clientRequestSummary} term={highlightTerm} /></p>
                </ReportSection>
             )}

            {report && (
                <>
                {report.editableCaseSummary && (
                    <ReportSection title="Tóm tắt Vụ việc (AI tạo)" headerAction={!isEditingSummary && <button onClick={() => setIsEditingSummary(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"><EditIcon className="w-4 h-4"/> Sửa</button>}>
                        {isEditingSummary ? (
                            <div className="space-y-2">
                                <textarea value={editedSummary} onChange={e => setEditedSummary(e.target.value)} className="w-full h-24 p-2 border border-slate-300 rounded-md bg-slate-50"/>
                                <div className="flex justify-end gap-2">
                                    <button onClick={handleCancelEditSummary} className="px-3 py-1 text-xs font-semibold bg-slate-200 rounded-md hover:bg-slate-300">Hủy</button>
                                    <button onClick={handleSaveSummary} className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">Lưu</button>
                                </div>
                            </div>
                        ) : (
                            <p><HighlightedText text={report.editableCaseSummary} term={highlightTerm} /></p>
                        )}
                    </ReportSection>
                )}
                
                {isLandCase && <LandInfoDisplay report={report} />}

                {report.caseTimeline?.length > 0 && (
                     <ReportSection title="Dòng thời gian Vụ việc">
                        <CaseTimeline events={report.caseTimeline} highlightTerm={highlightTerm} onUpdateEvents={(updatedEvents) => onUpdateReport({...report, caseTimeline: updatedEvents})} />
                    </ReportSection>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-slate-100/50 border rounded-lg">
                        <p className="text-sm font-semibold text-slate-600 mb-1">Giai đoạn tố tụng</p>
                        <p className="text-base font-bold text-blue-700"><HighlightedText text={getStageLabel(litigationType, report.litigationStage)} term={highlightTerm} /></p>
                    </div>
                     <div className="p-4 bg-slate-100/50 border rounded-lg">
                        <p className="text-sm font-semibold text-slate-600 mb-1">Tư cách tố tụng</p>
                        <ul className="text-sm space-y-1">{report.proceduralStatus?.map((p, i) => <li key={i}><span className="font-semibold"><HighlightedText text={p.partyName} term={highlightTerm} />:</span> <HighlightedText text={p.status} term={highlightTerm} /></li>)}</ul>
                    </div>
                </div>

                <ReportSection title="1. Quan hệ pháp luật"><p><HighlightedText text={report.legalRelationship} term={highlightTerm} /></p></ReportSection>
                <ReportSection title="2. Vấn đề pháp lý cốt lõi"><ul className="list-disc list-inside space-y-1.5">{report.coreLegalIssues?.map((issue, i) => <li key={i}><HighlightedText text={issue} term={highlightTerm} /></li>)}</ul></ReportSection>
                
                {report.requestResolutionPlan && (
                    <ReportSection title="3. Phương án giải quyết theo Yêu cầu" chatHistory={report.resolutionPlanChat} onChatToggle={() => setActiveChat(prev => prev === 'resolutionPlanChat' ? null : 'resolutionPlanChat')} isChatOpen={activeChat === 'resolutionPlanChat'}>
                        <ul className="list-disc list-inside space-y-1.5">{report.requestResolutionPlan.map((item, i) => <li key={i}><HighlightedText text={item} term={highlightTerm} /></li>)}</ul>
                        {activeChat === 'resolutionPlanChat' && <ChatWindow chatHistory={report.resolutionPlanChat || []} onSendMessage={(msg) => handleChatSendMessage('resolutionPlanChat', msg)} isLoading={isChatLoading} onClose={() => setActiveChat(null)} title="Trao đổi về Phương án giải quyết" />}
                    </ReportSection>
                )}

                <ReportSection title="4. Cơ sở pháp lý áp dụng" chatHistory={report.applicableLawsChat} onChatToggle={() => setActiveChat(prev => prev === 'applicableLawsChat' ? null : 'applicableLawsChat')} isChatOpen={activeChat === 'applicableLawsChat'}>
                    <div className="space-y-4">
                        {allLaws.map((law, index) => (
                            <div key={`${law.documentName}-${index}`} className="p-3 border-l-4 border-blue-200 bg-blue-50/50 rounded-r-md">
                                <h5 className="font-bold text-blue-800"><HighlightedText text={law.documentName} term={highlightTerm} /></h5>
                                {law.coreIssueAddressed && <p className="text-xs italic mt-1"><span className="font-semibold">Vấn đề giải quyết:</span> <HighlightedText text={law.coreIssueAddressed} term={highlightTerm} /></p>}
                                {law.relevanceToCase && <p className="text-xs italic"><span className="font-semibold">Sự liên quan:</span> <HighlightedText text={law.relevanceToCase} term={highlightTerm} /></p>}
                                <ul className="mt-2 space-y-2">
                                    {law.articles.map((article) => (
                                        <li key={article.articleNumber} className="relative group">
                                            <p><span className="font-semibold"><HighlightedText text={article.articleNumber} term={highlightTerm} />:</span> <HighlightedText text={article.summary} term={highlightTerm} /></p>
                                            <div className="absolute top-0 right-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                 {report.userAddedLaws?.some(l => l.documentName === law.documentName && l.articles.some(a => a.articleNumber === article.articleNumber)) && (
                                                     <button onClick={() => handleRemoveUserLaw(law.documentName, article.articleNumber)} className="p-1 rounded-full hover:bg-red-100" title="Xóa"><TrashIcon className="w-4 h-4 text-red-500"/></button>
                                                 )}
                                                <button onClick={() => handleExplainLaw(`${law.documentName} - ${article.articleNumber}`)} className="p-1 rounded-full hover:bg-blue-100" title="Giải thích điều luật"><MagicIcon className="w-4 h-4 text-blue-600"/></button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                {law.supportingEvidence && law.supportingEvidence.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-blue-200/50">
                                        <h6 className="text-xs font-semibold text-blue-700">Chứng cứ hỗ trợ:</h6>
                                        {law.supportingEvidence.map((ev, i) => (
                                             <blockquote key={i} className="mt-1 border-l-2 border-blue-300 pl-2 text-xs italic text-blue-900/80">
                                                "...<HighlightedText text={ev.snippet} term={highlightTerm} />..." (Nguồn: <span className="font-medium">{ev.sourceDocument}</span>)
                                            </blockquote>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {isAddingLaw ? (
                            <div className="p-3 border border-slate-300 rounded-md space-y-2 animate-fade-in bg-slate-50">
                               <input type="text" placeholder="Tên văn bản (VD: Bộ luật Dân sự 2015)" value={newLaw.documentName} onChange={(e) => setNewLaw({...newLaw, documentName: e.target.value})} className="w-full p-1.5 text-sm border rounded"/>
                               {newLaw.articles.map((art, i) => (
                                   <div key={i} className="flex gap-2 items-start">
                                       <input type="text" placeholder="Điều luật" value={art.articleNumber} onChange={(e) => { const arts = [...newLaw.articles]; arts[i].articleNumber = e.target.value; setNewLaw({...newLaw, articles: arts}); }} className="w-1/4 p-1.5 text-sm border rounded"/>
                                       <textarea placeholder="Tóm tắt nội dung điều luật" value={art.summary} onChange={(e) => { const arts = [...newLaw.articles]; arts[i].summary = e.target.value; setNewLaw({...newLaw, articles: arts}); }} className="w-3/4 p-1.5 text-sm border rounded" rows={2}/>
                                   </div>
                               ))}
                               <div className="flex justify-end gap-2">
                                   <button onClick={() => setIsAddingLaw(false)} className="px-3 py-1 text-xs font-semibold bg-slate-200 rounded-md hover:bg-slate-300">Hủy</button>
                                   <button onClick={handleAddNewLaw} className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">Thêm</button>
                               </div>
                            </div>
                        ) : ( <button onClick={() => setIsAddingLaw(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200"><PlusIcon className="w-4 h-4" />Thêm cơ sở pháp lý</button> )}
                        
                         {explainingLaw && (
                            <div className="mt-2 p-3 bg-slate-100 rounded-md animate-fade-in">
                               <p className="font-semibold text-sm">Giải thích cho: {explainingLaw}</p>
                               {explanationError ? <p className="text-red-600 text-sm">{explanationError}</p> : explanation ? <p className="text-sm mt-1">{explanation}</p> : <Loader />}
                            </div>
                        )}
                        {activeChat === 'applicableLawsChat' && <ChatWindow chatHistory={report.applicableLawsChat || []} onSendMessage={(msg) => handleChatSendMessage('applicableLawsChat', msg)} isLoading={isChatLoading} onClose={() => setActiveChat(null)} title="Trao đổi về Cơ sở pháp lý" />}
                    </div>
                </ReportSection>

                <ReportSection title="5. Phân tích Lỗ hổng & Hành động" chatHistory={report.gapAnalysisChat} onChatToggle={() => setActiveChat(prev => prev === 'gapAnalysisChat' ? null : 'gapAnalysisChat')} isChatOpen={activeChat === 'gapAnalysisChat'}>
                    <div className="space-y-3">
                       <h5 className="font-semibold flex items-center gap-2"><InfoIcon className="w-5 h-5 text-slate-500" />Thông tin / Chứng cứ còn thiếu</h5>
                       <ul className="list-disc list-inside pl-2 space-y-1">{report.gapAnalysis?.missingInformation.map((item, i) => <li key={i}><HighlightedText text={item} term={highlightTerm} /></li>)}</ul>
                       <h5 className="font-semibold flex items-center gap-2"><MagicIcon className="w-5 h-5 text-slate-500" />Hành động đề xuất</h5>
                       <ul className="list-disc list-inside pl-2 space-y-1">{report.gapAnalysis?.recommendedActions.map((item, i) => <li key={i}><HighlightedText text={item} term={highlightTerm} /></li>)}</ul>
                       <h5 className="font-semibold flex items-center gap-2"><SearchIcon className="w-5 h-5 text-slate-500" />Lỗ hổng pháp lý tiềm ẩn</h5>
                       <div className="space-y-2 pl-2">
                           {(report.gapAnalysis?.legalLoopholes || []).map((item, i) => (
                               <div key={i} className={`p-3 border-l-4 rounded-r-md text-sm ${getLoopholeSeverityClasses(item.severity)}`}>
                                   <div className="flex items-center gap-2 font-semibold text-slate-800">
                                       {getLoopholeIcon(item.classification)}
                                       <span>[<HighlightedText text={item.classification} term={highlightTerm} /> - Mức độ: <HighlightedText text={item.severity} term={highlightTerm} />]</span>
                                   </div>
                                   <p className="mt-1"><HighlightedText text={item.description} term={highlightTerm} /></p>
                                   <p className="text-slate-600"><span className="font-semibold">Gợi ý:</span> <HighlightedText text={item.suggestion} term={highlightTerm} /></p>
                                   <blockquote className="mt-1 border-l-2 border-slate-300 pl-2 italic text-slate-500 text-xs">"...<HighlightedText text={item.evidence} term={highlightTerm} />..."</blockquote>
                               </div>
                           ))}
                       </div>
                    </div>
                    {activeChat === 'gapAnalysisChat' && <ChatWindow chatHistory={report.gapAnalysisChat || []} onSendMessage={(msg) => handleChatSendMessage('gapAnalysisChat', msg)} isLoading={isChatLoading} onClose={() => setActiveChat(null)} title="Trao đổi về Phân tích Lỗ hổng" />}
                </ReportSection>
                
                 <OpponentAnalysisSection report={report} files={files} onUpdateReport={onUpdateReport} highlightTerm={highlightTerm} />

                <ReportSection title="6. Đánh giá Triển vọng Vụ việc" chatHistory={report.prospectsChat} onChatToggle={() => setActiveChat(prev => prev === 'prospectsChat' ? null : 'prospectsChat')} isChatOpen={activeChat === 'prospectsChat'}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-3 bg-green-50 border-l-4 border-green-300 rounded-r-md">
                           <h5 className="font-semibold text-green-800 mb-2">Điểm mạnh</h5>
                           <ul className="list-disc list-inside space-y-1 text-green-900">{report.caseProspects?.strengths.map((item, i) => <li key={i}><HighlightedText text={item} term={highlightTerm} /></li>)}</ul>
                        </div>
                        <div className="p-3 bg-amber-50 border-l-4 border-amber-300 rounded-r-md">
                           <h5 className="font-semibold text-amber-800 mb-2">Điểm yếu & Biện pháp Khắc phục (Cáo già)</h5>
                           <div className="text-amber-900 space-y-2 text-sm">
                               {report.caseProspects?.weaknesses.map((item, i) => (
                                   <div key={i} className="mb-1"><HighlightedText text={item} term={highlightTerm} /></div>
                               ))}
                           </div>
                        </div>
                        <div className="p-3 bg-red-50 border-l-4 border-red-300 rounded-r-md">
                           <h5 className="font-semibold text-red-800 mb-2">Rủi ro</h5>
                           <ul className="list-disc list-inside space-y-1 text-red-900">{report.caseProspects?.risks.map((item, i) => <li key={i}><HighlightedText text={item} term={highlightTerm} /></li>)}</ul>
                        </div>
                    </div>
                    {activeChat === 'prospectsChat' && <ChatWindow chatHistory={report.prospectsChat || []} onSendMessage={(msg) => handleChatSendMessage('prospectsChat', msg)} isLoading={isChatLoading} onClose={() => setActiveChat(null)} title="Trao đổi về Triển vọng Vụ việc" />}
                </ReportSection>

                <ReportSection title="7. Đề xuất Lộ trình & Chiến lược" chatHistory={report.strategyChat} onChatToggle={() => setActiveChat(prev => prev === 'strategyChat' ? null : 'strategyChat')} isChatOpen={activeChat === 'strategyChat'}>
                    <div className="space-y-4">
                        {report.proposedStrategy?.psychologicalStrategy && (
                            <div className="p-3 bg-purple-50 border-l-4 border-purple-500 rounded-r-md shadow-sm">
                                <h5 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                                    <BrainIcon className="w-5 h-5" />
                                    Chiến lược Tâm lý & Phán đoán (Cáo già)
                                </h5>
                                <div className="text-sm text-purple-800">
                                    <CunningLawyerText text={report.proposedStrategy.psychologicalStrategy} />
                                </div>
                            </div>
                        )}
                        
                         {report.proposedStrategy?.proceduralTactics && report.proposedStrategy.proceduralTactics.length > 0 && (
                            <div className="p-3 bg-indigo-50 border-l-4 border-indigo-500 rounded-r-md shadow-sm">
                                <h5 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                                    <ShieldCheckIcon className="w-5 h-5" />
                                    Chiến thuật Tố tụng & Thủ tục (Cáo già)
                                </h5>
                                <ul className="list-disc list-inside space-y-1 text-indigo-800 text-sm">
                                    {report.proposedStrategy.proceduralTactics.map((tactic, i) => (
                                        <li key={i}><HighlightedText text={tactic} term={highlightTerm} /></li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                            <h5 className="font-semibold mb-2">Giai đoạn Tiền tố tụng</h5>
                            <ul className="list-decimal list-inside space-y-1">{report.proposedStrategy?.preLitigation.map((item, i) => <li key={i}><HighlightedText text={item} term={highlightTerm} /></li>)}</ul>
                            </div>
                            <div>
                            <h5 className="font-semibold mb-2">Giai đoạn Tố tụng</h5>
                            <ul className="list-decimal list-inside space-y-1">{report.proposedStrategy?.litigation.map((item, i) => <li key={i}><HighlightedText text={item} term={highlightTerm} /></li>)}</ul>
                            </div>
                        </div>
                    </div>
                     <DevilAdvocateSection report={report} />
                     {activeChat === 'strategyChat' && <ChatWindow chatHistory={report.strategyChat || []} onSendMessage={(msg) => handleChatSendMessage('strategyChat', msg)} isLoading={isChatLoading} onClose={() => setActiveChat(null)} title="Trao đổi về Chiến lược Đề xuất" />}
                </ReportSection>

                {report.contingencyPlan && (
                    <ReportSection title="8. Phương án xử lý nếu thua kiện" chatHistory={report.contingencyPlanChat} onChatToggle={() => setActiveChat(prev => prev === 'contingencyPlanChat' ? null : 'contingencyPlanChat')} isChatOpen={activeChat === 'contingencyPlanChat'}>
                        <ul className="list-disc list-inside space-y-1.5">{report.contingencyPlan.map((item, i) => <li key={i}><HighlightedText text={item} term={highlightTerm} /></li>)}</ul>
                         {activeChat === 'contingencyPlanChat' && <ChatWindow chatHistory={report.contingencyPlanChat || []} onSendMessage={(msg) => handleChatSendMessage('contingencyPlanChat', msg)} isLoading={isChatLoading} onClose={() => setActiveChat(null)} title="Trao đổi về Phương án Dự phòng" />}
                    </ReportSection>
                )}
                </>
            )}
        </div>
    );
};
