
import React, { useState, useRef, useEffect } from 'react';
import type { SavedCase, UploadedFile, LandProcedureReport, DivorceReport, ChatMessage, SerializableFile, DocType, FormData } from '../types.ts';
import { FileUpload } from './FileUpload.tsx';
import { Loader } from './Loader.tsx';
import { analyzeLandProcedure, analyzeDivorceCase, continueLandChat, continueDivorceChat, generateDocumentFromTemplate } from '../services/geminiService.ts';
import { BackIcon } from './icons/BackIcon.tsx';
import { SaveCaseIcon } from './icons/SaveCaseIcon.tsx';
import { ChatIcon } from './icons/ChatIcon.tsx';
import { SendIcon } from './icons/SendIcon.tsx';
import { PaperClipIcon } from './icons/PaperClipIcon.tsx'; // Ensure this icon exists or use similar
import { MinimizeIcon } from './icons/MinimizeIcon.tsx';
import { XMarkIcon } from './icons/XMarkIcon.tsx';
import { PanelCollapseIcon } from './icons/PanelCollapseIcon.tsx';
import { PanelExpandIcon } from './icons/PanelExpandIcon.tsx';
import { saveCase } from '../services/db.ts';
import { DOC_TYPE_FIELDS, FIELD_LABELS, REGIONAL_COURTS } from '../constants.ts';

// --- Helper Components ---

const CunningLawyerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM4.5 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM15.375 16.125a2.625 2.625 0 1 1 5.25 0 2.625 2.625 0 0 1-5.25 0ZM12 18.75a.75.75 0 0 0 .75.75h.008a.75.75 0 0 0 .75-.75V18a3 3 0 0 0-1.5 0v.75ZM12 21a.75.75 0 0 0 .75.75h.008a.75.75 0 0 0 .75-.75v-.375a3 3 0 0 0-1.5 0v.375Z" clipRule="evenodd" />
    <path d="M12 1.5c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 1.5 12 1.5ZM8.625 15a.75.75 0 0 0-1.5 0v.625H6.375a.75.75 0 0 0 0 1.5h.75v.625a.75.75 0 0 0 1.5 0v-.625h.75a.75.75 0 0 0 0-1.5h-.75V15Zm6 0a.75.75 0 0 0-1.5 0v.625H12.375a.75.75 0 0 0 0 1.5h.75v.625a.75.75 0 0 0 1.5 0v-.625h.75a.75.75 0 0 0 0-1.5h-.75V15Z" />
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
    for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
    const byteArray = new Uint8Array(byteNumbers);
    return new File([byteArray], filename, { type: mimeType });
};

// --- Generic Chat Component for Specialized Workflows ---
const SpecializedChat: React.FC<{
    chatHistory: ChatMessage[];
    onSendMessage: (msg: string, files: File[]) => Promise<void>;
    isLoading: boolean;
    title: string;
    color: string;
}> = ({ chatHistory, onSendMessage, isLoading, title, color }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const isMobile = useIsMobile();
    const chatEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { if (isOpen) setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100); }, [chatHistory, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!userInput.trim() && attachedFiles.length === 0) || isLoading) return;
        await onSendMessage(userInput.trim(), attachedFiles);
        setUserInput('');
        setAttachedFiles([]);
    };

    if (!isOpen) {
        return (
            <button onClick={() => setIsOpen(true)} className={`fixed bottom-8 right-8 ${color} text-white rounded-full p-4 shadow-lg hover:scale-110 transition-transform z-40`}>
                <ChatIcon className="w-8 h-8" />
            </button>
        );
    }

    const mobileClasses = "inset-0 w-full h-full rounded-none";
    const desktopClasses = "bottom-8 right-8 w-[400px] h-[550px] max-h-[80vh] rounded-xl shadow-2xl";

    return (
        <div className={`fixed bg-white flex flex-col z-50 animate-fade-in border border-slate-200 ${isMobile ? mobileClasses : desktopClasses}`}>
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50 rounded-t-xl flex-shrink-0">
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><CunningLawyerIcon className="w-5 h-5"/> {title}</h3>
                <div className="flex items-center gap-1">
                    {!isMobile && <button onClick={() => setIsOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100"><MinimizeIcon className="w-5 h-5"/></button>}
                    <button onClick={() => setIsOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100"><XMarkIcon className="w-6 h-6"/></button>
                </div>
            </div>
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {chatHistory.map((msg, index) => (
                    <div key={index} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        <div className={`max-w-[85%] p-2.5 rounded-lg text-sm ${msg.role === 'user' ? `${color} text-white` : 'bg-slate-100 text-slate-800'}`}>
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                ))}
                {isLoading && <div className="flex gap-2.5"><div className="p-2.5 rounded-lg bg-slate-100"><Loader /></div></div>}
                <div ref={chatEndRef} />
            </div>
            <footer className="p-4 border-t border-slate-100 flex-shrink-0">
                {attachedFiles.length > 0 && (<div className="mb-2 space-y-1">{attachedFiles.map((file, index) => (<div key={index} className="flex items-center justify-between text-xs bg-slate-100 p-1.5 rounded"><span className="truncate">{file.name}</span><button onClick={() => setAttachedFiles(p => p.filter((_, i) => i !== index))} className="p-0.5 rounded-full hover:bg-slate-200"><XMarkIcon className="w-3 h-3 text-slate-500"/></button></div>))}</div>)}
                <form onSubmit={handleSubmit} className="flex items-start gap-2">
                    <textarea value={userInput} onChange={e => setUserInput(e.target.value)} placeholder="Nhập tin nhắn..." className="flex-grow p-2 border border-slate-300 rounded-md text-sm resize-none focus:ring-2 outline-none" rows={2} disabled={isLoading} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }} />
                    <div className="flex flex-col gap-2">
                        <label className="p-2 bg-slate-100 text-slate-600 font-semibold rounded-md hover:bg-slate-200 cursor-pointer"><PaperClipIcon className="w-5 h-5"/><input type="file" className="hidden" multiple ref={fileInputRef} onChange={(e) => { if (e.target.files) setAttachedFiles(p => [...p, ...Array.from(e.target.files!)]); if (fileInputRef.current) fileInputRef.current.value = ""; }} accept=".pdf,.doc,.docx,.jpg,.jpeg" disabled={isLoading}/></label>
                        <button type="submit" disabled={isLoading || (!userInput.trim() && attachedFiles.length === 0)} className={`p-2 ${color} text-white font-semibold rounded-md hover:opacity-90 disabled:bg-slate-300`}><SendIcon className="w-5 h-5"/></button>
                    </div>
                </form>
            </footer>
        </div>
    );
};

// --- Common Generator Component ---
const SimpleDocGenerator: React.FC<{ docTypes: {value: DocType, label: string}[] }> = ({ docTypes }) => {
    const [docType, setDocType] = useState<DocType>(docTypes[0]?.value || '');
    const [formData, setFormData] = useState<FormData>({});
    const [generatedText, setGeneratedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const currentFields = DOC_TYPE_FIELDS[docType] || [];

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const res = await generateDocumentFromTemplate(docType, formData);
            setGeneratedText(res);
        } catch (e) { alert("Lỗi tạo văn bản"); } 
        finally { setIsLoading(false); }
    };

    return (
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mt-6 animate-fade-in">
            <h3 className="font-bold text-slate-800 mb-3">Soạn thảo Hồ sơ & Văn bản</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <select value={docType} onChange={e => setDocType(e.target.value as DocType)} className="w-full p-2 border rounded">
                        {docTypes.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {currentFields.map(field => (
                            <div key={field}>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">{FIELD_LABELS[field] || field}</label>
                                <input type="text" value={formData[field] || ''} onChange={e => setFormData({...formData, [field]: e.target.value})} className="w-full p-2 border rounded text-sm"/>
                            </div>
                        ))}
                    </div>
                    <button onClick={handleGenerate} disabled={isLoading} className="w-full py-2 bg-blue-600 text-white rounded font-semibold disabled:bg-slate-300">
                        {isLoading ? <Loader/> : 'Tạo Văn bản'}
                    </button>
                </div>
                <div className="bg-slate-50 border rounded p-3 h-80 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm font-sans">{generatedText || 'Văn bản sẽ hiện tại đây...'}</pre>
                </div>
            </div>
        </div>
    );
};


// --- Land Procedure Workflow ---
export const LandProcedureWorkflow: React.FC<{ onGoBack: () => void, activeCase: SavedCase | null, onCasesUpdated: () => void, onPreview: (file: UploadedFile) => void }> = ({ onGoBack, activeCase, onCasesUpdated, onPreview }) => {
    const [transactionType, setTransactionType] = useState('Chuyển nhượng (Sang tên sổ đỏ)');
    const [landAddress, setLandAddress] = useState('');
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [report, setReport] = useState<LandProcedureReport | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const isMobile = useIsMobile();

    useEffect(() => {
        if (activeCase?.workflowType === 'landProcedure') {
            setReport(activeCase.landProcedureReport || null);
            setLandAddress(activeCase.caseContent || '');
            const typeMatch = activeCase.clientRequest.match(/Loại: (.*)/);
            if (typeMatch) setTransactionType(typeMatch[1]);
            const loadedFiles = (activeCase.files || []).map(sf => ({ id: sf.name, file: base64ToFile(sf.content, sf.name, sf.type), preview: null, category: 'Uncategorized', status: 'completed' } as UploadedFile));
            setFiles(loadedFiles);
            if (activeCase.landProcedureReport) setIsLeftPanelCollapsed(true);
        }
    }, [activeCase]);

    const handleAnalyze = async () => {
        if (!landAddress.trim()) return alert("Vui lòng nhập địa chỉ thửa đất để tra cứu quy định địa phương.");
        setIsLoading(true);
        try {
            const res = await analyzeLandProcedure(transactionType, landAddress, files);
            setReport(res);
            setIsLeftPanelCollapsed(true);
        } catch (e) { alert("Lỗi phân tích: " + (e instanceof Error ? e.message : "Unknown")); }
        finally { setIsLoading(false); }
    };

    const handleChat = async (msg: string, newFiles: File[]) => {
        if (!report) return;
        const uploadedNewFiles = newFiles.map(f => ({ id: f.name, file: f, preview: null, category: 'Uncategorized', status: 'pending' } as UploadedFile));
        const currentHistory = [...(report.globalChatHistory || []), { role: 'user', content: msg } as ChatMessage];
        setReport({ ...report, globalChatHistory: currentHistory }); // Optimistic update
        try {
            const { chatResponse, updatedReport } = await continueLandChat(report, currentHistory, msg, uploadedNewFiles);
            const aiMsg = { role: 'model', content: chatResponse } as ChatMessage;
            if (updatedReport) setReport({ ...updatedReport, globalChatHistory: [...currentHistory, aiMsg] });
            else setReport({ ...report, globalChatHistory: [...currentHistory, aiMsg] });
        } catch (e) { console.error(e); }
    };

    const handleSave = async () => {
        const name = prompt("Tên hồ sơ:", activeCase?.name || `Đăng ký đất đai - ${landAddress}`);
        if (!name) return;
        setIsSaving(true);
        const serializableFiles = await Promise.all(files.map(async f => ({ name: f.file.name, type: f.file.type, content: await fileToBase64(f.file) })));
        const now = new Date().toISOString();
        const newCase: SavedCase = {
            id: activeCase?.id || now, name, workflowType: 'landProcedure',
            caseContent: landAddress, clientRequest: `Loại: ${transactionType}`, query: '', files: serializableFiles,
            createdAt: activeCase?.createdAt || now, updatedAt: now, litigationType: null, litigationStage: 'consulting',
            analysisReport: null, landProcedureReport: report
        };
        await saveCase(newCase);
        onCasesUpdated();
        setIsSaving(false);
        alert("Đã lưu!");
    };

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden relative">
            <div className={`${isLeftPanelCollapsed ? (isMobile ? 'hidden' : 'w-0 opacity-0 p-0 border-none') : (isMobile ? 'w-full absolute z-20 h-full' : 'w-2/5 p-6 border-r')} bg-white flex flex-col transition-all duration-300 shadow-xl lg:shadow-none`}>
                <div className="flex justify-between mb-4"><button onClick={onGoBack} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold"><BackIcon className="w-5 h-5"/> Quay lại</button><button onClick={() => setIsLeftPanelCollapsed(true)}><PanelCollapseIcon className="w-6 h-6 text-slate-400"/></button></div>
                <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                    <h2 className="text-xl font-bold text-teal-800">Đăng ký Biến động Đất đai</h2>
                    <div>
                        <label className="block text-sm font-bold mb-1">Loại thủ tục</label>
                        <select value={transactionType} onChange={e => setTransactionType(e.target.value)} className="w-full p-2 border rounded">
                            <option>Chuyển nhượng (Sang tên sổ đỏ)</option>
                            <option>Tặng cho quyền sử dụng đất</option>
                            <option>Thừa kế quyền sử dụng đất</option>
                            <option>Chuyển đổi mục đích sử dụng đất</option>
                            <option>Cấp đổi/Cấp lại Giấy chứng nhận</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Địa chỉ thửa đất (Tỉnh/Thành phố)</label>
                        <input type="text" value={landAddress} onChange={e => setLandAddress(e.target.value)} placeholder="VD: Quận Cầu Giấy, Hà Nội" className="w-full p-2 border rounded"/>
                        <p className="text-xs text-slate-500 mt-1">AI sẽ dùng thông tin này để tra cứu bảng giá đất và quy định địa phương.</p>
                    </div>
                    <FileUpload files={files} setFiles={setFiles} onPreview={onPreview}/>
                </div>
                <div className="pt-4 border-t flex gap-2 flex-col">
                    <button onClick={handleAnalyze} disabled={isLoading} className="w-full py-2 bg-teal-600 text-white font-bold rounded hover:bg-teal-700 disabled:bg-slate-300 flex justify-center">{isLoading ? <Loader/> : 'Phân tích Hồ sơ & Chi phí'}</button>
                    <button onClick={handleSave} disabled={isSaving} className="w-full py-2 bg-slate-600 text-white font-bold rounded hover:bg-slate-700 flex justify-center gap-2"><SaveCaseIcon className="w-4 h-4"/> Lưu Hồ sơ</button>
                </div>
            </div>

            <main className="flex-1 p-6 overflow-y-auto relative h-full bg-slate-50">
                {isLeftPanelCollapsed && <button onClick={() => setIsLeftPanelCollapsed(false)} className="absolute top-4 left-4 z-30 p-2 bg-white border rounded shadow"><PanelExpandIcon className="w-6 h-6"/></button>}
                
                {!report && !isLoading && <div className="flex h-full items-center justify-center text-slate-400">Nhập thông tin và bấm Phân tích để bắt đầu.</div>}
                {isLoading && !report && <div className="flex h-full items-center justify-center"><Loader/></div>}

                {report && (
                    <div className="space-y-6 pb-20 animate-fade-in">
                        {/* Header */}
                        <div className="bg-white p-4 rounded-lg border border-teal-200 shadow-sm">
                            <h2 className="text-xl font-bold text-teal-800 mb-2">{report.procedureType}</h2>
                            <div className="p-3 bg-teal-50 rounded text-sm text-teal-900">
                                <span className="font-bold">Quy định địa phương áp dụng:</span> {report.localRegulations}
                            </div>
                        </div>

                        {/* Steps & Docs */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white p-4 rounded-lg border shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-3">Trình tự thực hiện</h3>
                                <ul className="space-y-4">
                                    {report.stepByStepGuide.map((step, i) => (
                                        <li key={i} className="flex gap-3">
                                            <div className="flex-shrink-0 w-6 h-6 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold text-xs">{i+1}</div>
                                            <div>
                                                <p className="font-bold text-sm">{step.step}</p>
                                                <p className="text-sm text-slate-600">{step.description}</p>
                                                <p className="text-xs text-slate-500 mt-1">📍 {step.location} • 🕒 {step.estimatedTime}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-white p-4 rounded-lg border shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-3">Danh mục Giấy tờ (Checklist)</h3>
                                <ul className="space-y-2">
                                    {report.documentChecklist.map((doc, i) => (
                                        <li key={i} className={`p-2 border-l-4 text-sm rounded-r ${doc.status === 'missing' ? 'border-red-400 bg-red-50' : 'border-green-400 bg-green-50'}`}>
                                            <div className="flex justify-between">
                                                <span className="font-semibold">{doc.name}</span>
                                                <span className="text-xs font-bold uppercase">{doc.status === 'missing' ? 'Thiếu' : 'Có'}</span>
                                            </div>
                                            <p className="text-xs text-slate-600 mt-1">{doc.notes}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Financials & Tips */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                             <div className="bg-white p-4 rounded-lg border shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-3">Dự tính Chi phí (Thuế & Phí)</h3>
                                <div className="space-y-2">
                                    {report.financialEstimation.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center p-2 bg-slate-50 border rounded">
                                            <div>
                                                <p className="font-semibold text-sm">{item.item}</p>
                                                <p className="text-xs text-slate-500">{item.basis}</p>
                                            </div>
                                            <span className="font-bold text-teal-700">{item.amount}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-3">Lưu ý & Mẹo (Cáo già)</h3>
                                <div className="text-sm space-y-2">
                                    <CunningLawyerText text={report.legalRisksAndTips} />
                                </div>
                            </div>
                        </div>
                        
                        <SimpleDocGenerator docTypes={[{value: 'landRegistrationApplication', label: 'Đơn Đăng ký Biến động'}]} />
                        <SpecializedChat chatHistory={report.globalChatHistory || []} onSendMessage={handleChat} isLoading={isLoading} title="Hỏi đáp Thủ tục Đất đai" color="bg-teal-600"/>
                    </div>
                )}
            </main>
        </div>
    );
};

// --- Divorce Workflow ---
export const DivorceWorkflow: React.FC<{ onGoBack: () => void, activeCase: SavedCase | null, onCasesUpdated: () => void, onPreview: (file: UploadedFile) => void }> = ({ onGoBack, activeCase, onCasesUpdated, onPreview }) => {
    const [context, setContext] = useState('');
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [report, setReport] = useState<DivorceReport | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const isMobile = useIsMobile();

    useEffect(() => {
        if (activeCase?.workflowType === 'divorceConsultation') {
            setReport(activeCase.divorceReport || null);
            setContext(activeCase.caseContent || '');
            const loadedFiles = (activeCase.files || []).map(sf => ({ id: sf.name, file: base64ToFile(sf.content, sf.name, sf.type), preview: null, category: 'Uncategorized', status: 'completed' } as UploadedFile));
            setFiles(loadedFiles);
            if (activeCase.divorceReport) setIsLeftPanelCollapsed(true);
        }
    }, [activeCase]);

    const handleAnalyze = async () => {
        if (!context.trim()) return alert("Vui lòng nhập nội dung tình huống.");
        setIsLoading(true);
        try {
            const res = await analyzeDivorceCase(context, files);
            setReport(res);
            setIsLeftPanelCollapsed(true);
        } catch (e) { alert("Lỗi phân tích"); }
        finally { setIsLoading(false); }
    };

    const handleChat = async (msg: string, newFiles: File[]) => {
        if (!report) return;
        const uploadedNewFiles = newFiles.map(f => ({ id: f.name, file: f, preview: null, category: 'Uncategorized', status: 'pending' } as UploadedFile));
        const currentHistory = [...(report.globalChatHistory || []), { role: 'user', content: msg } as ChatMessage];
        setReport({ ...report, globalChatHistory: currentHistory });
        try {
            const { chatResponse, updatedReport } = await continueDivorceChat(report, currentHistory, msg, uploadedNewFiles);
            const aiMsg = { role: 'model', content: chatResponse } as ChatMessage;
            if (updatedReport) setReport({ ...updatedReport, globalChatHistory: [...currentHistory, aiMsg] });
            else setReport({ ...report, globalChatHistory: [...currentHistory, aiMsg] });
        } catch (e) { console.error(e); }
    };

    const handleSave = async () => {
        const name = prompt("Tên hồ sơ:", activeCase?.name || `Tư vấn Ly hôn - ${new Date().toLocaleDateString()}`);
        if (!name) return;
        setIsSaving(true);
        const serializableFiles = await Promise.all(files.map(async f => ({ name: f.file.name, type: f.file.type, content: await fileToBase64(f.file) })));
        const now = new Date().toISOString();
        const newCase: SavedCase = {
            id: activeCase?.id || now, name, workflowType: 'divorceConsultation',
            caseContent: context, clientRequest: '', query: '', files: serializableFiles,
            createdAt: activeCase?.createdAt || now, updatedAt: now, litigationType: 'civil', litigationStage: 'consulting',
            analysisReport: null, divorceReport: report
        };
        await saveCase(newCase);
        onCasesUpdated();
        setIsSaving(false);
        alert("Đã lưu!");
    };

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden relative">
            <div className={`${isLeftPanelCollapsed ? (isMobile ? 'hidden' : 'w-0 opacity-0 p-0 border-none') : (isMobile ? 'w-full absolute z-20 h-full' : 'w-2/5 p-6 border-r')} bg-white flex flex-col transition-all duration-300 shadow-xl lg:shadow-none`}>
                <div className="flex justify-between mb-4"><button onClick={onGoBack} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold"><BackIcon className="w-5 h-5"/> Quay lại</button><button onClick={() => setIsLeftPanelCollapsed(true)}><PanelCollapseIcon className="w-6 h-6 text-slate-400"/></button></div>
                <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                    <h2 className="text-xl font-bold text-rose-800">Tư vấn Ly hôn & Gia đình</h2>
                    <textarea value={context} onChange={e => setContext(e.target.value)} placeholder="Mô tả tình huống: Thời gian kết hôn, con cái (tuổi), tài sản chung/riêng, mâu thuẫn chính, mong muốn của khách hàng..." className="w-full h-48 p-3 border rounded bg-slate-50 text-sm"/>
                    <FileUpload files={files} setFiles={setFiles} onPreview={onPreview}/>
                </div>
                <div className="pt-4 border-t flex gap-2 flex-col">
                    <button onClick={handleAnalyze} disabled={isLoading} className="w-full py-2 bg-rose-600 text-white font-bold rounded hover:bg-rose-700 disabled:bg-slate-300 flex justify-center">{isLoading ? <Loader/> : 'Phân tích Chiến lược'}</button>
                    <button onClick={handleSave} disabled={isSaving} className="w-full py-2 bg-slate-600 text-white font-bold rounded hover:bg-slate-700 flex justify-center gap-2"><SaveCaseIcon className="w-4 h-4"/> Lưu Hồ sơ</button>
                </div>
            </div>

            <main className="flex-1 p-6 overflow-y-auto relative h-full bg-slate-50">
                {isLeftPanelCollapsed && <button onClick={() => setIsLeftPanelCollapsed(false)} className="absolute top-4 left-4 z-30 p-2 bg-white border rounded shadow"><PanelExpandIcon className="w-6 h-6"/></button>}
                
                {!report && !isLoading && <div className="flex h-full items-center justify-center text-slate-400">Nhập thông tin và bấm Phân tích để bắt đầu.</div>}
                {isLoading && !report && <div className="flex h-full items-center justify-center"><Loader/></div>}

                {report && (
                    <div className="space-y-6 pb-20 animate-fade-in">
                         <div className="bg-white p-4 rounded-lg border border-rose-200 shadow-sm">
                            <h2 className="text-xl font-bold text-rose-800 mb-2 flex items-center gap-2">
                                {report.divorceType === 'ThuanTinh' ? 'Ly hôn Thuận tình' : 'Ly hôn Đơn phương (Có tranh chấp)'}
                            </h2>
                            <p className="text-sm italic text-slate-600">{report.emotionalAndLegalAdvice}</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Custody */}
                            <div className="bg-white p-4 rounded-lg border shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-3 border-b pb-2">Quyền nuôi con (Custody)</h3>
                                <div className="space-y-3 text-sm">
                                    <p><span className="font-semibold">Chiến lược:</span> {report.custodyAnalysis.strategy}</p>
                                    <div>
                                        <span className="font-semibold">Chứng cứ cần thiết:</span>
                                        <ul className="list-disc list-inside pl-2 mt-1 text-slate-600">
                                            {report.custodyAnalysis.evidenceNeeded.map((ev, i) => <li key={i}>{ev}</li>)}
                                        </ul>
                                    </div>
                                    <div className="mt-2"><CunningLawyerText text={report.custodyAnalysis.cunningTips} /></div>
                                </div>
                            </div>
                            
                            {/* Assets */}
                             <div className="bg-white p-4 rounded-lg border shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-3 border-b pb-2">Phân chia Tài sản</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-slate-50 p-2 rounded">
                                            <span className="font-semibold block mb-1">Tài sản Chung</span>
                                            <ul className="list-disc list-inside text-xs">{report.assetDivision.commonAssets.map((a,i) => <li key={i}>{a}</li>)}</ul>
                                        </div>
                                        <div className="bg-slate-50 p-2 rounded">
                                            <span className="font-semibold block mb-1">Tài sản Riêng</span>
                                            <ul className="list-disc list-inside text-xs">{report.assetDivision.privateAssets.map((a,i) => <li key={i}>{a}</li>)}</ul>
                                        </div>
                                    </div>
                                    <p><span className="font-semibold">Chiến lược phân chia:</span> {report.assetDivision.divisionStrategy}</p>
                                    <div className="mt-2"><CunningLawyerText text={report.assetDivision.cunningTips} /></div>
                                </div>
                            </div>
                        </div>
                        
                         <div className="bg-white p-4 rounded-lg border shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-3">Lộ trình Tố tụng</h3>
                            <ol className="relative border-l border-slate-200 ml-3 space-y-4">
                                {report.procedureRoadmap.map((step, i) => (
                                    <li key={i} className="ml-6">
                                        <span className="absolute flex items-center justify-center w-6 h-6 bg-rose-100 rounded-full -left-3 ring-4 ring-white text-rose-800 font-bold text-xs">{i+1}</span>
                                        <h4 className="font-semibold text-slate-900">{step.step}</h4>
                                        <p className="text-sm text-slate-600">{step.description}</p>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        <SimpleDocGenerator 
                            docTypes={[
                                {value: 'divorcePetition', label: 'Đơn xin Ly hôn'}, 
                                {value: 'divorceAgreement', label: 'Thỏa thuận Ly hôn'}
                            ]} 
                        />
                        
                        <SpecializedChat chatHistory={report.globalChatHistory || []} onSendMessage={handleChat} isLoading={isLoading} title="Tư vấn Chiến lược Ly hôn" color="bg-rose-600"/>
                    </div>
                )}
            </main>
        </div>
    );
};
