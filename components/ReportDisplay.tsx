import React, { useState, useRef, useEffect } from 'react';
import type { AnalysisReport, ApplicableLaw, LawArticle, UploadedFile, LitigationType, LegalLoophole, ChatMessage } from '../types.ts';
import { MagicIcon } from './icons/MagicIcon.tsx';
import { explainLaw, continueResolutionChat } from '../services/geminiService.ts';
import { Loader } from './Loader.tsx';
import { SearchIcon } from './icons/SearchIcon.tsx';
import { getStageLabel } from '../constants.ts';
import { PlusIcon } from './icons/PlusIcon.tsx';
import { TrashIcon } from './icons/TrashIcon.tsx';
import { ChatIcon } from './icons/ChatIcon.tsx';
import { SendIcon } from './icons/SendIcon.tsx';

// --- Internal Components and Icons ---

const EditIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
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
const ProcedureIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
  </svg>
);
const InfoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
  </svg>
);


interface UserLawsManagerProps {
    laws: ApplicableLaw[];
    onUpdate: (updatedLaws: ApplicableLaw[]) => void;
}

const emptyLaw: ApplicableLaw = { documentName: '', articles: [{ articleNumber: '', summary: '' }] };
const emptyArticle: LawArticle = { articleNumber: '', summary: '' };

const UserLawsManager: React.FC<UserLawsManagerProps> = ({ laws, onUpdate }) => {
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [currentLaw, setCurrentLaw] = useState<ApplicableLaw>(JSON.parse(JSON.stringify(emptyLaw)));
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const handleEdit = (index: number) => {
        setCurrentLaw(JSON.parse(JSON.stringify(laws[index])));
        setEditingIndex(index);
        setIsFormVisible(true);
    };

    const handleDelete = (index: number) => {
        if (window.confirm('Bạn có chắc muốn xóa cơ sở pháp lý này?')) {
            const updatedLaws = laws.filter((_, i) => i !== index);
            onUpdate(updatedLaws);
        }
    };
    
    const handleAddNew = () => {
        setCurrentLaw(JSON.parse(JSON.stringify(emptyLaw)));
        setEditingIndex(null);
        setIsFormVisible(true);
    };

    const handleCancel = () => {
        setIsFormVisible(false);
        setEditingIndex(null);
        setCurrentLaw(JSON.parse(JSON.stringify(emptyLaw)));
    };

    const handleSave = () => {
        if (!currentLaw.documentName.trim() || currentLaw.articles.some(a => !a.articleNumber.trim() || !a.summary.trim())) {
            alert('Vui lòng điền đầy đủ thông tin Tên văn bản và các điều luật.');
            return;
        }

        const updatedLaws = [...laws];
        if (editingIndex !== null) {
            updatedLaws[editingIndex] = currentLaw;
        } else {
            updatedLaws.push(currentLaw);
        }
        onUpdate(updatedLaws);
        handleCancel();
    };

    const handleLawChange = (field: keyof ApplicableLaw, value: any) => {
        setCurrentLaw(prev => ({ ...prev, [field]: value }));
    };

    const handleArticleChange = (articleIndex: number, field: keyof LawArticle, value: string) => {
        const newArticles = [...currentLaw.articles];
        newArticles[articleIndex] = { ...newArticles[articleIndex], [field]: value };
        handleLawChange('articles', newArticles);
    };

    const addArticle = () => {
        handleLawChange('articles', [...currentLaw.articles, { ...emptyArticle }]);
    };

    const removeArticle = (articleIndex: number) => {
        if (currentLaw.articles.length <= 1) {
            alert('Phải có ít nhất một điều luật.');
            return;
        }
        const newArticles = currentLaw.articles.filter((_, i) => i !== articleIndex);
        handleLawChange('articles', newArticles);
    };

    return (
        <div>
            <div className="space-y-3">
                {laws.map((law, index) => (
                    <div key={index} className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                        <div className="flex justify-between items-start">
                             <h4 className="font-semibold text-slate-800 flex-grow">{law.documentName}</h4>
                             <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                <button onClick={() => handleEdit(index)} className="p-1 text-slate-500 hover:text-blue-600" title="Chỉnh sửa"><EditIcon className="w-4 h-4" /></button>
                                <button onClick={() => handleDelete(index)} className="p-1 text-slate-500 hover:text-red-600" title="Xóa"><TrashIcon className="w-4 h-4" /></button>
                             </div>
                        </div>
                        <ul className="list-disc list-inside space-y-1 pl-4 mt-2 text-sm text-slate-700">
                            {law.articles.map((article, aIndex) => (
                                <li key={aIndex}>
                                    <strong className="font-semibold">{article.articleNumber}:</strong> {article.summary}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {isFormVisible && (
                <div className="mt-4 p-4 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50/50 animate-fade-in">
                    <h4 className="text-base font-bold text-slate-800 mb-3">{editingIndex !== null ? 'Chỉnh sửa' : 'Thêm mới'} Cơ sở pháp lý</h4>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-1">Tên văn bản</label>
                            <input type="text" value={currentLaw.documentName} onChange={(e) => handleLawChange('documentName', e.target.value)} className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-1">Các điều luật</label>
                            <div className="space-y-3 mt-1">
                                {currentLaw.articles.map((article, aIndex) => (
                                    <div key={aIndex} className="p-3 bg-white border rounded-md grid grid-cols-12 gap-3 items-start">
                                        <input type="text" placeholder="Điều X" value={article.articleNumber} onChange={(e) => handleArticleChange(aIndex, 'articleNumber', e.target.value)} className="col-span-12 sm:col-span-3 p-2 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500" />
                                        <textarea placeholder="Tóm tắt nội dung..." value={article.summary} onChange={(e) => handleArticleChange(aIndex, 'summary', e.target.value)} className="col-span-12 sm:col-span-8 p-2 border border-slate-300 rounded-md min-h-[40px] resize-y text-sm focus:ring-1 focus:ring-blue-500" rows={1}></textarea>
                                        <button onClick={() => removeArticle(aIndex)} className="col-span-12 sm:col-span-1 p-2 text-slate-400 hover:text-red-600 flex justify-center items-center h-full"><TrashIcon className="w-5 h-5"/></button>
                                    </div>
                                ))}
                            </div>
                             <button onClick={addArticle} className="mt-2 flex items-center gap-1 text-sm text-blue-600 font-semibold hover:text-blue-800">
                                <PlusIcon className="w-4 h-4"/> Thêm điều luật
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <button onClick={handleCancel} className="px-4 py-2 text-sm font-semibold bg-slate-200 rounded-md hover:bg-slate-300">Hủy</button>
                        <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">Lưu</button>
                    </div>
                </div>
            )}

            {!isFormVisible && (
                <div className="mt-4">
                    <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 text-sm border border-blue-200 hover:border-blue-300 transition-colors">
                        <PlusIcon className="w-5 h-5"/> Thêm Cơ sở pháp lý
                    </button>
                </div>
            )}
        </div>
    );
};


interface ReportDisplayProps {
  report: AnalysisReport | null;
  files: UploadedFile[];
  onPreview: (file: UploadedFile) => void;
  onClearSummary: () => void;
  litigationType: LitigationType;
  onUpdateUserLaws: (updatedLaws: ApplicableLaw[]) => void;
  onUpdateReport: (updatedReport: AnalysisReport) => void;
  caseSummary?: string;
  clientRequestSummary?: string;
}

const HighlightedText: React.FC<{ text: string | undefined; term: string }> = React.memo(({ text, term }) => {
    if (!term.trim() || !text) {
        return <>{text}</>;
    }
    // Escape special characters for regex
    const escapedTerm = term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <mark key={i} className="bg-yellow-300 text-yellow-900 px-0.5 rounded-sm">
                        {part}
                    </mark>
                ) : (
                    <React.Fragment key={i}>{part}</React.Fragment>
                )
            )}
        </>
    );
});


const Section: React.FC<{ title: string; children: React.ReactNode; id?: string; highlightTerm: string; }> = ({ title, children, id, highlightTerm }) => (
  <div id={id} className="mb-8">
    <h3 className="text-lg font-semibold text-slate-900 border-b-2 border-slate-100 pb-2 mb-4">
        <HighlightedText text={title} term={highlightTerm} />
    </h3>
    <div className="space-y-3 text-slate-700">
      {children}
    </div>
  </div>
);

const BulletList: React.FC<{ items: string[]; title: string; highlightTerm: string; }> = ({ items, title, highlightTerm }) => (
  <div>
      <h4 className="font-semibold text-slate-800"><HighlightedText text={title} term={highlightTerm} />:</h4>
      <ul className="list-disc list-inside mt-1 space-y-1 pl-1">
          {items.map((item, index) => <li key={index}><HighlightedText text={item} term={highlightTerm} /></li>)}
      </ul>
  </div>
);

const LegalLoopholesDisplay: React.FC<{ loopholes: LegalLoophole[]; highlightTerm: string }> = ({ loopholes, highlightTerm }) => {
    const getSeverityClasses = (severity: LegalLoophole['severity']) => {
        switch (severity) {
            case 'Cao': return 'bg-red-100 text-red-800 border-red-300';
            case 'Trung bình': return 'bg-amber-100 text-amber-800 border-amber-300';
            case 'Thấp': return 'bg-green-100 text-green-800 border-green-300';
            default: return 'bg-slate-100 text-slate-800 border-slate-300';
        }
    };

    const groupedLoopholes = loopholes.reduce((acc, loophole) => {
        const key = loophole.classification;
        if (!acc[key]) acc[key] = [];
        acc[key].push(loophole);
        return acc;
    }, {} as Record<LegalLoophole['classification'], LegalLoophole[]>);

    const classificationOrder: LegalLoophole['classification'][] = ['Hợp đồng', 'Quy phạm Pháp luật', 'Tố tụng', 'Khác'];

    const classificationMeta: Record<LegalLoophole['classification'], { icon: React.ReactNode; color: string; title: string }> = {
        'Hợp đồng': { icon: <ContractIcon className="w-6 h-6" />, color: 'bg-purple-50 text-purple-800 border-purple-200', title: 'Lỗ hổng trong Hợp đồng' },
        'Quy phạm Pháp luật': { icon: <LawIcon className="w-6 h-6" />, color: 'bg-teal-50 text-teal-800 border-teal-200', title: 'Lỗ hổng trong Luật & QPPL' },
        'Tố tụng': { icon: <ProcedureIcon className="w-6 h-6" />, color: 'bg-indigo-50 text-indigo-800 border-indigo-200', title: 'Lỗ hổng trong Quy trình Tố tụng' },
        'Khác': { icon: <InfoIcon className="w-6 h-6" />, color: 'bg-slate-100 text-slate-800 border-slate-200', title: 'Lỗ hổng Khác' },
    };

    return (
        <div className="space-y-6">
            {classificationOrder
                .filter(classification => groupedLoopholes[classification])
                .map(classification => (
                    <div key={classification}>
                        <div className={`flex items-center gap-3 p-2 rounded-t-lg border-b-2 ${classificationMeta[classification].color}`}>
                            <div className="flex-shrink-0">{classificationMeta[classification].icon}</div>
                            <h5 className="font-bold text-base">
                                <HighlightedText text={classificationMeta[classification].title} term={highlightTerm} />
                            </h5>
                        </div>
                        <div className="space-y-3 pt-3">
                            {groupedLoopholes[classification].map((item, index) => (
                                <div key={index} className="p-4 bg-white border border-slate-200 rounded-lg soft-shadow ml-4 border-l-4">
                                     <div className="flex justify-end items-start mb-2">
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getSeverityClasses(item.severity)}`}>
                                            <HighlightedText text={`Mức độ: ${item.severity}`} term={highlightTerm} />
                                        </span>
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <p className="font-semibold text-slate-600">Mô tả:</p>
                                            <p className="text-slate-700"><HighlightedText text={item.description} term={highlightTerm} /></p>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-600">Gợi ý:</p>
                                            <p className="text-slate-700"><HighlightedText text={item.suggestion} term={highlightTerm} /></p>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-600">Cơ sở phát hiện (trích dẫn):</p>
                                            <blockquote className="border-l-4 border-slate-300 pl-3 italic text-slate-500 bg-slate-50 py-2">
                                                <HighlightedText text={item.evidence} term={highlightTerm} />
                                            </blockquote>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
        </div>
    );
};

const ResolutionChat: React.FC<{
    report: AnalysisReport;
    onUpdateReport: (updatedReport: AnalysisReport) => void;
}> = ({ report, onUpdateReport }) => {
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatHistory = report.resolutionPlanChat || [];
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        const newUserMessage: ChatMessage = { role: 'user', content: userInput.trim() };
        const updatedChatHistory = [...chatHistory, newUserMessage];
        
        // Optimistically update UI
        onUpdateReport({ ...report, resolutionPlanChat: updatedChatHistory });
        setUserInput('');
        setIsLoading(true);
        setError(null);

        try {
            const aiResponseContent = await continueResolutionChat(report, updatedChatHistory, newUserMessage.content);
            const aiMessage: ChatMessage = { role: 'model', content: aiResponseContent };
            // Final update with AI response
            onUpdateReport({ ...report, resolutionPlanChat: [...updatedChatHistory, aiMessage] });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="mt-4 p-4 border-t-2 border-dashed border-blue-300 bg-blue-50/50 rounded-lg">
            <h4 className="text-base font-bold text-slate-800 mb-3">Trao đổi & Phát triển Phương án</h4>
            <div className="bg-white border border-slate-200 rounded-lg p-3 max-h-80 overflow-y-auto space-y-4">
                {chatHistory.map((msg, index) => (
                    <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'model' && (
                             <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                                <MagicIcon className="w-5 h-5 text-white"/>
                            </div>
                        )}
                        <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex gap-3">
                         <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                            <MagicIcon className="w-5 h-5 text-white"/>
                        </div>
                        <div className="max-w-[80%] p-3 rounded-lg bg-slate-100 text-slate-800 flex items-center">
                            <Loader />
                        </div>
                    </div>
                )}
                 <div ref={chatEndRef} />
            </div>
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            <form onSubmit={handleSendMessage} className="mt-3 flex gap-2">
                <input 
                    type="text" 
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Đặt câu hỏi hoặc đề xuất ý tưởng..."
                    className="flex-grow p-2 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500"
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading || !userInput.trim()} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-slate-400 flex items-center justify-center">
                    <SendIcon className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
};


export const ReportDisplay: React.FC<ReportDisplayProps> = ({ report, onClearSummary, litigationType, onUpdateUserLaws, onUpdateReport, caseSummary, clientRequestSummary }) => {
  const [explanation, setExplanation] = useState<{
    law: string;
    content: string;
    isLoading: boolean;
    error: string | null;
    rect: DOMRect | null;
  } | null>(null);
  const [highlightTerm, setHighlightTerm] = useState('');
  const [isChatVisible, setIsChatVisible] = useState(false);


  const handleLawClick = async (law: ApplicableLaw, article: LawArticle, event: React.MouseEvent<HTMLButtonElement>) => {
    const lawText = `${article.articleNumber} ${law.documentName}`;
    if (explanation?.law === lawText) {
      setExplanation(null);
      return;
    }

    const buttonRect = event.currentTarget.getBoundingClientRect();
    setExplanation({
      law: lawText,
      content: '',
      isLoading: true,
      error: null,
      rect: buttonRect,
    });

    try {
      const result = await explainLaw(lawText);
      setExplanation(prev => (prev?.law === lawText ? { ...prev, content: result, isLoading: false } : prev));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định.';
      setExplanation(prev => (prev?.law === lawText ? { ...prev, error: errorMessage, isLoading: false } : prev));
    }
  };

  return (
    <div id="report-content" className="animate-fade-in">
      <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <SearchIcon className="w-5 h-5 text-slate-400" />
          </div>
          <input
              type="text"
              value={highlightTerm}
              onChange={(e) => setHighlightTerm(e.target.value)}
              placeholder="Tìm kiếm và tô sáng nội dung trong báo cáo..."
              aria-label="Tìm kiếm trong báo cáo"
              className="w-full py-2 pl-10 pr-10 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          {highlightTerm && (
              <button
                  onClick={() => setHighlightTerm('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                  aria-label="Xóa tìm kiếm"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
              </button>
          )}
      </div>

      {report?.quickSummary && (
        <div className="mb-8 p-5 bg-blue-50 border-l-4 border-blue-500 rounded-lg relative animate-fade-in-down shadow-md shadow-blue-500/10">
            <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <MagicIcon className="w-6 h-6 text-blue-600" />
                    <HighlightedText text="Tóm tắt Nhanh" term={highlightTerm} />
                </h3>
                 <button 
                    onClick={onClearSummary} 
                    className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100/50"
                    title="Ẩn tóm tắt"
                 >
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                     </svg>
                 </button>
            </div>
            <p className="text-slate-800 whitespace-pre-wrap ml-8"><HighlightedText text={report.quickSummary} term={highlightTerm} /></p>
        </div>
      )}

      {caseSummary && (
        <Section title="Tóm tắt Diễn biến Vụ việc (do AI rút trích)" highlightTerm={highlightTerm}>
          <p className="whitespace-pre-wrap break-words bg-slate-50 border-l-4 border-slate-300 p-4 text-slate-800 rounded-md">
            <HighlightedText text={caseSummary} term={highlightTerm} />
          </p>
        </Section>
      )}

      {clientRequestSummary && (
        <Section title="Yêu cầu của Khách hàng (do AI tóm tắt)" highlightTerm={highlightTerm}>
          <p className="whitespace-pre-wrap break-words bg-slate-50 border-l-4 border-slate-300 p-4 text-slate-800 rounded-md">
            <HighlightedText text={clientRequestSummary} term={highlightTerm} />
          </p>
        </Section>
      )}

      {report?.customNotes && (
        <Section title="Ghi chú Tùy chỉnh" id="customNotesSection" highlightTerm={highlightTerm}>
          <p className="whitespace-pre-wrap bg-yellow-50 border-l-4 border-yellow-300 p-4 text-slate-800 rounded-md"><HighlightedText text={report.customNotes} term={highlightTerm} /></p>
        </Section>
      )}

      {report?.litigationStage && (
        <Section title="Giai đoạn Tố tụng (do AI xác định)" highlightTerm={highlightTerm}>
          <p className="font-bold text-blue-700 bg-blue-50 px-3 py-2 inline-block rounded-md border border-blue-200">
            <HighlightedText text={getStageLabel(litigationType, report.litigationStage)} term={highlightTerm} />
          </p>
        </Section>
      )}

      {report?.legalRelationship && (
        <Section title="1. Quan hệ pháp luật" id="legalRelationship" highlightTerm={highlightTerm}>
          <p><HighlightedText text={report.legalRelationship} term={highlightTerm} /></p>
        </Section>
      )}

      {report?.proceduralStatus && report.proceduralStatus.length > 0 && (
         <Section title="2. Tư cách Tố tụng" id="proceduralStatus" highlightTerm={highlightTerm}>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                {report.proceduralStatus.map((party, index) => (
                    <p key={index}>
                        <strong className="font-semibold text-slate-800"><HighlightedText text={party.partyName} term={highlightTerm} />:</strong>
                        <span className="ml-2"><HighlightedText text={party.status} term={highlightTerm} /></span>
                    </p>
                ))}
            </div>
        </Section>
      )}

      {report?.coreLegalIssues && report.coreLegalIssues.length > 0 && (
         <Section title="3. Vấn đề pháp lý cốt lõi" id="coreLegalIssues" highlightTerm={highlightTerm}>
            <ul className="list-disc list-inside space-y-1.5 pl-1">
                {report.coreLegalIssues.map((issue, index) => (
                    <li key={index}><HighlightedText text={issue} term={highlightTerm} /></li>
                ))}
            </ul>
        </Section>
      )}

      {report?.requestResolutionPlan && report.requestResolutionPlan.length > 0 && (
         <Section title="4. Phương án giải quyết theo Yêu cầu" id="requestResolutionPlan" highlightTerm={highlightTerm}>
            <div className="bg-blue-50/70 p-4 rounded-lg border border-blue-200">
                <ul className="list-decimal list-inside space-y-1.5 pl-1">
                    {report.requestResolutionPlan.map((step, index) => (
                        <li key={index}><HighlightedText text={step} term={highlightTerm} /></li>
                    ))}
                </ul>
                 <div className="mt-4 pt-4 border-t border-blue-200/50">
                     <button onClick={() => setIsChatVisible(p => !p)} className="flex items-center gap-2 text-sm text-blue-700 font-bold hover:text-blue-900">
                        <ChatIcon className="w-5 h-5"/>
                        <span>{isChatVisible ? 'Ẩn' : 'Trao đổi với Trợ lý AI để phát triển phương án'}</span>
                    </button>
                </div>
                 {isChatVisible && report && (
                    <ResolutionChat report={report} onUpdateReport={onUpdateReport} />
                )}
            </div>
        </Section>
      )}

      {report?.applicableLaws && report.applicableLaws.length > 0 && (
        <Section title="5. Cơ sở pháp lý áp dụng (do AI đề xuất)" id="applicableLaws" highlightTerm={highlightTerm}>
            <div className="space-y-4">
                {report.applicableLaws.map((law, lawIndex) => (
                    <div key={lawIndex} className="p-4 bg-white border border-slate-200 rounded-lg soft-shadow">
                        <h4 className="font-bold text-slate-800 text-base mb-2">
                            <HighlightedText text={law.documentName} term={highlightTerm} />
                        </h4>
                        
                        {law.coreIssueAddressed && law.relevanceToCase && (
                            <div className="mb-3 pl-4 border-l-4 border-blue-300 text-sm space-y-2 py-2 bg-slate-50/50 rounded-r-md">
                                <div>
                                    <p className="font-semibold text-slate-600">Vấn đề pháp lý giải quyết:</p>
                                    <p className="text-slate-700"><HighlightedText text={law.coreIssueAddressed} term={highlightTerm} /></p>
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-600">Liên quan đến vụ việc:</p>
                                    <p className="text-slate-700"><HighlightedText text={law.relevanceToCase} term={highlightTerm} /></p>
                                </div>
                            </div>
                        )}

                        <h5 className="font-semibold text-sm text-slate-700 mb-1 mt-3">Các điều luật áp dụng:</h5>
                        <ul className="space-y-1">
                            {law.articles.map((article, articleIndex) => (
                                <li key={articleIndex}>
                                    <button
                                        onClick={(e) => handleLawClick(law, article, e)}
                                        className="text-left w-full p-2 rounded-lg transition-colors group hover:bg-blue-100"
                                        aria-label={`Giải thích ${article.articleNumber} ${law.documentName}`}
                                    >
                                        <strong className="font-semibold text-slate-800">
                                            <HighlightedText text={article.articleNumber} term={highlightTerm} />:
                                        </strong>
                                        <span className="ml-2 text-slate-700">
                                            <HighlightedText text={article.summary} term={highlightTerm} />
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </Section>
      )}

      <Section title="6. Cơ sở pháp lý Bổ sung (do người dùng thêm)" id="userAddedLaws" highlightTerm={highlightTerm}>
        <UserLawsManager 
            laws={report?.userAddedLaws || []}
            onUpdate={onUpdateUserLaws}
        />
      </Section>


      {report?.gapAnalysis && (
        <Section title="7. Phân tích Lỗ hổng & Hành động Đề xuất" id="gapAnalysis" highlightTerm={highlightTerm}>
          <div className="flex flex-col gap-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BulletList title="Thông tin / Chứng cứ còn thiếu" items={report.gapAnalysis.missingInformation} highlightTerm={highlightTerm} />
                <BulletList title="Hành động đề xuất" items={report.gapAnalysis.recommendedActions} highlightTerm={highlightTerm} />
              </div>
              {report.gapAnalysis.legalLoopholes && report.gapAnalysis.legalLoopholes.length > 0 && (
                 <div className="pt-4 border-t border-slate-200 mt-2">
                     <h4 className="font-semibold text-slate-800 mb-3"><HighlightedText text="Phân tích Lỗ hổng Pháp lý Tiềm ẩn" term={highlightTerm} />:</h4>
                     <LegalLoopholesDisplay loopholes={report.gapAnalysis.legalLoopholes} highlightTerm={highlightTerm} />
                 </div>
              )}
          </div>
        </Section>
      )}

      {report?.caseProspects && (
        <Section title="8. Đánh giá Triển vọng Vụ việc" id="caseProspects" highlightTerm={highlightTerm}>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <BulletList title="Điểm mạnh" items={report.caseProspects.strengths} highlightTerm={highlightTerm} />
                </div>
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                     <BulletList title="Điểm yếu" items={report.caseProspects.weaknesses} highlightTerm={highlightTerm} />
                </div>
                 <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                     <BulletList title="Rủi ro" items={report.caseProspects.risks} highlightTerm={highlightTerm} />
                </div>
           </div>
        </Section>
      )}
      
      {report?.proposedStrategy && (
        <Section title="9. Đề xuất Lộ trình & Chiến lược" id="proposedStrategy" highlightTerm={highlightTerm}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50/70 p-4 rounded-lg border border-blue-200">
                  <BulletList title="Giai đoạn Tiền tố tụng" items={report.proposedStrategy.preLitigation} highlightTerm={highlightTerm} />
              </div>
               <div className="bg-blue-50/70 p-4 rounded-lg border border-blue-200">
                  <BulletList title="Giai đoạn Tố tụng" items={report.proposedStrategy.litigation} highlightTerm={highlightTerm} />
              </div>
          </div>
        </Section>
      )}
      
      {report?.contingencyPlan && report.contingencyPlan.length > 0 && (
        <Section title="10. Phương án xử lý nếu thua kiện" id="contingencyPlan" highlightTerm={highlightTerm}>
            <div className="bg-amber-50/70 p-4 rounded-lg border border-amber-200">
                <ul className="list-disc list-inside space-y-1.5 pl-1">
                    {report.contingencyPlan.map((item, index) => (
                        <li key={index}><HighlightedText text={item} term={highlightTerm} /></li>
                    ))}
                </ul>
            </div>
        </Section>
      )}

      {explanation && (
        <div
            style={{
                top: explanation.rect ? window.scrollY + explanation.rect.bottom + 8 : 0,
                left: explanation.rect ? explanation.rect.left : 0,
                maxWidth: '400px',
            }}
            className="fixed z-50 p-4 bg-white rounded-lg shadow-xl border border-slate-200 animate-fade-in-down w-full"
            role="dialog"
            aria-modal="true"
        >
            <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-200">
                <h4 className="font-semibold text-slate-800 text-sm truncate pr-2">Giải thích: {explanation.law}</h4>
                <button 
                    onClick={() => setExplanation(null)} 
                    className="text-slate-400 hover:text-red-600 text-2xl leading-none"
                    aria-label="Đóng"
                >&times;</button>
            </div>
            <div className="min-h-[40px]">
                {explanation.isLoading && (
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Loader />
                        <span>AI đang phân tích...</span>
                    </div>
                )}
                {explanation.error && <p className="text-red-600 text-sm">{explanation.error}</p>}
                {explanation.content && <p className="text-slate-700 text-sm whitespace-pre-wrap">{explanation.content}</p>}
            </div>
        </div>
      )}
    </div>
  );
};