
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { SavedCase, UploadedFile, LandProcedureReport, DivorceReport, ChatMessage, SerializableFile, DocType, FormData, AssetItem, ExecutionRoadmap } from '../types.ts';
import { FileUpload } from './FileUpload.tsx';
import { Loader } from './Loader.tsx';
import { analyzeLandProcedure, analyzeDivorceCase, continueLandChat, continueDivorceChat, generateDocumentFromTemplate, categorizeMultipleFiles } from '../services/geminiService.ts';
import { BackIcon } from './icons/BackIcon.tsx';
import { SaveCaseIcon } from './icons/SaveCaseIcon.tsx';
import { ChatIcon } from './icons/ChatIcon.tsx';
import { SendIcon } from './icons/SendIcon.tsx';
import { PaperClipIcon } from './icons/PaperClipIcon.tsx';
import { MinimizeIcon } from './icons/MinimizeIcon.tsx';
import { XMarkIcon } from './icons/XMarkIcon.tsx';
import { PanelCollapseIcon } from './icons/PanelCollapseIcon.tsx';
import { PanelExpandIcon } from './icons/PanelExpandIcon.tsx';
import { saveCase } from '../services/db.ts';
import { ProcessingProgress } from './ProcessingProgress.tsx';
import { DOC_TYPE_FIELDS, FIELD_LABELS, REGIONAL_COURTS, INVISIBLE_FILES_CHECKLIST, PANIC_MODE_INSTRUCTIONS, LAND_DUE_DILIGENCE_CHECKLIST } from '../constants.ts';
import { TrashIcon } from './icons/TrashIcon.tsx';
import { PlusIcon } from './icons/PlusIcon.tsx';
import { ExecutionRoadmapPanel } from './ExecutionRoadmapPanel.tsx';

// --- Helper Components ---

const CunningLawyerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM4.5 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM15.375 16.125a2.625 2.625 0 1 1 5.25 0 2.625 2.625 0 0 1-5.25 0ZM12 18.75a.75.75 0 0 0 .75.75h.008a.75.75 0 0 0 .75-.75V18a3 3 0 0 0-1.5 0v.75ZM12 21a.75.75 0 0 0 .75.75h.008a.75.75 0 0 0 .75-.75v-.375a3 3 0 0 0-1.5 0v.375Z" clipRule="evenodd" />
    <path d="M12 1.5c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 1.5 12 1.5ZM8.625 15a.75.75 0 0 0-1.5 0v.625H6.375a.75.75 0 0 0 0 1.5h.75v.625a.75.75 0 0 0 1.5 0v-.625h.75a.75.75 0 0 0 0-1.5h-.75V15Zm6 0a.75.75 0 0 0-1.5 0v.625H12.375a.75.75 0 0 0 0 1.5h.75v.625a.75.75 0 0 0 1.5 0v-.625h.75a.75.75 0 0 0 0-1.5h-.75V15Z" />
  </svg>
);

const WarningIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
);

const CheckBadgeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 1.043 3.296 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
  </svg>
);

const ShieldExclamationIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.002A11.959 11.959 0 0 1 12 2.964ZM12 15.75h.007v.008H12v-.008Z" />
  </svg>
);

const CalculatorIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5ZM8.25 6h7.5a2.25 2.25 0 0 1 2.25 2.25v12a2.25 2.25 0 0 1-2.25 2.25h-7.5a2.25 2.25 0 0 1-2.25-2.25v-12A2.25 2.25 0 0 1 8.25 6Z" />
  </svg>
);

// Removed CopyIcon definition as it is now handled in ExecutionRoadmapPanel or we can keep it if used elsewhere. 
// To avoid duplicate definition error if we move things around, let's keep it here but rename if needed, or better, ensure ExecutionRoadmapPanel has its own.
// Since I implemented ExecutionRoadmapPanel with its own CopyIconLocal, this one remains for other components in this file.
export const CopyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m9.75 11.625-3.75-3.75" />
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
                return <React.Fragment key={index}>{part.split('\n').map((line, i) => <React.Fragment key={i}>{line}<br/></React.Fragment>)}</React.Fragment>;
            })}
        </>
    );
};

const Alert: React.FC<{ message: string; type: 'error' | 'warning' | 'info' }> = ({ message, type }) => {
    const baseClasses = "p-4 text-sm rounded-lg animate-fade-in";
    const typeClasses = { error: "bg-red-50 text-red-800", warning: "bg-amber-50 text-amber-800", info: "bg-blue-50 text-blue-800" };
    return <div className={`${baseClasses} ${typeClasses[type]}`} role="alert">{message}</div>;
};

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
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new File([byteArray], filename, { type: mimeType });
};

interface WorkflowProps {
    onPreview: (file: UploadedFile) => void;
    onGoBack: () => void;
    activeCase: SavedCase | null;
    onCasesUpdated: () => void;
}

const getThemeClasses = (color: string) => {
    switch(color) {
        case 'teal': return {
            bg: 'bg-teal-600', hoverBg: 'hover:bg-teal-700', border: 'border-teal-200', lightBg: 'bg-teal-50', lightBorder: 'border-teal-100', text: 'text-teal-900', userBg: 'bg-teal-600'
        };
        case 'rose': return {
            bg: 'bg-rose-600', hoverBg: 'hover:bg-rose-700', border: 'border-rose-200', lightBg: 'bg-rose-50', lightBorder: 'border-rose-100', text: 'text-rose-900', userBg: 'bg-rose-600'
        };
        default: return {
            bg: 'bg-blue-600', hoverBg: 'hover:bg-blue-700', border: 'border-blue-200', lightBg: 'bg-blue-50', lightBorder: 'border-blue-100', text: 'text-blue-900', userBg: 'bg-blue-600'
        };
    }
};

const GenericChat: React.FC<{
    report: any;
    onUpdateReport: (updatedReport: any) => void;
    onContinueChat: (report: any, history: ChatMessage[], message: string, files: UploadedFile[]) => Promise<{chatResponse: string, updatedReport?: any}>;
    themeColor: string;
}> = ({ report, onUpdateReport, onContinueChat, themeColor }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const isMobile = useIsMobile();
    const chatEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const classes = getThemeClasses(themeColor);

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
        
        onUpdateReport({ ...report, globalChatHistory: updatedHistory });

        const attachedUploadedFiles: UploadedFile[] = attachedFiles.map(file => ({
            id: file.name, file, preview: null, category: 'Uncategorized', status: 'pending'
        }));

        try {
            const { chatResponse, updatedReport } = await onContinueChat(report, updatedHistory, userInput.trim(), attachedUploadedFiles);
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
            <button onClick={() => setIsOpen(true)} className={`fixed bottom-8 right-8 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-110 z-40 ${classes.bg} ${classes.hoverBg}`}>
                <ChatIcon className="w-8 h-8" />
            </button>
        );
    }

    const mobileClasses = "inset-0 w-full h-full rounded-none";
    const desktopClasses = `bottom-8 right-8 w-[400px] h-[550px] max-h-[80vh] rounded-xl shadow-2xl border ${classes.border}`;

    return (
        <div className={`fixed bg-white flex flex-col z-50 animate-fade-in ${isMobile ? mobileClasses : desktopClasses}`}>
            <div className={`flex justify-between items-center p-4 border-b ${classes.lightBorder} ${classes.lightBg} rounded-t-xl flex-shrink-0`}>
                <h3 className={`font-bold flex items-center gap-2 ${classes.text}`}>
                    <CunningLawyerIcon className="w-5 h-5" />
                    Trò chuyện Chuyên sâu
                </h3>
                <div className="flex items-center gap-1">
                    {!isMobile && <button onClick={() => setIsOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100"><MinimizeIcon className="w-5 h-5"/></button>}
                    <button onClick={() => setIsOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100"><XMarkIcon className="w-6 h-6"/></button>
                </div>
            </div>
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {(report.globalChatHistory || []).map((msg: ChatMessage, index: number) => (
                    <div key={index} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        <div className={`max-w-[85%] p-2.5 rounded-lg text-sm ${msg.role === 'user' ? `${classes.userBg} text-white` : 'bg-slate-100 text-slate-800'}`}>
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                ))}
                {isLoading && <div className="flex gap-2.5"><div className="p-2.5 rounded-lg bg-slate-100"><Loader /></div></div>}
                <div ref={chatEndRef} />
            </div>
            <footer className={`p-4 border-t ${classes.lightBorder} flex-shrink-0`}>
                {attachedFiles.length > 0 && (<div className="mb-2 space-y-1">{attachedFiles.map((file, index) => (<div key={index} className="flex items-center justify-between text-xs bg-slate-100 p-1.5 rounded"><span className="truncate">{file.name}</span><button onClick={() => setAttachedFiles(p => p.filter((_, i) => i !== index))} className="p-0.5 rounded-full hover:bg-slate-200"><XMarkIcon className="w-3 h-3 text-slate-500"/></button></div>))}</div>)}
                <form onSubmit={handleSendMessage} className="flex items-start gap-2">
                    <textarea value={userInput} onChange={e => setUserInput(e.target.value)} placeholder="Nhập tin nhắn..." className="flex-grow p-2 border border-slate-300 rounded-md text-sm resize-none" rows={2} disabled={isLoading} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }} />
                    <div className="flex flex-col gap-2">
                        <label className="p-2 bg-slate-100 text-slate-600 font-semibold rounded-md hover:bg-slate-200 cursor-pointer"><PaperClipIcon className="w-5 h-5"/><input type="file" className="hidden" multiple ref={fileInputRef} onChange={(e) => { if (e.target.files) setAttachedFiles(p => [...p, ...Array.from(e.target.files!)]); if (fileInputRef.current) fileInputRef.current.value = ""; }} accept=".pdf,.doc,.docx,.jpg,.jpeg" disabled={isLoading}/></label>
                        <button type="submit" disabled={isLoading || (!userInput.trim() && attachedFiles.length === 0)} className={`p-2 text-white font-semibold rounded-md disabled:bg-slate-300 ${classes.bg} ${classes.hoverBg}`}><SendIcon className="w-5 h-5"/></button>
                    </div>
                </form>
            </footer>
        </div>
    );
};

// --- New Pricing Component ---
const PricingTier: React.FC<{
    title: string;
    price: string;
    features: string[];
    recommended?: boolean;
    color: 'slate' | 'blue' | 'rose' | 'teal';
}> = ({ title, price, features, recommended, color }) => {
    const colorClasses = {
        slate: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-900', header: 'bg-slate-100', btn: 'bg-slate-800 hover:bg-slate-900' },
        blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', header: 'bg-blue-100', btn: 'bg-blue-600 hover:bg-blue-700' },
        rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-900', header: 'bg-rose-100', btn: 'bg-rose-600 hover:bg-rose-700' },
        teal: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-900', header: 'bg-teal-100', btn: 'bg-teal-600 hover:bg-teal-700' },
    }[color];

    return (
        <div className={`border rounded-xl overflow-hidden flex flex-col ${colorClasses.border} ${colorClasses.bg} ${recommended ? 'ring-2 ring-rose-500 shadow-xl transform scale-105 z-10' : 'shadow-sm'}`}>
            {recommended && <div className="bg-rose-500 text-white text-xs font-bold text-center py-1">KHUYÊN DÙNG</div>}
            <div className={`p-4 text-center ${colorClasses.header} border-b ${colorClasses.border}`}>
                <h4 className={`font-bold text-lg ${colorClasses.text}`}>{title}</h4>
                <div className="mt-2 text-2xl font-extrabold text-slate-800">{price}</div>
            </div>
            <div className="p-4 flex-grow">
                <ul className="space-y-3 text-sm text-slate-700">
                    {features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                            <CheckBadgeIcon className={`w-5 h-5 flex-shrink-0 ${color === 'rose' ? 'text-rose-500' : (color === 'blue' ? 'text-blue-500' : 'text-slate-500')}`} />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="p-4 border-t border-slate-200 bg-white">
                <button className={`w-full py-2 rounded-lg text-white font-semibold text-sm transition-colors ${colorClasses.btn}`}>
                    Chọn Gói Này
                </button>
            </div>
        </div>
    );
};

// Removed ExecutionRoadmapPanel from here as it is now in a separate file and imported.

// --- NEW: Panic Mode Component ---
const PanicModePanel: React.FC<{
    onClose: () => void;
}> = ({ onClose }) => {
    const handleDownloadOrder = async () => {
        try {
            const formData: FormData = {};
            const content = await generateDocumentFromTemplate('noContactOrder', formData);
            // Quick download logic (reuse export service if possible, here simplified)
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Don_Yeu_Cau_Cam_Tiep_Xuc.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (e) {
            alert("Không thể tạo đơn lúc này.");
        }
    };

    return (
        <div className="mb-6 p-6 bg-red-600 rounded-xl shadow-2xl text-white border-4 border-red-400 animate-pulse-slow">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-extrabold flex items-center gap-3">
                    <ShieldExclamationIcon className="w-10 h-10" />
                    CHẾ ĐỘ KHẨN CẤP: BẠO HÀNH GIA ĐÌNH
                </h3>
                <button onClick={onClose} className="p-2 bg-red-800 rounded-lg hover:bg-red-900 text-sm font-bold">Thoát Chế độ</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-red-800/50 p-4 rounded-lg">
                    <h4 className="font-bold text-lg mb-3 text-red-100 border-b border-red-400 pb-2">HÀNH ĐỘNG NGAY LẬP TỨC</h4>
                    <ul className="space-y-3">
                        {PANIC_MODE_INSTRUCTIONS.map((step, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                                <span className="font-bold bg-white text-red-600 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">{i + 1}</span>
                                <span>{step}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="flex flex-col justify-center items-center gap-4">
                    <button 
                        onClick={handleDownloadOrder}
                        className="w-full py-4 bg-white text-red-700 font-bold text-lg rounded-xl shadow-lg hover:bg-gray-100 transition-transform transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                        <PaperClipIcon className="w-6 h-6" />
                        TẢI ĐƠN CẤM TIẾP XÚC NGAY
                    </button>
                    <p className="text-xs text-red-200 text-center italic">
                        *Văn bản này cần nộp gấp cho Chủ tịch UBND Xã/Phường hoặc Tòa án để bảo vệ an toàn tính mạng.
                    </p>
                </div>
            </div>
        </div>
    );
};

// --- NEW: Asset Visualizer Component ---
const AssetVisualizer: React.FC<{
    assets: AssetItem[];
    setAssets: React.Dispatch<React.SetStateAction<AssetItem[]>>;
}> = ({ assets, setAssets }) => {
    const [newAsset, setNewAsset] = useState({ name: '', value: '' });

    const handleAddAsset = () => {
        if (!newAsset.name || !newAsset.value) return;
        const valueNum = parseFloat(newAsset.value.replace(/[^0-9]/g, ''));
        if (isNaN(valueNum)) return;

        const item: AssetItem = {
            id: Date.now().toString(),
            name: newAsset.name,
            value: valueNum,
            status: 'common', // Default to common
            allocation: 'sell_split' // Default split
        };
        setAssets([...assets, item]);
        setNewAsset({ name: '', value: '' });
    };

    const handleDelete = (id: string) => {
        setAssets(assets.filter(a => a.id !== id));
    };

    const moveAsset = (id: string, target: 'husband' | 'wife' | 'sell_split') => {
        setAssets(assets.map(a => a.id === id ? { ...a, allocation: target } : a));
    };

    const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    // Calculate Totals
    let husbandTotal = 0;
    let wifeTotal = 0;

    assets.forEach(asset => {
        if (asset.allocation === 'husband') {
            husbandTotal += asset.value;
        } else if (asset.allocation === 'wife') {
            wifeTotal += asset.value;
        } else {
            // Split 50/50
            husbandTotal += asset.value / 2;
            wifeTotal += asset.value / 2;
        }
    });

    const difference = husbandTotal - wifeTotal;
    const paymentText = difference > 0 
        ? `Chồng phải thanh toán lại cho Vợ: ${formatCurrency(difference / 2)}` 
        : (difference < 0 ? `Vợ phải thanh toán lại cho Chồng: ${formatCurrency(Math.abs(difference) / 2)}` : "Tài sản đã chia đều.");

    return (
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-lg mt-6">
            <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                <CalculatorIcon className="w-6 h-6 text-green-600" />
                Công cụ Chia Tài sản Trực quan
            </h3>
            
            {/* Input Area */}
            <div className="flex gap-2 mb-4">
                <input 
                    type="text" 
                    placeholder="Tên tài sản (VD: Nhà đất, Xe ô tô...)" 
                    value={newAsset.name}
                    onChange={e => setNewAsset({...newAsset, name: e.target.value})}
                    className="flex-grow p-2 border border-slate-300 rounded-md text-sm"
                />
                <input 
                    type="text" 
                    placeholder="Giá trị (VNĐ)" 
                    value={newAsset.value}
                    onChange={e => setNewAsset({...newAsset, value: e.target.value})}
                    className="w-1/3 p-2 border border-slate-300 rounded-md text-sm"
                />
                <button onClick={handleAddAsset} className="px-3 bg-green-600 text-white rounded-md hover:bg-green-700"><PlusIcon className="w-5 h-5"/></button>
            </div>

            {/* Visualizer Columns */}
            <div className="grid grid-cols-3 gap-4 mb-4 min-h-[200px]">
                {/* Husband Column */}
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <h4 className="font-bold text-blue-800 text-center mb-2">CHỒNG (Giữ hiện vật)</h4>
                    <div className="space-y-2">
                        {assets.filter(a => a.allocation === 'husband').map(a => (
                            <div key={a.id} className="bg-white p-2 rounded shadow-sm text-xs border-l-4 border-blue-500 flex justify-between items-center group">
                                <div>
                                    <div className="font-semibold">{a.name}</div>
                                    <div>{formatCurrency(a.value)}</div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => moveAsset(a.id, 'sell_split')} className="text-slate-400 hover:text-slate-600" title="Chuyển về Chung">⬅</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Common/Split Column */}
                <div className="bg-slate-100 p-3 rounded-lg border border-slate-200">
                    <h4 className="font-bold text-slate-700 text-center mb-2">CHIA ĐÔI / BÁN CHIA</h4>
                    <div className="space-y-2">
                        {assets.filter(a => a.allocation === 'sell_split').map(a => (
                            <div key={a.id} className="bg-white p-2 rounded shadow-sm text-xs border-l-4 border-slate-400 flex flex-col gap-1 group">
                                <div className="flex justify-between">
                                    <span className="font-semibold">{a.name}</span>
                                    <span>{formatCurrency(a.value)}</span>
                                </div>
                                <div className="flex justify-between mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => moveAsset(a.id, 'husband')} className="text-blue-600 bg-blue-100 px-1 rounded text-[10px]">← Chồng</button>
                                    <button onClick={() => handleDelete(a.id)} className="text-red-500"><TrashIcon className="w-3 h-3"/></button>
                                    <button onClick={() => moveAsset(a.id, 'wife')} className="text-rose-600 bg-rose-100 px-1 rounded text-[10px]">Vợ →</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Wife Column */}
                <div className="bg-rose-50 p-3 rounded-lg border border-rose-200">
                    <h4 className="font-bold text-rose-800 text-center mb-2">VỢ (Giữ hiện vật)</h4>
                    <div className="space-y-2">
                        {assets.filter(a => a.allocation === 'wife').map(a => (
                            <div key={a.id} className="bg-white p-2 rounded shadow-sm text-xs border-l-4 border-rose-500 flex justify-between items-center group">
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => moveAsset(a.id, 'sell_split')} className="text-slate-400 hover:text-slate-600" title="Chuyển về Chung">➡</button>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold">{a.name}</div>
                                    <div>{formatCurrency(a.value)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Summary Result */}
            <div className="bg-gray-800 text-white p-4 rounded-lg text-center">
                <div className="grid grid-cols-2 gap-4 mb-2 text-sm">
                    <div>Tổng giá trị Chồng giữ: <span className="font-bold text-blue-300">{formatCurrency(husbandTotal)}</span></div>
                    <div>Tổng giá trị Vợ giữ: <span className="font-bold text-rose-300">{formatCurrency(wifeTotal)}</span></div>
                </div>
                <div className="text-lg font-bold border-t border-gray-600 pt-2 text-green-400">
                    {paymentText}
                </div>
            </div>
        </div>
    );
};

// --- NEW: Invisible Files Checklist ---
const InvisibleFileChecklist: React.FC = () => {
    const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

    const toggleItem = (index: number) => {
        const newSet = new Set(checkedItems);
        if (newSet.has(index)) newSet.delete(index);
        else newSet.add(index);
        setCheckedItems(newSet);
    };

    return (
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-lg mt-6">
            <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                <CunningLawyerIcon className="w-6 h-6 text-slate-600" />
                Checklist "Hồ sơ Tàng hình" (Cần thu thập gấp)
            </h3>
            <p className="text-xs text-slate-500 mb-3 italic">Đây là những tài liệu khách hàng thường quên nhưng cực kỳ quan trọng để chứng minh tài sản ẩn.</p>
            <div className="grid grid-cols-1 gap-2">
                {INVISIBLE_FILES_CHECKLIST.map((item, index) => (
                    <div key={index} className={`flex items-start gap-2 p-2 rounded-md transition-colors cursor-pointer ${checkedItems.has(index) ? 'bg-green-50' : 'hover:bg-slate-50'}`} onClick={() => toggleItem(index)}>
                        <input 
                            type="checkbox" 
                            checked={checkedItems.has(index)} 
                            readOnly 
                            className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className={`text-sm ${checkedItems.has(index) ? 'text-green-800 line-through decoration-green-500' : 'text-slate-700'}`}>{item}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- NEW: Land Tax Calculator ---
const LandTaxCalculator: React.FC = () => {
    const [transferValue, setTransferValue] = useState('');
    const [stateValue, setStateValue] = useState('');
    const [deduction, setDeduction] = useState('');

    const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    const parseCurrency = (val: string) => parseFloat(val.replace(/[^0-9]/g, '')) || 0;

    const transferNum = parseCurrency(transferValue);
    const stateNum = parseCurrency(stateValue);
    
    const calculationBase = Math.max(transferNum, stateNum);
    const pit = calculationBase * 0.02; // 2% Personal Income Tax
    const regFee = calculationBase * 0.005; // 0.5% Registration Fee
    const appraisalFee = Math.min(calculationBase * 0.0015, 5000000); // 0.15%, max 5 million usually but varies
    const total = pit + regFee + appraisalFee;

    return (
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-lg mt-6">
            <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                <CalculatorIcon className="w-6 h-6 text-teal-600" />
                Tính Nhanh Thuế & Phí Sang Tên
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Giá trị chuyển nhượng (Thực tế)</label>
                    <input type="text" value={transferValue} onChange={e => setTransferValue(e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="VNĐ"/>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Giá theo Bảng giá Nhà nước</label>
                    <input type="text" value={stateValue} onChange={e => setStateValue(e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="VNĐ (Nhân hệ số K)"/>
                </div>
            </div>
            
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex justify-between text-sm mb-1">
                    <span>Căn cứ tính thuế:</span>
                    <span className="font-bold">{formatCurrency(calculationBase)}</span>
                </div>
                <div className="border-t border-slate-300 my-2"></div>
                <div className="flex justify-between text-sm mb-1">
                    <span>Thuế TNCN (2%):</span>
                    <span>{formatCurrency(pit)}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                    <span>Lệ phí Trước bạ (0.5%):</span>
                    <span>{formatCurrency(regFee)}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                    <span>Phí Thẩm định (0.15%):</span>
                    <span>{formatCurrency(appraisalFee)}</span>
                </div>
                <div className="border-t border-slate-300 my-2"></div>
                <div className="flex justify-between font-bold text-teal-700">
                    <span>TỔNG CỘNG:</span>
                    <span>{formatCurrency(total)}</span>
                </div>
                {transferNum < stateNum && transferNum > 0 && (
                    <p className="text-xs text-amber-600 mt-2 italic">*Cảnh báo: Giá chuyển nhượng thấp hơn giá nhà nước. Thuế sẽ bị áp theo giá nhà nước.</p>
                )}
            </div>
        </div>
    );
};

// --- NEW: Due Diligence Checklist ---
const DueDiligencePanel: React.FC<{
    checkedItems: number[];
    setCheckedItems: (items: number[]) => void;
}> = ({ checkedItems, setCheckedItems }) => {
    const toggle = (index: number) => {
        if (checkedItems.includes(index)) {
            setCheckedItems(checkedItems.filter(i => i !== index));
        } else {
            setCheckedItems([...checkedItems, index]);
        }
    };

    return (
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-lg mt-6">
            <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                <ShieldExclamationIcon className="w-6 h-6 text-teal-600" />
                Checklist Thẩm định Pháp lý (Bắt buộc)
            </h3>
            <div className="space-y-2">
                {LAND_DUE_DILIGENCE_CHECKLIST.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer" onClick={() => toggle(i)}>
                        <input type="checkbox" checked={checkedItems.includes(i)} readOnly className="mt-1 h-4 w-4 text-teal-600 rounded focus:ring-teal-500" />
                        <span className={`text-sm ${checkedItems.includes(i) ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{item}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const LandProcedureWorkflow: React.FC<WorkflowProps> = ({ onPreview, onGoBack, activeCase, onCasesUpdated }) => {
    // ... (Same state and logic as before)
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [procedureType, setProcedureType] = useState('');
    const [address, setAddress] = useState('');
    const [report, setReport] = useState<LandProcedureReport | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPreprocessingFinished, setIsPreprocessingFinished] = useState(false);
    
    // New States for Land Tools
    const [dueDiligenceState, setDueDiligenceState] = useState<number[]>([]);
    const [roadmapState, setRoadmapState] = useState<string[]>([]);

    const isMobile = useIsMobile();

    useEffect(() => {
        if (activeCase?.workflowType === 'landProcedure') {
            setProcedureType(activeCase.caseContent || '');
            setAddress(activeCase.clientRequest || '');
            setReport(activeCase.landProcedureReport || null);
            const loadedFiles: UploadedFile[] = (activeCase.files || []).map(sf => ({
                id: `${sf.name}-${Math.random()}`, file: base64ToFile(sf.content, sf.name, sf.type),
                preview: null, category: sf.category || 'Uncategorized', status: 'completed'
            }));
            setFiles(loadedFiles);
            if (activeCase.landProcedureReport) setIsLeftPanelCollapsed(true);
            if (activeCase.landChecklistState) setDueDiligenceState(activeCase.landChecklistState);
            if (activeCase.roadmapState) setRoadmapState(activeCase.roadmapState);
        }
    }, [activeCase]);

    // ... (performAnalysis and handleAnalyze same as before)
    const performAnalysis = async (filesToAnalyze: UploadedFile[]) => {
        setIsLoading(true);
        try {
            const result = await analyzeLandProcedure(procedureType, address, filesToAnalyze);
            setReport(result);
            setIsLeftPanelCollapsed(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi không xác định');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnalyze = async () => {
        if (!procedureType.trim()) { setError('Vui lòng nhập loại thủ tục.'); return; }
        setError(null);
        
        if (files.length > 0) {
            setIsProcessing(true);
            setIsPreprocessingFinished(false);
            const filesToProcess = files.map(f => ({ ...f, status: 'processing' as const }));
            setFiles(filesToProcess);
            try {
                const filesOnly = filesToProcess.map(f => f.file);
                const categories = await categorizeMultipleFiles(filesOnly);
                const processedFiles = filesToProcess.map(f => ({
                    ...f, status: 'completed' as const, category: categories[f.file.name] || 'Uncategorized',
                }));
                setFiles(processedFiles);
            } catch (e) {
                const failedFiles = filesToProcess.map(f => ({ ...f, status: 'failed' as const, error: e instanceof Error ? e.message : 'Categorization failed' }));
                setFiles(failedFiles);
            } finally {
                setIsPreprocessingFinished(true);
            }
        } else {
            performAnalysis([]);
        }
    };

    const handleSave = async () => {
        if (!activeCase) return;
        const name = window.prompt("Nhập tên hồ sơ:", activeCase.name || `Thủ tục Đất đai ${new Date().toLocaleDateString()}`);
        if (!name) return;
        setIsSaving(true);
        try {
            const serializableFiles: SerializableFile[] = await Promise.all(files.map(async f => ({ name: f.file.name, type: f.file.type, content: await fileToBase64(f.file), category: f.category })));
            const now = new Date().toISOString();
            const isNew = activeCase.id.startsWith('new_');
            const caseToSave: SavedCase = {
                ...activeCase, id: isNew ? now : activeCase.id, createdAt: isNew ? now : activeCase.createdAt, updatedAt: now,
                name, workflowType: 'landProcedure', files: serializableFiles, caseContent: procedureType, clientRequest: address,
                landProcedureReport: report, litigationType: null, litigationStage: 'consulting', query: '', analysisReport: null,
                landChecklistState: dueDiligenceState,
                roadmapState: roadmapState
            };
            await saveCase(caseToSave);
            onCasesUpdated();
            alert("Đã lưu hồ sơ thành công!");
        } catch (err) { alert("Lỗi khi lưu hồ sơ."); } finally { setIsSaving(false); }
    };

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden relative">
            <div className={`${isLeftPanelCollapsed ? (isMobile ? 'hidden' : 'w-0 opacity-0 p-0') : (isMobile ? 'w-full absolute z-20 h-full' : 'w-2/5 opacity-100 p-6 border-r')} bg-white flex flex-col transition-all duration-300 shadow-xl lg:shadow-none flex-shrink-0`}>
                <div className="flex justify-between items-center mb-4">
                    <button onClick={onGoBack} className="flex items-center gap-2 text-sm text-slate-600 hover:text-teal-600 font-semibold"><BackIcon className="w-5 h-5" /> Quay lại</button>
                    <button onClick={() => setIsLeftPanelCollapsed(true)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"><PanelCollapseIcon className="w-6 h-6" /></button>
                </div>
                <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                    <h2 className="text-xl font-bold text-teal-800">Thủ tục Đất đai</h2>
                    <FileUpload files={files} setFiles={setFiles} onPreview={onPreview} />
                    <div><label className="block text-sm font-semibold text-slate-700 mb-1">Loại Thủ tục</label><input type="text" value={procedureType} onChange={e => setProcedureType(e.target.value)} placeholder="VD: Sang tên sổ đỏ, Cấp đổi..." className="w-full p-2 border rounded-md text-sm" /></div>
                    <div><label className="block text-sm font-semibold text-slate-700 mb-1">Địa chỉ Thửa đất</label><input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="VD: Xã A, Huyện B, Tỉnh C..." className="w-full p-2 border rounded-md text-sm" /></div>
                </div>
                <div className="pt-4 border-t flex flex-col gap-2">
                    <button onClick={handleAnalyze} disabled={isLoading || isProcessing} className="w-full py-2.5 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 disabled:bg-slate-300 flex justify-center items-center gap-2">{isLoading || isProcessing ? <Loader /> : 'Phân tích Hồ sơ'}</button>
                    <button onClick={handleSave} disabled={isSaving} className="w-full py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 disabled:bg-slate-300 flex justify-center items-center gap-2"><SaveCaseIcon className="w-4 h-4" /> Lưu</button>
                </div>
            </div>
            <main className="flex-1 p-6 overflow-y-auto relative h-full">
                {isLeftPanelCollapsed && <button onClick={() => setIsLeftPanelCollapsed(false)} className="absolute top-4 left-4 z-30 p-2 bg-white border rounded-lg shadow-md"><PanelExpandIcon className="w-6 h-6" /></button>}
                
                {/* Advanced Tools always available */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <LandTaxCalculator />
                    <DueDiligencePanel checkedItems={dueDiligenceState} setCheckedItems={setDueDiligenceState} />
                </div>

                {!report && !isLoading && <div className="flex items-center justify-center text-slate-400 py-10">Kết quả phân tích sẽ hiển thị tại đây.</div>}
                {isLoading && <div className="flex h-full items-center justify-center"><Loader /></div>}
                {error && <Alert message={error} type="error" />}
                {report && (
                    <div className="space-y-6 pb-20">
                        {/* Execution Roadmap (Trip-based) - USING SHARED COMPONENT */}
                        {report.executionRoadmap && (
                            <ExecutionRoadmapPanel 
                                roadmap={report.executionRoadmap} 
                                checkedTasks={roadmapState} 
                                setCheckedTasks={setRoadmapState} 
                            />
                        )}

                        {/* Pricing Packages */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <PricingTier 
                                title="Gói Cơ bản" 
                                price="5.000.000 đ" 
                                features={['Soạn thảo Hợp đồng', 'Kê khai Thuế', 'Hướng dẫn nộp hồ sơ', 'Tư vấn thuế phí']} 
                                color="slate"
                                recommended={true}
                            />
                            <PricingTier 
                                title="Gói Trọn gói (Sang tên)" 
                                price="12.000.000 đ" 
                                features={['Bao gồm Gói Cơ bản', 'Đại diện công chứng', 'Nộp hồ sơ & Đóng thuế', 'Nhận kết quả tại nhà']} 
                                color="teal"
                            />
                            <PricingTier 
                                title="Gói Giải quyết Tranh chấp" 
                                price="Thỏa thuận" 
                                features={['Hòa giải tại UBND Xã', 'Khởi kiện Tòa án', 'Tư vấn chiến lược', 'Thu thập chứng cứ']} 
                                color="rose"
                            />
                        </div>

                        <div className="p-4 bg-white border rounded-lg shadow-lg">
                            <h3 className="text-lg font-bold text-teal-800 mb-3">Hướng dẫn Chi tiết</h3>
                            <div className="space-y-4">
                                {report.stepByStepGuide.map((step, i) => (
                                    <div key={i} className="p-3 bg-teal-50 rounded-md border border-teal-100">
                                        <div className="flex justify-between font-bold text-teal-900"><span>{step.step}</span><span className="text-xs bg-white px-2 py-1 rounded border">{step.estimatedTime}</span></div>
                                        <p className="text-sm mt-1 text-slate-700">{step.description}</p>
                                        <p className="text-xs mt-2 text-slate-500 italic">Tại: {step.location}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 bg-white border rounded-lg shadow-lg">
                            <h3 className="text-lg font-bold text-slate-800 mb-3">Hồ sơ Cần chuẩn bị</h3>
                            <ul className="space-y-2 text-sm">
                                {report.documentChecklist.map((doc, i) => (
                                    <li key={i} className={`p-2 border-l-4 rounded-r ${doc.status === 'available' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                                        <span className="font-bold">{doc.name}</span> {doc.required && <span className="text-red-600">*</span>}
                                        <p className="text-xs text-slate-600">{doc.notes}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="p-4 bg-white border rounded-lg shadow-lg">
                            <h3 className="text-lg font-bold text-slate-800 mb-3">Ước tính Chi phí (AI)</h3>
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-100"><tr><th className="p-2">Khoản mục</th><th className="p-2">Số tiền (Ước tính)</th><th className="p-2">Căn cứ</th></tr></thead>
                                <tbody>
                                    {report.financialEstimation.map((item, i) => (
                                        <tr key={i} className="border-b"><td className="p-2 font-medium">{item.item}</td><td className="p-2 text-teal-700 font-bold">{item.amount}</td><td className="p-2 text-slate-500 text-xs">{item.basis}</td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {report.insiderTips && (
                            <div className="p-4 bg-amber-50 border-l-4 border-amber-400 rounded-lg shadow-sm">
                                <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-2"><CunningLawyerIcon className="w-5 h-5" /> Mẹo Xử lý Thực tế</h3>
                                <div className="text-sm text-amber-800"><CunningLawyerText text={report.insiderTips} /></div>
                            </div>
                        )}
                        <GenericChat report={report} onUpdateReport={setReport} onContinueChat={continueLandChat} themeColor="teal" />
                    </div>
                )}
            </main>
            {isProcessing && <ProcessingProgress files={files} onContinue={() => { setIsProcessing(false); performAnalysis(files.filter(f => f.status === 'completed')); }} onCancel={() => setIsProcessing(false)} isFinished={isPreprocessingFinished} hasTextContent={!!(procedureType || address)} />}
        </div>
    );
};

// ... (DivorceWorkflow also updated to use ExecutionRoadmapPanel import, but no logic changes needed if import works)
export const DivorceWorkflow: React.FC<WorkflowProps> = ({ onPreview, onGoBack, activeCase, onCasesUpdated }) => {
    // ... (Same state)
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [context, setContext] = useState('');
    const [report, setReport] = useState<DivorceReport | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPreprocessingFinished, setIsPreprocessingFinished] = useState(false);
    
    // --- NEW STATES ---
    const [isDomesticViolence, setIsDomesticViolence] = useState(false);
    const [assets, setAssets] = useState<AssetItem[]>([]);
    const [roadmapState, setRoadmapState] = useState<string[]>([]);

    const isMobile = useIsMobile();

    useEffect(() => {
        if (activeCase?.workflowType === 'divorceConsultation') {
            setContext(activeCase.caseContent || '');
            setReport(activeCase.divorceReport || null);
            const loadedFiles: UploadedFile[] = (activeCase.files || []).map(sf => ({
                id: `${sf.name}-${Math.random()}`, file: base64ToFile(sf.content, sf.name, sf.type),
                preview: null, category: sf.category || 'Uncategorized', status: 'completed'
            }));
            setFiles(loadedFiles);
            if (activeCase.divorceReport) setIsLeftPanelCollapsed(true);
            
            // Load saved new states
            if (activeCase.divorceAssets) setAssets(activeCase.divorceAssets);
            if (activeCase.divorcePanicMode) setIsDomesticViolence(activeCase.divorcePanicMode);
            if (activeCase.roadmapState) setRoadmapState(activeCase.roadmapState);
        }
    }, [activeCase]);

    // ... (analysis and save logic same)
    const performAnalysis = async (filesToAnalyze: UploadedFile[]) => {
        setIsLoading(true);
        try {
            const contextWithPanic = isDomesticViolence 
                ? `[KHẨN CẤP: KHÁCH HÀNG BÁO CÁO CÓ BẠO HÀNH GIA ĐÌNH] ${context}` 
                : context;
            const result = await analyzeDivorceCase(contextWithPanic, filesToAnalyze);
            setReport(result);
            setIsLeftPanelCollapsed(true);
        } catch (err) { setError(err instanceof Error ? err.message : 'Lỗi không xác định'); } finally { setIsLoading(false); }
    };

    const handleAnalyze = async () => {
        if (!context.trim() && files.length === 0) { setError('Vui lòng nhập thông tin hoặc tải hồ sơ.'); return; }
        setError(null);
        if (files.length > 0) {
            setIsProcessing(true);
            setIsPreprocessingFinished(false);
            const filesToProcess = files.map(f => ({ ...f, status: 'processing' as const }));
            setFiles(filesToProcess);
            try {
                const filesOnly = filesToProcess.map(f => f.file);
                const categories = await categorizeMultipleFiles(filesOnly);
                const processedFiles = filesToProcess.map(f => ({ ...f, status: 'completed' as const, category: categories[f.file.name] || 'Uncategorized' }));
                setFiles(processedFiles);
            } catch (e) {
                const failedFiles = filesToProcess.map(f => ({ ...f, status: 'failed' as const, error: e instanceof Error ? e.message : 'Categorization failed' }));
                setFiles(failedFiles);
            } finally { setIsPreprocessingFinished(true); }
        } else { performAnalysis([]); }
    };

    const handleSave = async () => {
        if (!activeCase) return;
        const name = window.prompt("Nhập tên hồ sơ:", activeCase.name || `Tư vấn Ly hôn ${new Date().toLocaleDateString()}`);
        if (!name) return;
        setIsSaving(true);
        try {
            const serializableFiles: SerializableFile[] = await Promise.all(files.map(async f => ({ name: f.file.name, type: f.file.type, content: await fileToBase64(f.file), category: f.category })));
            const now = new Date().toISOString();
            const isNew = activeCase.id.startsWith('new_');
            const caseToSave: SavedCase = {
                ...activeCase, id: isNew ? now : activeCase.id, createdAt: isNew ? now : activeCase.createdAt, updatedAt: now,
                name, workflowType: 'divorceConsultation', files: serializableFiles, caseContent: context, clientRequest: '',
                divorceReport: report, litigationType: null, litigationStage: 'consulting', query: '', analysisReport: null,
                divorceAssets: assets,
                divorcePanicMode: isDomesticViolence,
                roadmapState: roadmapState
            };
            await saveCase(caseToSave);
            onCasesUpdated();
            alert("Đã lưu hồ sơ thành công!");
        } catch (err) { alert("Lỗi khi lưu hồ sơ."); } finally { setIsSaving(false); }
    };

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden relative">
            <div className={`${isLeftPanelCollapsed ? (isMobile ? 'hidden' : 'w-0 opacity-0 p-0') : (isMobile ? 'w-full absolute z-20 h-full' : 'w-2/5 opacity-100 p-6 border-r')} bg-white flex flex-col transition-all duration-300 shadow-xl lg:shadow-none flex-shrink-0`}>
                <div className="flex justify-between items-center mb-4">
                    <button onClick={onGoBack} className="flex items-center gap-2 text-sm text-slate-600 hover:text-rose-600 font-semibold"><BackIcon className="w-5 h-5" /> Quay lại</button>
                    <button onClick={() => setIsLeftPanelCollapsed(true)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"><PanelCollapseIcon className="w-6 h-6" /></button>
                </div>
                <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                    <h2 className="text-xl font-bold text-rose-800">Tư vấn Ly hôn</h2>
                    
                    {/* Panic Toggle */}
                    <div className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${isDomesticViolence ? 'bg-red-50 border-red-500' : 'bg-slate-50 border-slate-200 hover:border-red-300'}`} onClick={() => setIsDomesticViolence(!isDomesticViolence)}>
                        <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${isDomesticViolence ? 'bg-red-500 border-red-500' : 'border-slate-400'}`}>
                                {isDomesticViolence && <span className="text-white text-xs">✓</span>}
                            </div>
                            <span className={`font-bold ${isDomesticViolence ? 'text-red-700' : 'text-slate-600'}`}>Khách hàng bị Bạo hành (Cần bảo vệ khẩn cấp)</span>
                        </div>
                        {isDomesticViolence && <p className="text-xs text-red-600 mt-1 ml-8">Đã kích hoạt chế độ bảo vệ khẩn cấp.</p>}
                    </div>

                    <FileUpload files={files} setFiles={setFiles} onPreview={onPreview} />
                    <div><label className="block text-sm font-semibold text-slate-700 mb-1">Bối cảnh & Mong muốn</label><textarea value={context} onChange={e => setContext(e.target.value)} placeholder="Mô tả tình trạng hôn nhân, con cái, tài sản, mong muốn..." className="w-full h-40 p-2 border rounded-md text-sm" /></div>
                </div>
                <div className="pt-4 border-t flex flex-col gap-2">
                    <button onClick={handleAnalyze} disabled={isLoading || isProcessing} className="w-full py-2.5 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 disabled:bg-slate-300 flex justify-center items-center gap-2">{isLoading || isProcessing ? <Loader /> : 'Phân tích Chiến lược'}</button>
                    <button onClick={handleSave} disabled={isSaving} className="w-full py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 disabled:bg-slate-300 flex justify-center items-center gap-2"><SaveCaseIcon className="w-4 h-4" /> Lưu</button>
                </div>
            </div>
            <main className="flex-1 p-6 overflow-y-auto relative h-full">
                {isLeftPanelCollapsed && <button onClick={() => setIsLeftPanelCollapsed(false)} className="absolute top-4 left-4 z-30 p-2 bg-white border rounded-lg shadow-md"><PanelExpandIcon className="w-6 h-6" /></button>}
                
                {isDomesticViolence && <PanicModePanel onClose={() => setIsDomesticViolence(false)} />}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <AssetVisualizer assets={assets} setAssets={setAssets} />
                    <InvisibleFileChecklist />
                </div>

                {!report && !isLoading && <div className="flex items-center justify-center text-slate-400 py-10">Kết quả phân tích chi tiết sẽ hiển thị tại đây sau khi bạn nhấn "Phân tích".</div>}
                {isLoading && <div className="flex h-full items-center justify-center"><Loader /></div>}
                {error && <Alert message={error} type="error" />}
                
                {report && (
                    <div className="space-y-6 pb-20">
                        {/* Execution Roadmap - USING SHARED COMPONENT */}
                        {report.executionRoadmap && (
                            <ExecutionRoadmapPanel 
                                roadmap={report.executionRoadmap} 
                                checkedTasks={roadmapState} 
                                setCheckedTasks={setRoadmapState} 
                            />
                        )}

                        {/* Pricing Packages */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <PricingTier 
                                title="Gói Cơ bản" 
                                price="8.000.000 đ" 
                                features={['Soạn thảo Đơn ly hôn', 'Hướng dẫn nộp hồ sơ', 'Tư vấn quy trình chuẩn', 'Hỗ trợ online 1 tháng']} 
                                color="slate"
                                recommended={report.divorceType === 'ThuanTinh'}
                            />
                            <PricingTier 
                                title="Gói Tiêu chuẩn" 
                                price="25.000.000 đ" 
                                features={['Bao gồm Gói Cơ bản', 'Đại diện nộp hồ sơ', 'Xử lý thủ tục tại Tòa', 'Xác minh cư trú bị đơn']} 
                                color="blue"
                                recommended={report.divorceType === 'DonPhuong' && !report.custodyAnalysis.strategy.includes("tranh chấp gay gắt")}
                            />
                            <PricingTier 
                                title="Gói Tranh tụng" 
                                price="Thỏa thuận" 
                                features={['Bảo vệ tại Phiên tòa', 'Tranh chấp quyền nuôi con', 'Truy vết & Chia tài sản', 'Thu thập chứng cứ']} 
                                color="rose"
                                recommended={report.custodyAnalysis.strategy.includes("tranh chấp") || report.assetDivision.divisionStrategy.includes("phức tạp")}
                            />
                        </div>

                        {report.practicalObstacles && (
                            <div className="p-4 bg-gray-900 rounded-lg border border-gray-700 text-gray-200 shadow-lg animate-fade-in">
                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <WarningIcon className="w-6 h-6 text-red-500" />
                                    Góc khuất Thực tế & Rào cản (Ngoài Luật)
                                </h3>
                                <div className="space-y-3">
                                    {report.practicalObstacles.map((obs, i) => (
                                        <div key={i} className="p-3 bg-gray-800 rounded border-l-4 border-red-500">
                                            <div className="font-bold text-red-400 text-sm uppercase mb-1">{obs.obstacle}</div>
                                            <p className="text-sm text-slate-300 mb-2 italic">"{obs.realityCheck}"</p>
                                            <div className="text-sm text-green-400 font-semibold flex items-start gap-2">
                                                <span>➥ Đối sách:</span>
                                                <span>{obs.counterMeasure}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="p-4 bg-white border rounded-lg shadow-lg">
                            <h3 className="text-lg font-bold text-rose-800 mb-3">Chiến lược Quyền Nuôi con</h3>
                            <div className="space-y-3 text-sm">
                                <div className="p-3 bg-rose-50 rounded border border-rose-100"><span className="font-bold text-rose-900">Chiến lược:</span> <p className="mt-1">{report.custodyAnalysis.strategy}</p></div>
                                <div><span className="font-bold">Chứng cứ cần thiết:</span><ul className="list-disc list-inside mt-1 text-slate-700">{report.custodyAnalysis.evidenceNeeded.map((e, i) => <li key={i}>{e}</li>)}</ul></div>
                                {report.custodyAnalysis.custodyLeveragePoints && <div className="mt-2 p-2 bg-amber-50 border-l-4 border-amber-400"><span className="font-bold text-amber-800">Điểm Đòn bẩy:</span> <p className="text-sm">{report.custodyAnalysis.custodyLeveragePoints}</p></div>}
                                <div className="mt-2"><span className="font-bold text-purple-800">Mẹo (Cáo già):</span> <CunningLawyerText text={report.custodyAnalysis.cunningTips} /></div>
                            </div>
                        </div>
                        <div className="p-4 bg-white border rounded-lg shadow-lg">
                            <h3 className="text-lg font-bold text-slate-800 mb-3">Phân chia Tài sản (Phân tích AI)</h3>
                            <div className="space-y-3 text-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-2 bg-slate-50 rounded border"><span className="font-bold">Tài sản Chung (Dự kiến):</span><ul className="list-disc list-inside mt-1">{report.assetDivision.commonAssets.map((a, i) => <li key={i}>{a}</li>)}</ul></div>
                                    <div className="p-2 bg-slate-50 rounded border"><span className="font-bold">Tài sản Riêng (Dự kiến):</span><ul className="list-disc list-inside mt-1">{report.assetDivision.privateAssets.map((a, i) => <li key={i}>{a}</li>)}</ul></div>
                                </div>
                                <div className="p-3 bg-blue-50 rounded border border-blue-100"><span className="font-bold text-blue-900">Chiến lược Phân chia:</span> <p className="mt-1">{report.assetDivision.divisionStrategy}</p></div>
                                {report.assetDivision.assetTracingStrategy && <div className="p-3 bg-indigo-50 border-l-4 border-indigo-400"><span className="font-bold text-indigo-900 flex items-center gap-2"><CunningLawyerIcon className="w-4 h-4"/> Truy vết Tài sản Ẩn:</span> <p className="mt-1">{report.assetDivision.assetTracingStrategy}</p></div>}
                                <div className="mt-2"><span className="font-bold text-purple-800">Mẹo Bảo vệ Tài sản:</span> <CunningLawyerText text={report.assetDivision.cunningTips} /></div>
                            </div>
                        </div>
                        <div className="p-4 bg-white border rounded-lg shadow-lg">
                            <h3 className="text-lg font-bold text-slate-800 mb-3">Lộ trình Tố tụng</h3>
                            <ol className="list-decimal list-inside space-y-2 text-sm">{report.procedureRoadmap.map((step, i) => <li key={i}><strong>{step.step}:</strong> {step.description}</li>)}</ol>
                        </div>
                        <div className="p-4 bg-teal-50 border-l-4 border-teal-400 rounded-lg shadow-sm"><h3 className="font-bold text-teal-900 mb-2">Lời khuyên Tâm lý & Pháp lý</h3><p className="text-sm text-teal-800">{report.emotionalAndLegalAdvice}</p></div>
                        <GenericChat report={report} onUpdateReport={setReport} onContinueChat={continueDivorceChat} themeColor="rose" />
                    </div>
                )}
            </main>
            {isProcessing && <ProcessingProgress files={files} onContinue={() => { setIsProcessing(false); performAnalysis(files.filter(f => f.status === 'completed')); }} onCancel={() => setIsProcessing(false)} isFinished={isPreprocessingFinished} hasTextContent={!!context} />}
        </div>
    );
};