
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FileUpload } from './FileUpload.tsx';
import { Loader } from './Loader.tsx';
import { MagicIcon } from './icons/MagicIcon.tsx';
import { analyzeConsultingCase, generateConsultingDocument, categorizeMultipleFiles, summarizeText, refineQuickAnswer, continueConsultingChat, analyzeBusinessFormation, generateDocumentFromTemplate, continueBusinessFormationChat } from '../services/geminiService.ts';
import type { UploadedFile, SavedCase, SerializableFile, ConsultingReport, LitigationType, LegalLoophole, ChatMessage, BusinessFormationReport, DocType, FormData } from '../types.ts';
import { BackIcon } from './icons/BackIcon.tsx';
import { saveCase } from '../services/db.ts';
import { SaveCaseIcon } from './icons/SaveCaseIcon.tsx';
import { PlusIcon } from './icons/PlusIcon.tsx';
import { ProcessingProgress } from './ProcessingProgress.tsx';
import { MicrophoneIcon } from './icons/MicrophoneIcon.tsx';
import { ChatIcon } from './icons/ChatIcon.tsx';
import { SendIcon } from './icons/SendIcon.tsx';
import { ChatBubbleLeftIcon } from './icons/ChatBubbleLeftIcon.tsx';
import { DOC_TYPE_FIELDS, FIELD_LABELS, REGIONAL_COURTS } from '../constants.ts';

// --- Internal Icons ---
const MinimizeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
  </svg>
);
const MaximizeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9M20.25 20.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />
    </svg>
);
const CopyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m9.75 11.625-3.75-3.75" />
    </svg>
);
const DiscussionIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.006 3 11.55c0 2.944 1.79 5.515 4.5 6.943.25.123.5.217.75.284V21a.75.75 0 0 0 .94.724l2.16-1.08a8.25 8.25 0 0 0 4.66 0l2.16 1.08a.75.75 0 0 0 .94-.724v-2.008c.25-.067.5-.16.75-.284A8.845 8.845 0 0 0 21 11.55c0-4.556-4.03-8.25-9-8.25Z" />
    </svg>
);
const CaseInfoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 4.8424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75c0-.231-.035-.454-.1-.664M6.75 7.5h10.5a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25-2.25H6.75a2.25 2.25 0 0 1-2.25-2.25v-7.5a2.25 2.25 0 0 1 2.25-2.25Z" />
    </svg>
);
const DocumentSuggestionIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9h7.5m-7.5 3h7.5m-11.25-3h.008v.008h-.008V12Zm0 3h.008v.008h-.008V15Zm-3.75-3h.008v.008h-.008V12Zm0 3h.008v.008h-.008V15Zm-3.75-3h.008v.008h-.008V12Zm0 3h.008v.008h-.008V15Z" />
    </svg>
);
const ExclamationTriangleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
);
const LightbulbIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.354a15.055 15.055 0 0 1-4.5 0M3 10.5a8.25 8.25 0 1 1 15 5.25v.75a2.25 2.25 0 0 1-2.25 2.25H7.5a2.25 2.25 0 0 1-2.25-2.25v-.75a8.25 8.25 0 0 1 1.5-5.25Z" />
    </svg>
);
const RoadmapIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5 3 11.25l3.75 3.75M17.25 7.5 21 11.25l-3.75 3.75M13.5 5.25 10.5 18.75" />
    </svg>
);
const NextStepsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h12A2.25 2.25 0 0 0 20.25 14.25V3M3.75 14.25v-1.5c0-.621.504-1.125 1.125-1.125h14.25c.621 0 1.125.504 1.125 1.125v1.5m-16.5 0v3.75c0 .621.504 1.125 1.125 1.125h14.25c.621 0 1.125.504 1.125-1.125v-3.75m-16.5 0h16.5" />
    </svg>
);
const PaperClipIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.41-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01" />
    </svg>
);
const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);
const ModelComparisonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c.504 0 1.002-.023 1.493-.066M12 3c-5.183 0-9.422 4.01-9.932 9.032a9.004 9.004 0 0 0 8.646 8.208M12 3c5.183 0 9.422 4.01 9.932 9.032a9.004 9.004 0 0 1-8.646 8.208" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18" />
    </svg>
);
const TaxIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V5.25c0-.831-.897-1.336-1.683-1.123l-7.468 2.5a.75.75 0 0 0 0 1.39l7.468 2.5c.786.213 1.683-.292 1.683-1.123v-1.096c0-.753-.727-1.294-1.453-1.096A60.07 60.07 0 0 0 2.25 5.25v13.5Z" />
    </svg>
);

// --- Cunning Lawyer Components ---

const CunningLawyerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM4.5 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM15.375 16.125a2.625 2.625 0 1 1 5.25 0 2.625 2.625 0 0 1-5.25 0ZM12 18.75a.75.75 0 0 0 .75.75h.008a.75.75 0 0 0 .75-.75V18a3 3 0 0 0-1.5 0v.75ZM12 21a.75.75 0 0 0 .75.75h.008a.75.75 0 0 0 .75-.75v-.375a3 3 0 0 0-1.5 0v.375Z" clipRule="evenodd" />
    <path d="M12 1.5c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 1.5 12 1.5ZM8.625 15a.75.75 0 0 0-1.5 0v.625H6.375a.75.75 0 0 0 0 1.5h.75v.625a.75.75 0 0 0 1.5 0v-.625h.75a.75.75 0 0 0 0-1.5h-.75V15Zm6 0a.75.75 0 0 0-1.5 0v.625H12.375a.75.75 0 0 0 0 1.5h.75v.625a.75.75 0 0 0 1.5 0v-.625h.75a.75.75 0 0 0 0-1.5h-.75V15Z" />
  </svg>
);

const LeverageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52v16.5m-3.5-16.5v16.5m-3.5-16.5v16.5m0 0C5.116 20.507 3 19.742 3 18.25V8.75c0-1.492 2.116-2.257 4.5-2.257m0 11.75c2.384 0 4.5-.765 4.5-2.257V8.75C12 7.258 9.884 6.5 7.5 6.5m0 11.75 4.5-11.75" />
  </svg>
);

const ArbitrageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
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

const Alert: React.FC<{ message: string; type: 'error' | 'warning' | 'info' }> = ({ message, type }) => {
    const baseClasses = "p-4 text-sm rounded-lg animate-fade-in";
    const typeClasses = { error: "bg-red-50 text-red-800", warning: "bg-amber-50 text-amber-800", info: "bg-blue-50 text-blue-800" };
    const messageParts = message.split(/:(.*)/s);
    const hasTitle = messageParts.length > 1;
    return (
        <div className={`${baseClasses} ${typeClasses[type]}`} role="alert">
            {hasTitle ? (<><span className="font-bold">{messageParts[0]}:</span><span className="ml-1">{messageParts[1]}</span></>) : message}
        </div>
    );
};

interface WorkflowProps {
    onPreview: (file: UploadedFile) => void;
    onGoBack: () => void;
    activeCase: SavedCase | null;
    onCasesUpdated: () => void;
}

// --- Helper Hook for Mobile Detection ---
const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return isMobile;
};

const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result.split(',')[1]) : reject(new Error('Failed to read file.'));
        reader.onerror = (error) => reject(error);
    });

const base64ToFile = (base64: string, filename: string, mimeType: string): File => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
    const byteArray = new Uint8Array(byteNumbers);
    return new File([byteArray], filename, { type: mimeType });
};

// --- Consulting Chat Component (NEW) ---
const ConsultingChat: React.FC<{
    report: ConsultingReport;
    onUpdateReport: (updatedReport: ConsultingReport) => void;
}> = ({ report, onUpdateReport }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    
    const isMobile = useIsMobile();
    const chatEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }
    }, [report.globalChatHistory, isOpen]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!userInput.trim() && attachedFiles.length === 0) || isLoading) return;

        setIsLoading(true);
        const newUserMessage: ChatMessage = { role: 'user', content: userInput.trim() };
        const currentHistory = report.globalChatHistory || [];
        const updatedHistory = [...currentHistory, newUserMessage];
        
        // Update local history immediately
        onUpdateReport({ ...report, globalChatHistory: updatedHistory });
        
        const attachedUploadedFiles: UploadedFile[] = attachedFiles.map(file => ({
            id: file.name, file, preview: null, category: 'Uncategorized', status: 'pending'
        }));

        try {
            const { chatResponse, updatedReport } = await continueConsultingChat(report, updatedHistory, userInput.trim(), attachedUploadedFiles);
            const aiMessage: ChatMessage = { role: 'model', content: chatResponse };
            const finalHistory = [...updatedHistory, aiMessage];
            
            if (updatedReport) {
                onUpdateReport({ ...updatedReport, globalChatHistory: finalHistory });
            } else {
                onUpdateReport({ ...report, globalChatHistory: finalHistory });
            }
        } catch (err) {
            const errorMessage: ChatMessage = { role: 'model', content: `Lỗi: ${err instanceof Error ? err.message : 'Không thể kết nối tới AI.'}` };
            onUpdateReport({ ...report, globalChatHistory: [...updatedHistory, errorMessage] });
        } finally {
            setUserInput('');
            setAttachedFiles([]);
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)} 
                className="fixed bottom-8 right-8 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-transform hover:scale-110 z-40" 
                aria-label="Mở cửa sổ trò chuyện tư vấn"
                title="Trò chuyện & Hỗ trợ trả lời khách hàng"
            >
                <ChatIcon className="w-8 h-8" />
            </button>
        );
    }

    const mobileClasses = "inset-0 w-full h-full rounded-none";
    const desktopClasses = "bottom-8 right-8 w-[400px] h-[550px] max-h-[80vh] rounded-xl shadow-2xl border border-blue-200";

    return (
        <div className={`fixed bg-white flex flex-col z-50 animate-fade-in ${isMobile ? mobileClasses : desktopClasses}`}>
            <div className="flex justify-between items-center p-4 border-b border-blue-100 bg-blue-50 rounded-t-xl flex-shrink-0">
                <h3 className="font-bold text-blue-900 flex items-center gap-2">
                    <CunningLawyerIcon className="w-5 h-5" />
                    Trò chuyện & Hỗ trợ Trả lời
                </h3>
                <div className="flex items-center gap-1">
                    {!isMobile && (
                        <button onClick={() => setIsOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100" aria-label="Thu nhỏ"><MinimizeIcon className="w-5 h-5"/></button>
                    )}
                    <button onClick={() => setIsOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100" aria-label="Đóng"><XMarkIcon className="w-6 h-6"/></button>
                </div>
            </div>
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {(!report.globalChatHistory || report.globalChatHistory.length === 0) && (
                    <div className="text-center text-slate-400 text-sm py-8">
                        <p>Hãy cập nhật thêm thông tin vụ việc hoặc hỏi: <br/><i>"Khách hàng hỏi X, tôi nên trả lời thế nào?"</i></p>
                    </div>
                )}
                {(report.globalChatHistory || []).map((msg, index) => (
                    <div key={index} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        <div className={`max-w-[85%] p-2.5 rounded-lg text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                ))}
                {isLoading && <div className="flex gap-2.5"><div className="p-2.5 rounded-lg bg-slate-100"><Loader /></div></div>}
                <div ref={chatEndRef} />
            </div>
            <footer className="p-4 border-t border-blue-100 flex-shrink-0">
                {attachedFiles.length > 0 && (<div className="mb-2 space-y-1">{attachedFiles.map((file, index) => (<div key={index} className="flex items-center justify-between text-xs bg-slate-100 p-1.5 rounded"><span className="truncate">{file.name}</span><button onClick={() => setAttachedFiles(p => p.filter((_, i) => i !== index))} className="p-0.5 rounded-full hover:bg-slate-200"><XMarkIcon className="w-3 h-3 text-slate-500"/></button></div>))}</div>)}
                <form onSubmit={handleSendMessage} className="flex items-start gap-2">
                    <textarea 
                        value={userInput} 
                        onChange={e => setUserInput(e.target.value)} 
                        placeholder="Nhập tin nhắn hoặc câu hỏi của khách hàng..." 
                        className="flex-grow p-2 border border-slate-300 rounded-md text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" 
                        rows={2} 
                        disabled={isLoading} 
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }} 
                    />
                     <div className="flex flex-col gap-2">
                        <label className="p-2 bg-slate-100 text-slate-600 font-semibold rounded-md hover:bg-slate-200 cursor-pointer">
                            <PaperClipIcon className="w-5 h-5"/>
                            <input type="file" className="hidden" multiple ref={fileInputRef} onChange={(e) => { if (e.target.files) setAttachedFiles(p => [...p, ...Array.from(e.target.files!)]); if (fileInputRef.current) fileInputRef.current.value = ""; }} accept=".pdf,.doc,.docx,.jpg,.jpeg" disabled={isLoading}/>
                        </label>
                        <button 
                            type="submit" 
                            disabled={isLoading || (!userInput.trim() && attachedFiles.length === 0)} 
                            className="p-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-slate-300"
                        >
                            <SendIcon className="w-5 h-5"/>
                        </button>
                    </div>
                </form>
            </footer>
        </div>
    );
};

export const ConsultingWorkflow: React.FC<WorkflowProps> = ({ onPreview, onGoBack, activeCase, onCasesUpdated }) => {
    // ... (Keep state declarations as is)
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [disputeContent, setDisputeContent] = useState('');
    const [clientRequest, setClientRequest] = useState('');

    const [consultingReport, setConsultingReport] = useState<ConsultingReport | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);

    const [generatedText, setGeneratedText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);
    const [generationRequest, setGenerationRequest] = useState('');

    const [isSaving, setIsSaving] = useState(false);
    const [caseName, setCaseName] = useState('');
    
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPreprocessingFinished, setIsPreprocessingFinished] = useState(false);
    const [isSummarizingField, setIsSummarizingField] = useState<'disputeContent' | 'clientRequest' | null>(null);
    const [summarizationError, setSummarizationError] = useState<string | null>(null);

    const [listeningField, setListeningField] = useState<'disputeContent' | 'clientRequest' | null>(null);
    const recognitionRef = useRef<any>(null);

    const defaultPrompt = `Soạn một bình luận trả lời ngắn gọn, chuyên nghiệp và thể hiện sự đồng cảm cho một bài đăng trên mạng xã hội. Dựa trên phân tích, hãy nhấn mạnh vào một rủi ro pháp lý nghiêm trọng nhất mà họ đang đối mặt và gợi ý 1-2 bước hành động đầu tiên họ nên làm. Kết thúc bằng việc mời họ liên hệ để được tư vấn chi tiết và giải quyết vấn đề.`;

    useEffect(() => {
        if (consultingReport && !generationRequest) {
            setGenerationRequest(defaultPrompt);
        }
    }, [consultingReport, generationRequest]);

    useEffect(() => {
        if (activeCase?.workflowType === 'consulting') {
            const loadedFiles: UploadedFile[] = (activeCase.files || []).map(sf => ({
                id: `${sf.name}-${Math.random()}`, file: base64ToFile(sf.content, sf.name, sf.type),
                preview: null, category: 'Uncategorized', status: 'pending'
            }));
            setFiles(loadedFiles);
            setDisputeContent(activeCase.caseContent || '');
            setClientRequest(activeCase.clientRequest || '');
            setConsultingReport(activeCase.consultingReport || null);
            setCaseName(activeCase.name);
        }
    }, [activeCase]);

    const handleBackClick = () => {
        if (window.confirm("Bạn có chắc chắn muốn quay lại? Mọi dữ liệu chưa lưu sẽ bị mất.")) onGoBack();
    };

    // ... (Keep handleSave, handleSummarizeField, handleMicClick, performAnalysis, handleAnalyzeClick, handleGenerateText, handleRefineAnswer as is)
    const handleSave = async () => {
        if (!activeCase) return;
        const defaultName = caseName || clientRequest || `Tư vấn ngày ${new Date().toLocaleDateString('vi-VN')}`;
        const newCaseName = window.prompt("Nhập tên để lưu nghiệp vụ:", defaultName);
        if (!newCaseName) return;

        setIsSaving(true);
        try {
            const serializableFiles: SerializableFile[] = await Promise.all(
                files.map(async f => ({ name: f.file.name, type: f.file.type, content: await fileToBase64(f.file) }))
            );
            const now = new Date().toISOString();
            const isNewCase = activeCase.id.startsWith('new_');
            const caseToSave: SavedCase = {
                ...activeCase, id: isNewCase ? now : activeCase.id, createdAt: isNewCase ? now : activeCase.createdAt,
                updatedAt: now, name: newCaseName, workflowType: 'consulting', files: serializableFiles, caseContent: disputeContent,
                clientRequest, query: '', litigationType: consultingReport?.caseType !== 'unknown' ? consultingReport?.caseType || null : null,
                litigationStage: 'consulting', analysisReport: null, consultingReport: consultingReport,
            };
            await saveCase(caseToSave);
            onCasesUpdated();
            setCaseName(caseToSave.name);
            alert(`Nghiệp vụ "${newCaseName}" đã được lưu thành công!`);
        } catch (err) {
            console.error("Error saving consulting case:", err);
            alert("Đã xảy ra lỗi khi lưu nghiệp vụ.");
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleSummarizeField = async (fieldName: 'disputeContent' | 'clientRequest') => {
        const textToSummarize = fieldName === 'disputeContent' ? disputeContent : clientRequest;
        if (!textToSummarize.trim()) return;

        setIsSummarizingField(fieldName);
        setSummarizationError(null);
        try {
            const summarizedText = await summarizeText(textToSummarize, fieldName);
            if (fieldName === 'disputeContent') {
                setDisputeContent(summarizedText);
            } else {
                setClientRequest(summarizedText);
            }
        } catch (err) {
            setSummarizationError(err instanceof Error ? err.message : 'Lỗi khi tóm tắt');
        } finally {
            setIsSummarizingField(null);
        }
    };
    
    const handleMicClick = (fieldName: 'disputeContent' | 'clientRequest') => {
        if (listeningField) {
            recognitionRef.current?.stop();
            return;
        }
    
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Trình duyệt của bạn không hỗ trợ tính năng nhận diện giọng nói.");
            return;
        }
    
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.lang = 'vi-VN';
        recognition.interimResults = false;
        recognition.continuous = true;
    
        recognition.onstart = () => {
            setListeningField(fieldName);
        };
    
        recognition.onend = () => {
            setListeningField(null);
            recognitionRef.current = null;
        };
    
        recognition.onerror = (event: any) => {
            console.error("Lỗi nhận diện giọng nói:", event.error);
            setListeningField(null);
        };
    
        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                 if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
    
            if (finalTranscript) {
                const targetSetter = fieldName === 'disputeContent' ? setDisputeContent : setClientRequest;
                targetSetter(prev => (prev ? prev.trim() + ' ' : '') + finalTranscript.trim());
            }
        };
    
        recognition.start();
    };

    const performAnalysis = useCallback(async (filesToAnalyze: UploadedFile[]) => {
        setIsAnalyzing(true);
        try {
            const result = await analyzeConsultingCase(filesToAnalyze, disputeContent, clientRequest);
            setConsultingReport(result);
        } catch (err) {
            setAnalysisError(err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định khi phân tích.");
        } finally {
            setIsAnalyzing(false);
        }
    }, [disputeContent, clientRequest]);
    
    const handleAnalyzeClick = useCallback(async () => {
        setAnalysisError(null);
        setSummarizationError(null);
        setConsultingReport(null);
        setGeneratedText('');

        if (files.length > 0) {
            setIsProcessing(true);
            setIsPreprocessingFinished(false);

            const filesToProcess = files.map(f => ({ ...f, status: 'processing' as const }));
            setFiles(filesToProcess);

            try {
                const filesOnly = filesToProcess.map(f => f.file);
                const categories = await categorizeMultipleFiles(filesOnly);
                const processedFiles = filesToProcess.map(f => ({
                    ...f,
                    status: 'completed' as const,
                    category: categories[f.file.name] || 'Uncategorized',
                }));
                setFiles(processedFiles);
            } catch (e) {
                const failedFiles = filesToProcess.map(f => ({ ...f, status: 'failed' as const, error: e instanceof Error ? e.message : 'Categorization failed' }));
                setFiles(failedFiles);
            } finally {
                setIsPreprocessingFinished(true);
            }
        } else if (disputeContent || clientRequest) {
            performAnalysis([]);
        } else {
            setAnalysisError("Vui lòng tải tệp hoặc nhập nội dung để phân tích.");
        }
    }, [files, disputeContent, clientRequest, performAnalysis]);

    const handleGenerateText = async () => {
        if (!generationRequest.trim() || !consultingReport) return;
        setGenerationError(null);
        setIsGenerating(true);
        setGeneratedText('');
        try {
            const result = await generateConsultingDocument(consultingReport, disputeContent, generationRequest);
            setGeneratedText(result);
        } catch (err) {
            setGenerationError(err instanceof Error ? err.message : 'Lỗi không xác định');
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleRefineAnswer = async (mode: 'concise' | 'empathetic' | 'formal' | 'zalo_fb') => {
        if (!consultingReport?.conciseAnswer) return;
        const original = consultingReport.conciseAnswer;
        const refined = await refineQuickAnswer(original, mode);
        setConsultingReport(prev => prev ? { ...prev, conciseAnswer: refined } : null);
    };

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden">
            {/* Left Panel (Keep as is) */}
            <div className="w-full lg:w-2/5 h-full flex flex-col p-6 space-y-4 bg-white border-r border-slate-200">
                <div className="flex justify-between items-center flex-shrink-0">
                    <button onClick={handleBackClick} className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 font-semibold"><BackIcon className="w-5 h-5" /> Chọn lại Nghiệp vụ</button>
                    <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-3 py-1.5 text-xs bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 disabled:bg-slate-300"><SaveCaseIcon className="w-4 h-4" /> Lưu</button>
                </div>
                <div className="flex-grow overflow-y-auto pr-2 -mr-4 space-y-4">
                    <FileUpload files={files} setFiles={setFiles} onPreview={onPreview} />
                    <div className="relative">
                        <label htmlFor="disputeContent" className="block text-sm font-semibold text-slate-700 mb-1.5">Nội dung Vụ việc / Tóm tắt Tình huống</label>
                        <textarea id="disputeContent" value={disputeContent} onChange={e => setDisputeContent(e.target.value)} placeholder="Dán nội dung trao đổi, mô tả tình huống của khách hàng tại đây..." className="w-full h-32 p-2.5 bg-slate-50 border border-slate-300 rounded-md text-sm" />
                        <div className="absolute top-0 right-0 flex items-center gap-1 mt-1 mr-1">
                             <button onClick={() => handleMicClick('disputeContent')} className={`p-1 rounded-full ${listeningField === 'disputeContent' ? 'bg-red-500 text-white animate-pulse' : 'bg-white/50 text-slate-500 hover:bg-slate-200'}`} title="Nhập liệu bằng giọng nói"><MicrophoneIcon className="w-4 h-4" /></button>
                            <button onClick={() => handleSummarizeField('disputeContent')} disabled={isSummarizingField === 'disputeContent'} title="Tóm tắt & Làm rõ bằng AI" className="p-1 rounded-full bg-white/50 text-slate-500 hover:bg-slate-200"><MagicIcon className="w-4 h-4" /></button>
                        </div>
                    </div>
                     <div className="relative">
                        <label htmlFor="clientRequest" className="block text-sm font-semibold text-slate-700 mb-1.5">Yêu cầu của Khách hàng</label>
                        <textarea id="clientRequest" value={clientRequest} onChange={e => setClientRequest(e.target.value)} placeholder="Khách hàng muốn làm gì? VD: Muốn đòi lại tiền, muốn hủy hợp đồng, muốn được tư vấn các rủi ro..." className="w-full h-24 p-2.5 bg-slate-50 border border-slate-300 rounded-md text-sm" />
                         <div className="absolute top-0 right-0 flex items-center gap-1 mt-1 mr-1">
                            <button onClick={() => handleMicClick('clientRequest')} className={`p-1 rounded-full ${listeningField === 'clientRequest' ? 'bg-red-500 text-white animate-pulse' : 'bg-white/50 text-slate-500 hover:bg-slate-200'}`} title="Nhập liệu bằng giọng nói"><MicrophoneIcon className="w-4 h-4" /></button>
                            <button onClick={() => handleSummarizeField('clientRequest')} disabled={isSummarizingField === 'clientRequest'} title="Tóm tắt & Làm rõ bằng AI" className="p-1 rounded-full bg-white/50 text-slate-500 hover:bg-slate-200"><MagicIcon className="w-4 h-4" /></button>
                        </div>
                    </div>
                </div>
                <div className="flex-shrink-0 pt-4 border-t">
                    {summarizationError && <Alert message={summarizationError} type="error" />}
                    <button onClick={handleAnalyzeClick} disabled={isAnalyzing || isProcessing} className="w-full py-2.5 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-slate-300 flex items-center justify-center gap-2">
                        {isAnalyzing ? <><Loader /> <span>Đang phân tích...</span></> : (isProcessing ? <><Loader /> <span>Đang xử lý tệp...</span></> : 'Phân tích Tư vấn')}
                    </button>
                </div>
            </div>

            {/* Right Panel */}
            <main className="flex-1 p-6 overflow-y-auto">
                 {isAnalyzing && !consultingReport && <div className="flex flex-col items-center justify-center h-full"><div className="loading-bar-container"><div className="loading-bars"><div className="loading-bar"></div><div className="loading-bar"></div><div className="loading-bar"></div></div><p className="mt-4 text-slate-600 font-medium">AI đang phân tích, vui lòng đợi trong giây lát...</p></div></div>}
                 {!isAnalyzing && !consultingReport && <div className="flex flex-col items-center justify-center h-full text-center text-slate-400"><ChatBubbleLeftIcon className="w-16 h-16 mb-4 text-slate-300" /><p className="font-medium text-slate-600">Kết quả tư vấn sẽ được hiển thị tại đây.</p></div>}
                 {analysisError && <div className="flex items-center justify-center h-full"><Alert message={analysisError} type="error" /></div>}
                 
                 {consultingReport && (
                    <div className="space-y-6">
                        {/* Quick Answer Section */}
                        <div className="p-4 bg-white border border-blue-200 rounded-lg shadow-lg">
                            <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2"><LightbulbIcon className="w-6 h-6 text-amber-500" />Câu trả lời Tư vấn Nhanh</h3>
                            <div className="p-3 bg-slate-50 rounded-md">
                                <pre className="whitespace-pre-wrap font-sans text-sm text-slate-800">{consultingReport.conciseAnswer}</pre>
                            </div>
                             <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-slate-500">Tinh chỉnh:</span>
                                    <button onClick={() => handleRefineAnswer('concise')} className="px-2 py-1 text-xs bg-slate-200 rounded-md hover:bg-slate-300">Ngắn gọn</button>
                                    <button onClick={() => handleRefineAnswer('empathetic')} className="px-2 py-1 text-xs bg-slate-200 rounded-md hover:bg-slate-300">Đồng cảm</button>
                                    <button onClick={() => handleRefineAnswer('formal')} className="px-2 py-1 text-xs bg-slate-200 rounded-md hover:bg-slate-300">Trang trọng</button>
                                    <button onClick={() => handleRefineAnswer('zalo_fb')} className="px-2 py-1 text-xs bg-slate-200 rounded-md hover:bg-slate-300">Gửi Zalo/FB</button>
                                </div>
                                <button onClick={() => navigator.clipboard.writeText(consultingReport.conciseAnswer || '')} className="flex items-center gap-1 px-2 py-1 text-xs text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"><CopyIcon className="w-3 h-3" /> Sao chép</button>
                            </div>
                        </div>
                        
                        {/* Negotiation Leverage Section (NEW) */}
                        {consultingReport.negotiationLeverage && (
                             <div className="p-4 bg-indigo-50 border-l-4 border-indigo-400 rounded-lg shadow-sm">
                                <h3 className="text-lg font-bold text-indigo-900 mb-2 flex items-center gap-2">
                                    <LeverageIcon className="w-6 h-6" />
                                    Đòn bẩy Đàm phán & Đọc vị Đối phương
                                </h3>
                                <div className="text-sm text-indigo-800">
                                    <CunningLawyerText text={consultingReport.negotiationLeverage} />
                                </div>
                            </div>
                        )}

                        {/* Detailed Report Sections (Simplified for brevity, keep existing structure) */}
                        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-lg">
                             <h3 className="text-lg font-bold text-slate-800 mb-4">Báo cáo Tư vấn Sơ bộ</h3>
                             <div className="space-y-5">
                                 <div>
                                     <h4 className="font-bold text-sm text-slate-700 mb-2">Đánh giá Sơ bộ</h4>
                                     <CunningLawyerText text={consultingReport.preliminaryAssessment} />
                                 </div>
                                  <div>
                                     <h4 className="font-bold text-sm text-slate-700 mb-2">Lỗ hổng Pháp lý</h4>
                                     <div className="space-y-2">
                                       {consultingReport.legalLoopholes?.map((loophole, i) => (
                                            <div key={i} className="p-2 border-l-4 border-red-300 bg-red-50 rounded-r text-sm">
                                                <span className="font-bold text-red-700">{loophole.classification}:</span> {loophole.description}
                                            </div>
                                       ))}
                                     </div>
                                 </div>
                                 <div>
                                    <h4 className="font-bold text-sm text-slate-700 mb-2">Lộ trình Đề xuất</h4>
                                    <ul className="list-decimal list-inside text-sm space-y-1">
                                        {consultingReport.proposedRoadmap?.map((step, i) => (
                                            <li key={i}><strong>{step.stage}:</strong> {step.description}</li>
                                        ))}
                                    </ul>
                                 </div>
                             </div>
                        </div>

                        {/* Document Generation Section (Keep as is) */}
                        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-lg">
                            <h3 className="text-lg font-bold text-slate-800 mb-3">Soạn thảo Văn bản</h3>
                            <textarea value={generationRequest} onChange={e => setGenerationRequest(e.target.value)} className="w-full h-24 p-2 border rounded-md bg-slate-50 text-sm" placeholder="Nhập yêu cầu soạn thảo..."></textarea>
                            <button onClick={handleGenerateText} disabled={isGenerating} className="mt-2 w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-700 text-white rounded-md hover:bg-slate-800 disabled:bg-slate-400">
                                {isGenerating ? <><Loader/> Soạn thảo...</> : <>Soạn thảo</>}
                            </button>
                            {generationError && <p className="text-red-600 text-sm mt-2">{generationError}</p>}
                            {generatedText && (
                                <div className="mt-3 p-3 bg-slate-100 rounded-md relative">
                                    <button onClick={() => navigator.clipboard.writeText(generatedText)} className="absolute top-2 right-2 text-xs px-2 py-1 bg-white rounded hover:bg-slate-200">Copy</button>
                                    <pre className="whitespace-pre-wrap font-sans text-sm">{generatedText}</pre>
                                </div>
                            )}
                        </div>
                        <ConsultingChat report={consultingReport} onUpdateReport={setConsultingReport} />
                    </div>
                 )}
            </main>
             {isProcessing && (
                <ProcessingProgress
                    files={files}
                    onContinue={() => {
                        setIsProcessing(false);
                        performAnalysis(files.filter(f => f.status === 'completed'));
                    }}
                    onCancel={() => setIsProcessing(false)}
                    isFinished={isPreprocessingFinished}
                    hasTextContent={!!(disputeContent || clientRequest)}
                />
            )}
        </div>
    );
};

// --- Business Formation Workflow ---
// ... (Keep RegistrationFormGenerator as is)
const RegistrationFormGenerator: React.FC<{
    onGenerate: (docType: DocType, formData: FormData) => Promise<string>;
}> = ({ onGenerate }) => {
    const [docType, setDocType] = useState<DocType>('enterpriseRegistration');
    const [formData, setFormData] = useState<FormData>({});
    const [generatedText, setGeneratedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const currentFields = DOC_TYPE_FIELDS[docType] || [];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerate = async () => {
        setError(null);
        setIsLoading(true);
        try {
            const result = await onGenerate(docType, formData);
            setGeneratedText(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi không xác định');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleExportPdf = () => {
        if (!generatedText) return;
        const { jsPDF } = (window as any).jspdf;
        const doc = new jsPDF();
        doc.addFont('/Poppins-Regular.ttf', 'Poppins', 'normal'); // Assuming a Poppins font file is available
        doc.setFont('Poppins');
        doc.text(generatedText, 10, 10);
        doc.save("Ho_so_Dang_ky.pdf");
    };

    return (
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-lg mt-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Tạo Hồ sơ Đăng ký</h3>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <select value={docType} onChange={e => setDocType(e.target.value as DocType)} className="w-full p-2 border border-slate-300 rounded-md bg-white">
                        <option value="enterpriseRegistration">Hồ sơ Đăng ký Doanh nghiệp</option>
                        <option value="householdRegistration">Hồ sơ Đăng ký Hộ kinh doanh</option>
                    </select>
                     <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 -mr-2">
                         {currentFields.map(field => (
                             <div key={field}>
                                 <label htmlFor={field} className="block text-xs font-semibold text-slate-600 mb-1">{FIELD_LABELS[field] || field}</label>
                                 <input type="text" id={field} name={field} value={formData[field] || ''} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-md text-sm"/>
                             </div>
                         ))}
                    </div>
                     <button onClick={handleGenerate} disabled={isLoading} className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-slate-300 flex items-center justify-center gap-2">
                        {isLoading ? <><Loader /> <span>Đang tạo...</span></> : 'Tạo Văn bản Hồ sơ'}
                    </button>
                    {error && <Alert message={error} type="error" />}
                </div>
                 <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-bold text-slate-800">Văn bản được tạo</h4>
                         {generatedText && (
                            <div className="flex gap-2">
                                <button onClick={() => navigator.clipboard.writeText(generatedText)} className="text-xs px-2 py-1 bg-slate-200 rounded-md hover:bg-slate-300">Copy</button>
                                <button onClick={handleExportPdf} className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200">Xuất PDF</button>
                            </div>
                         )}
                    </div>
                    <div className="flex-grow rounded-lg bg-slate-50 border border-slate-200 p-3 overflow-y-auto min-h-[50vh]">
                        {isLoading && <div className="flex justify-center items-center h-full"><Loader /></div>}
                        <pre className="whitespace-pre-wrap font-sans text-sm">{generatedText}</pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Business Formation Chat Component ---
const BusinessFormationChat: React.FC<{
    report: BusinessFormationReport;
    onUpdateReport: (updatedReport: BusinessFormationReport) => void;
}> = ({ report, onUpdateReport }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

    const isMobile = useIsMobile();
    const chatEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }
    }, [report.globalChatHistory, isOpen]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!userInput.trim() && attachedFiles.length === 0) || isLoading) return;

        setIsLoading(true);
        const newUserMessage: ChatMessage = { role: 'user', content: userInput.trim() };
        const currentHistory = report.globalChatHistory || [];
        const updatedHistory = [...currentHistory, newUserMessage];
        
        // Update local history immediately
        onUpdateReport({ ...report, globalChatHistory: updatedHistory });

        const attachedUploadedFiles: UploadedFile[] = attachedFiles.map(file => ({
            id: file.name, file, preview: null, category: 'Uncategorized', status: 'pending'
        }));

        try {
            const { chatResponse, updatedReport } = await continueBusinessFormationChat(report, updatedHistory, userInput.trim(), attachedUploadedFiles);
            const aiMessage: ChatMessage = { role: 'model', content: chatResponse };
            const finalHistory = [...updatedHistory, aiMessage];
            
            if (updatedReport) {
                onUpdateReport({ ...updatedReport, globalChatHistory: finalHistory });
            } else {
                onUpdateReport({ ...report, globalChatHistory: finalHistory });
            }
        } catch (err) {
            const errorMessage: ChatMessage = { role: 'model', content: `Lỗi: ${err instanceof Error ? err.message : 'Không thể kết nối tới AI.'}` };
            onUpdateReport({ ...report, globalChatHistory: [...updatedHistory, errorMessage] });
        } finally {
            setUserInput('');
            setAttachedFiles([]);
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)} 
                className="fixed bottom-8 right-8 bg-purple-600 text-white rounded-full p-4 shadow-lg hover:bg-purple-700 transition-transform hover:scale-110 z-40" 
                aria-label="Mở cửa sổ trò chuyện"
                title="Trò chuyện với Chuyên gia Cáo già"
            >
                <ChatIcon className="w-8 h-8" />
            </button>
        );
    }

    const mobileClasses = "inset-0 w-full h-full rounded-none";
    const desktopClasses = "bottom-8 right-8 w-[400px] h-[550px] max-h-[80vh] rounded-xl shadow-2xl border border-purple-200";

    return (
        <div className={`fixed bg-white flex flex-col z-50 animate-fade-in ${isMobile ? mobileClasses : desktopClasses}`}>
            <div className="flex justify-between items-center p-4 border-b border-purple-100 bg-purple-50 rounded-t-xl flex-shrink-0">
                <h3 className="font-bold text-purple-900 flex items-center gap-2">
                    <CunningLawyerIcon className="w-5 h-5" />
                    Trò chuyện Chiến lược
                </h3>
                <div className="flex items-center gap-1">
                    {!isMobile && (
                        <button onClick={() => setIsOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100" aria-label="Thu nhỏ"><MinimizeIcon className="w-5 h-5"/></button>
                    )}
                    <button onClick={() => setIsOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100" aria-label="Đóng"><XMarkIcon className="w-6 h-6"/></button>
                </div>
            </div>
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {(!report.globalChatHistory || report.globalChatHistory.length === 0) && (
                    <div className="text-center text-slate-400 text-sm py-8">
                        <p>Hãy đặt câu hỏi về mô hình kinh doanh, thuế, hoặc rủi ro pháp lý. Nếu bạn bổ sung thông tin mới, AI sẽ cập nhật lại báo cáo.</p>
                    </div>
                )}
                {(report.globalChatHistory || []).map((msg, index) => (
                    <div key={index} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        <div className={`max-w-[85%] p-2.5 rounded-lg text-sm ${msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                ))}
                {isLoading && <div className="flex gap-2.5"><div className="p-2.5 rounded-lg bg-slate-100"><Loader /></div></div>}
                <div ref={chatEndRef} />
            </div>
            <footer className="p-4 border-t border-purple-100 flex-shrink-0">
                {attachedFiles.length > 0 && (<div className="mb-2 space-y-1">{attachedFiles.map((file, index) => (<div key={index} className="flex items-center justify-between text-xs bg-slate-100 p-1.5 rounded"><span className="truncate">{file.name}</span><button onClick={() => setAttachedFiles(p => p.filter((_, i) => i !== index))} className="p-0.5 rounded-full hover:bg-slate-200"><XMarkIcon className="w-3 h-3 text-slate-500"/></button></div>))}</div>)}
                <form onSubmit={handleSendMessage} className="flex items-start gap-2">
                    <textarea 
                        value={userInput} 
                        onChange={e => setUserInput(e.target.value)} 
                        placeholder="Nhập tin nhắn..." 
                        className="flex-grow p-2 border border-slate-300 rounded-md text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" 
                        rows={2} 
                        disabled={isLoading} 
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }} 
                    />
                    <div className="flex flex-col gap-2">
                        <label className="p-2 bg-slate-100 text-slate-600 font-semibold rounded-md hover:bg-slate-200 cursor-pointer">
                            <PaperClipIcon className="w-5 h-5"/>
                            <input type="file" className="hidden" multiple ref={fileInputRef} onChange={(e) => { if (e.target.files) setAttachedFiles(p => [...p, ...Array.from(e.target.files!)]); if (fileInputRef.current) fileInputRef.current.value = ""; }} accept=".pdf,.doc,.docx,.jpg,.jpeg" disabled={isLoading}/>
                        </label>
                        <button 
                            type="submit" 
                            disabled={isLoading || (!userInput.trim() && attachedFiles.length === 0)} 
                            className="p-2 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 disabled:bg-slate-300"
                        >
                            <SendIcon className="w-5 h-5"/>
                        </button>
                    </div>
                </form>
            </footer>
        </div>
    );
};

export const BusinessFormationWorkflow: React.FC<WorkflowProps> = ({ onPreview, onGoBack, activeCase, onCasesUpdated }) => {
    // ... (Keep state and handlers as is)
    const [businessIdea, setBusinessIdea] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState({ capital: '', members: '', location: '' });
    const [report, setReport] = useState<BusinessFormationReport | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [caseName, setCaseName] = useState('');
    const [view, setView] = useState<'analysis' | 'registration'>('analysis');

    useEffect(() => {
        if (activeCase?.workflowType === 'businessFormation') {
            setBusinessIdea(activeCase.caseContent || '');
            const cr = activeCase.clientRequest || '';
            const capitalMatch = cr.match(/Vốn: (.*?)(,|$)/);
            const membersMatch = cr.match(/Thành viên: (.*?)(,|$)/);
            const locationMatch = cr.match(/Địa điểm: (.*?)(,|$)/);
            setAdditionalInfo({
                capital: capitalMatch ? capitalMatch[1].trim() : '',
                members: membersMatch ? membersMatch[1].trim() : '',
                location: locationMatch ? locationMatch[1].trim() : ''
            });
            setReport(activeCase.businessFormationReport || null);
            setCaseName(activeCase.name);
        }
    }, [activeCase]);

    const handleBackClick = () => {
        if (window.confirm("Bạn có chắc chắn muốn quay lại? Mọi dữ liệu chưa lưu sẽ bị mất.")) onGoBack();
    };

     const handleSave = async () => {
        if (!activeCase) return;
        const defaultName = caseName || businessIdea.substring(0, 40) || `Tư vấn TL DN ${new Date().toLocaleDateString('vi-VN')}`;
        const newCaseName = window.prompt("Nhập tên để lưu nghiệp vụ:", defaultName);
        if (!newCaseName) return;

        setIsSaving(true);
        try {
            const now = new Date().toISOString();
            const isNewCase = activeCase.id.startsWith('new_');
            const caseToSave: SavedCase = {
                ...activeCase, id: isNewCase ? now : activeCase.id, createdAt: isNewCase ? now : activeCase.createdAt,
                updatedAt: now, name: newCaseName, workflowType: 'businessFormation', files: [], 
                caseContent: businessIdea,
                clientRequest: `Vốn: ${additionalInfo.capital}, Thành viên: ${additionalInfo.members}, Địa điểm: ${additionalInfo.location}`,
                query: '', litigationType: null, litigationStage: 'consulting', analysisReport: null, 
                businessFormationReport: report,
            };
            await saveCase(caseToSave);
            onCasesUpdated();
            setCaseName(caseToSave.name);
            alert(`Nghiệp vụ "${newCaseName}" đã được lưu thành công!`);
        } catch (err) {
            alert("Đã xảy ra lỗi khi lưu nghiệp vụ.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAnalyze = async () => {
        if (!businessIdea.trim()) {
            setError('Vui lòng nhập ý tưởng kinh doanh.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const result = await analyzeBusinessFormation(businessIdea, additionalInfo);
            setReport(result);
            setView('analysis'); // Switch to analysis view upon getting a new report
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi không xác định');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden">
             {/* Left Panel (Keep as is) */}
            <div className="w-full lg:w-2/5 h-full flex flex-col p-6 space-y-4 bg-white border-r border-slate-200">
                <div className="flex justify-between items-center flex-shrink-0">
                    <button onClick={handleBackClick} className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 font-semibold"><BackIcon className="w-5 h-5" /> Chọn lại Nghiệp vụ</button>
                    <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-3 py-1.5 text-xs bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 disabled:bg-slate-300"><SaveCaseIcon className="w-4 h-4" /> Lưu</button>
                </div>
                 <div className="flex-grow overflow-y-auto pr-2 -mr-4 space-y-4">
                    <h2 className="text-xl font-bold text-slate-800">Tư vấn Thành lập Doanh nghiệp</h2>
                     <div>
                        <label htmlFor="businessIdea" className="block text-sm font-semibold text-slate-700 mb-1.5">Ý tưởng / Ngành nghề Kinh doanh</label>
                        <textarea id="businessIdea" value={businessIdea} onChange={e => setBusinessIdea(e.target.value)} placeholder="VD: Mở một quán cà phê sách tại Hà Nội, tập trung vào khách hàng trẻ..." className="w-full h-32 p-2.5 bg-slate-50 border border-slate-300 rounded-md text-sm" />
                    </div>
                     <div>
                        <h3 className="block text-sm font-semibold text-slate-700 mb-1.5">Thông tin Bổ sung (Tùy chọn)</h3>
                        <div className="space-y-2">
                             <input type="text" value={additionalInfo.capital} onChange={e => setAdditionalInfo(p => ({...p, capital: e.target.value}))} placeholder="Vốn dự kiến..." className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-md text-sm" />
                             <input type="text" value={additionalInfo.members} onChange={e => setAdditionalInfo(p => ({...p, members: e.target.value}))} placeholder="Số lượng thành viên/cổ đông..." className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-md text-sm" />
                             <input type="text" value={additionalInfo.location} onChange={e => setAdditionalInfo(p => ({...p, location: e.target.value}))} placeholder="Địa điểm dự kiến..." className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-md text-sm" />
                        </div>
                    </div>
                 </div>
                 <div className="flex-shrink-0 pt-4 border-t">
                    <button onClick={handleAnalyze} disabled={isLoading} className="w-full py-2.5 px-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-slate-300 flex items-center justify-center gap-2">
                        {isLoading ? <><Loader /> <span>Đang phân tích...</span></> : 'Phân tích & Đề xuất Mô hình'}
                    </button>
                </div>
            </div>
             {/* Right Panel */}
             <main className="flex-1 p-6 overflow-y-auto">
                {isLoading && !report && <div className="flex flex-col items-center justify-center h-full"><Loader /><p className="mt-2 text-slate-600">AI đang phân tích...</p></div>}
                {!isLoading && !report && <div className="flex flex-col items-center justify-center h-full text-center text-slate-400"><p>Kết quả tư vấn sẽ hiển thị ở đây.</p></div>}
                {error && <Alert message={error} type="error" />}
                {report && (
                    <>
                    <div className="mb-4">
                        <div className="inline-flex rounded-md shadow-sm bg-white border border-slate-200" role="group">
                             <button type="button" onClick={() => setView('analysis')} className={`px-4 py-2 text-sm font-semibold border-r border-slate-200 rounded-l-lg ${view === 'analysis' ? 'text-white bg-purple-600' : 'text-slate-700 hover:bg-slate-50'}`}>Báo cáo Phân tích</button>
                            <button type="button" onClick={() => setView('registration')} className={`px-4 py-2 text-sm font-semibold rounded-r-lg ${view === 'registration' ? 'text-white bg-purple-600' : 'text-slate-700 hover:bg-slate-50'}`}>Tạo Hồ sơ Đăng ký</button>
                        </div>
                    </div>
                    {view === 'analysis' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-lg">
                                <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2"><ModelComparisonIcon className="w-6 h-6 text-purple-600" />So sánh Mô hình Kinh doanh</h3>
                                <div className="p-3 bg-purple-50 rounded-md text-center">
                                    <p className="text-sm text-slate-600">Đề xuất của AI:</p>
                                    <p className="text-xl font-bold text-purple-800">{report.modelComparison.recommendation}</p>
                                    <div className="text-sm mt-1"><CunningLawyerText text={report.modelComparison.recommendationReasoning} /></div>
                                </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
                                    <div className="p-3 bg-slate-50 rounded-md border">
                                        <h4 className="font-bold mb-2">Doanh nghiệp</h4>
                                        <ul className="list-disc list-inside space-y-1 text-green-700"> {report.modelComparison.business.pros.map((p,i) => <li key={i} className="flex items-start"><span className="mr-2 mt-1">✓</span><span>{p}</span></li>)}</ul>
                                        <ul className="list-disc list-inside space-y-1 text-red-700 mt-2"> {report.modelComparison.business.cons.map((c,i) => <li key={i} className="flex items-start"><span className="mr-2 mt-1">✗</span><span>{c}</span></li>)}</ul>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-md border">
                                        <h4 className="font-bold mb-2">Hộ kinh doanh</h4>
                                        <ul className="list-disc list-inside space-y-1 text-green-700"> {report.modelComparison.soleProprietorship.pros.map((p,i) => <li key={i} className="flex items-start"><span className="mr-2 mt-1">✓</span><span>{p}</span></li>)}</ul>
                                        <ul className="list-disc list-inside space-y-1 text-red-700 mt-2"> {report.modelComparison.soleProprietorship.cons.map((c,i) => <li key={i} className="flex items-start"><span className="mr-2 mt-1">✗</span><span>{c}</span></li>)}</ul>
                                    </div>
                                </div>
                            </div>

                             <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-lg">
                                <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2"><TaxIcon className="w-6 h-6 text-purple-600" />Phân tích Thuế & Mẹo Tối ưu</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                                     <div className="p-3 bg-slate-50 rounded-md border">
                                        <h4 className="font-bold text-blue-800 mb-2">Thuế Doanh nghiệp</h4>
                                        <ul className="space-y-2">
                                            {report.taxAnalysis.businessTaxes.map((tax, i) => (
                                                <li key={i}>
                                                    <span className="font-semibold text-slate-700">{tax.name}:</span> <span className="text-slate-600">{tax.description}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                     <div className="p-3 bg-slate-50 rounded-md border">
                                        <h4 className="font-bold text-amber-800 mb-2">Thuế Hộ Kinh doanh</h4>
                                         <ul className="space-y-2">
                                            {report.taxAnalysis.soleProprietorshipTaxes.map((tax, i) => (
                                                <li key={i}>
                                                    <span className="font-semibold text-slate-700">{tax.name}:</span> <span className="text-slate-600">{tax.description}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-slate-200">
                                    <h4 className="font-bold text-sm text-slate-800 mb-2">Chiến thuật Tối ưu Thuế (Cáo già)</h4>
                                    <div className="text-sm space-y-2"><CunningLawyerText text={report.taxAnalysis.optimizationTips} /></div>
                                </div>
                            </div>
                            
                            {/* Regulatory Arbitrage Section (NEW) */}
                            {report.regulatoryArbitrage && (
                                <div className="p-4 bg-teal-50 border-l-4 border-teal-400 rounded-lg shadow-sm">
                                    <h3 className="text-lg font-bold text-teal-900 mb-2 flex items-center gap-2">
                                        <ArbitrageIcon className="w-6 h-6" />
                                        Chiến thuật Lách Luật & Tối ưu Cơ chế
                                    </h3>
                                    <div className="text-sm text-teal-800">
                                        <CunningLawyerText text={report.regulatoryArbitrage} />
                                    </div>
                                </div>
                            )}

                            <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-lg">
                                <h3 className="text-lg font-bold text-slate-800 mb-3">Hướng dẫn Thủ tục Đăng ký</h3>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                     <div className="p-3 bg-slate-50 rounded-md border">
                                        <h4 className="font-bold mb-2">Doanh nghiệp</h4>
                                        <ol className="list-decimal list-inside space-y-2">{report.procedureGuide.businessSteps.map((s,i) => <li key={i}><strong>{s.step}:</strong> <CunningLawyerText text={s.description} /></li>)}</ol>
                                    </div>
                                     <div className="p-3 bg-slate-50 rounded-md border">
                                        <h4 className="font-bold mb-2">Hộ kinh doanh</h4>
                                        <ol className="list-decimal list-inside space-y-2">{report.procedureGuide.soleProprietorshipSteps.map((s,i) => <li key={i}><strong>{s.step}:</strong> <CunningLawyerText text={s.description} /></li>)}</ol>
                                    </div>
                                </div>
                            </div>

                             <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-lg">
                                <h3 className="text-lg font-bold text-slate-800 mb-3">Tối ưu Chi phí Hợp lệ (Thuế TNDN)</h3>
                                <div className="text-sm space-y-2"><CunningLawyerText text={report.validExpensesGuide} /></div>
                            </div>
                            <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-lg">
                                <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                                    Cảnh báo Rủi ro Pháp lý & Biện pháp Phòng ngừa
                                </h3>
                                <div className="space-y-4">
                                    {report.legalRisks.map((item, i) => (
                                        <div key={i} className="p-3 bg-red-50/50 border-l-4 border-red-300 rounded-r-md">
                                            <p className="font-semibold text-red-900">{item.risk}</p>
                                            <p className="mt-1 text-sm text-slate-700">
                                                <span className="font-semibold">→ Biện pháp phòng ngừa:</span> {item.prevention}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                     {view === 'registration' && (
                         <div className="animate-fade-in">
                            <RegistrationFormGenerator onGenerate={generateDocumentFromTemplate} />
                         </div>
                    )}
                    <BusinessFormationChat report={report} onUpdateReport={setReport} />
                    </>
                )}
            </main>
        </div>
    );
};
