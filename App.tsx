
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FileUpload } from './components/FileUpload.tsx';
import { ReportDisplay } from './components/ReportDisplay.tsx';
import { Loader } from './components/Loader.tsx';
import { analyzeCaseFiles, categorizeMultipleFiles, extractSummariesFromFiles, reanalyzeCaseWithCorrections, intelligentSearchQuery, continueLitigationChat } from './services/geminiService.ts';
import { db, getAllCasesSorted, saveCase, deleteCaseById, clearAndBulkAddCases } from './services/db.ts';
import type { AnalysisReport, UploadedFile, SavedCase, SerializableFile, LitigationStage, LitigationType, FileCategory, ApplicableLaw, LegalLoophole, ParagraphGenerationOptions, ChatMessage, DraftingMode } from './types.ts';
import { ConsultingWorkflow, BusinessFormationWorkflow } from './components/ConsultingWorkflow.tsx';
import { LandProcedureWorkflow, DivorceWorkflow } from './components/SpecializedWorkflows.tsx';
import { PreviewModal } from './components/PreviewModal.tsx';
import { ExportIcon } from './components/icons/ExportIcon.tsx';
import { TrashIcon } from './components/icons/TrashIcon.tsx';
import { SaveCaseIcon } from './components/icons/SaveCaseIcon.tsx';
import { FolderIcon } from './components/icons/FolderIcon.tsx';
import { PlusIcon } from './components/icons/PlusIcon.tsx';
import { CustomizeReportModal, ReportSection } from './components/CustomizeReportModal.tsx';
import { BackIcon } from './components/icons/BackIcon.tsx';
import { litigationStagesByType, getStageLabel, litigationStageSuggestions, DRAFTING_MODE_LABELS, REGIONAL_COURTS } from './constants.ts';
import { AppLogo } from './components/icons/AppLogo.tsx';
import { DownloadIcon } from './components/icons/DownloadIcon.tsx';
import { UploadIcon } from './components/icons/UploadIcon.tsx';
import { DocumentGenerator } from './components/DocumentGenerator.tsx';
import { QuickDraftGenerator } from './components/QuickDraftGenerator.tsx';
import { ProcessingProgress } from './components/ProcessingProgress.tsx';
import { ArgumentMapView } from './components/ArgumentMapView.tsx';
import { IntelligentSearch } from './components/IntelligentSearch.tsx';
import { ChatBubbleLeftIcon } from './components/icons/ChatBubbleLeftIcon.tsx';
import { UserGroupIcon } from './components/icons/UserGroupIcon.tsx';
import { DocumentIcon } from './components/icons/DocumentIcon.tsx';
import { ChatIcon } from './components/icons/ChatIcon.tsx';
import { SendIcon } from './components/icons/SendIcon.tsx';


// Declare global variables from CDN scripts to satisfy TypeScript
declare var docx: any;
declare var XLSX: any;
declare var jspdf: any;
declare var html2canvas: any;

type MainActionType = 'analyze' | 'update' | 'none';
type View = 'caseAnalysis' | 'intelligentSearch' | 'argumentMap' | 'documentGenerator' | 'quickDraft' | 'dashboard' | 'fileManagement' | 'calendar' | 'client';
type ClientPosition = 'left' | 'right' | 'not_applicable';
type AppWorkflowType = 'litigation' | 'consulting' | 'businessFormation' | 'landProcedure' | 'divorceConsultation';

// --- Local Icons & Components ---
const PanelCollapseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
);
const PanelExpandIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
  </svg>
);
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
const PaperClipIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01" />
    </svg>
);
const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);
const StyledAnalysisIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47M6.75 6.75h.75v.75h-.75v-.75Zm-1.5 3h.75v.75h-.75v-.75Zm1.5 3h.75v.75h-.75v-.75Zm1.5 3h.75v.75h-.75v-.75Zm-3-6h.75v.75h-.75v-.75Zm0 3h.75v.75h-.75v-.75Zm9.75-3h.75v.75h-.75v-.75Zm-1.5 3h.75v.75h-.75v-.75Zm1.5 3h.75v.75h-.75v-.75Zm1.5 3h.75v.75h-.75v-.75Zm-3-6h.75v.75h-.75v-.75Zm0 3h.75v.75h-.75v-.75Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5v10.5h-16.5z" />
  </svg>
);
const StyledQuestionIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
  </svg>
);
const StyledArgumentMapIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
  </svg>
);
const StyledDocumentIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
);
const StyledMagicIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.475 2.118A2.25 2.25 0 0 1 .879 16.5a2.25 2.25 0 0 1 2.25-2.25h1.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 0-.75.75v1.5a.75.75 0 0 1-.75.75h-2.25m10.5-11.25h3.375c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125h-3.375a.75.75 0 0 1-.75-.75v-1.5a.75.75 0 0 1 .75-.75Z" />
    </svg>
);

const BuildingOfficeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3.75h1.5m-1.5 3.75h1.5m3-7.5h1.5m-1.5 3.75h1.5m-1.5 3.75h1.5M9 21v-2.25a2.25 2.25 0 0 1 2.25-2.25h1.5A2.25 2.25 0 0 1 15 18.75V21" />
  </svg>
);

const MapIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
  </svg>
);

const HeartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
  </svg>
);


const navItems = [
    { id: 'caseAnalysis', icon: StyledAnalysisIcon, label: 'Phân tích Vụ việc' },
    { id: 'intelligentSearch', icon: StyledQuestionIcon, label: 'Hỏi đáp Thông minh' },
    { id: 'argumentMap', icon: StyledArgumentMapIcon, label: 'Bản đồ Lập luận' },
    { id: 'documentGenerator', icon: StyledDocumentIcon, label: 'Soạn thảo Văn bản' },
    { id: 'quickDraft', icon: StyledMagicIcon, label: 'Soạn thảo Nhanh' },
] as const;

// --- Helper Functions & Types ---

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


// --- Global Chat for Litigation Workflow ---
const GlobalLitigationChat: React.FC<{
    report: AnalysisReport;
    onUpdateReport: (updatedReport: AnalysisReport) => void;
    files: UploadedFile[];
}> = ({ report, onUpdateReport, files }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const isMobile = useIsMobile();
    const chatEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) { setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100); }
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
            const { chatResponse, updatedReport } = await continueLitigationChat(report, currentHistory, userInput.trim(), attachedUploadedFiles);
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
            setUserInput(''); setAttachedFiles([]); setIsLoading(false);
        }
    };
    
    if (!isOpen) {
        return (
            <button onClick={() => setIsOpen(true)} className="fixed bottom-8 right-8 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-transform hover:scale-110 z-40" aria-label="Mở cửa sổ trò chuyện"><ChatIcon className="w-8 h-8" /></button>
        );
    }

    const mobileClasses = "inset-0 w-full h-full rounded-none";
    const desktopClasses = "bottom-8 right-8 w-[400px] h-[550px] max-h-[80vh] rounded-xl shadow-2xl border border-slate-200";


    return (
        <div className={`fixed bg-white flex flex-col z-50 animate-fade-in ${isMobile ? mobileClasses : desktopClasses}`}>
            <div className="flex justify-between items-center p-4 border-b border-slate-200 flex-shrink-0">
                <h3 className="font-bold text-slate-800">Trò chuyện về Vụ việc</h3>
                <div className="flex items-center gap-1">
                    {!isMobile && (
                        <button onClick={() => setIsOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100" aria-label="Thu nhỏ"><MinimizeIcon className="w-5 h-5"/></button>
                    )}
                    <button onClick={() => setIsOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100" aria-label="Đóng"><XMarkIcon className="w-6 h-6"/></button>
                </div>
            </div>
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {(report.globalChatHistory || []).map((msg, index) => (
                    <div key={index} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}><div className={`max-w-[85%] p-2.5 rounded-lg text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}><p className="whitespace-pre-wrap">{msg.content}</p></div></div>
                ))}
                {isLoading && <div className="flex gap-2.5"><div className="p-2.5 rounded-lg bg-slate-100"><Loader /></div></div>}
                <div ref={chatEndRef} />
            </div>
            <footer className="p-4 border-t border-slate-200 flex-shrink-0">
                {attachedFiles.length > 0 && (<div className="mb-2 space-y-1">{attachedFiles.map((file, index) => (<div key={index} className="flex items-center justify-between text-xs bg-slate-100 p-1.5 rounded"><span className="truncate">{file.name}</span><button onClick={() => setAttachedFiles(p => p.filter((_, i) => i !== index))} className="p-0.5 rounded-full hover:bg-slate-200"><XMarkIcon className="w-3 h-3 text-slate-500"/></button></div>))}</div>)}
                <form onSubmit={handleSendMessage} className="flex items-start gap-2">
                    <textarea value={userInput} onChange={e => setUserInput(e.target.value)} placeholder="Nhập tin nhắn..." className="flex-grow p-2 border border-slate-300 rounded-md text-sm resize-none" rows={2} disabled={isLoading} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }} />
                    <div className="flex flex-col gap-2"><label className="p-2 bg-slate-100 text-slate-600 font-semibold rounded-md hover:bg-slate-200 cursor-pointer"><PaperClipIcon className="w-5 h-5"/><input type="file" className="hidden" multiple ref={fileInputRef} onChange={(e) => { if (e.target.files) setAttachedFiles(p => [...p, ...Array.from(e.target.files!)]); if (fileInputRef.current) fileInputRef.current.value = ""; }} accept=".pdf,.doc,.docx,.jpg,.jpeg" disabled={isLoading}/></label><button type="submit" disabled={isLoading || (!userInput.trim() && attachedFiles.length === 0)} className="p-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-slate-300"><SendIcon className="w-5 h-5"/></button></div>
                </form>
            </footer>
        </div>
    );
};

export default function App() {
    const [activeCase, setActiveCase] = useState<SavedCase | null>(null);
    const [savedCases, setSavedCases] = useState<SavedCase[]>([]);
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [report, setReport] = useState<AnalysisReport | null>(null);
    const [caseSummary, setCaseSummary] = useState('');
    const [clientRequestSummary, setClientRequestSummary] = useState('');
    const [query, setQuery] = useState('');
    const [jurisdiction, setJurisdiction] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isReanalyzing, setIsReanalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
    const [litigationType, setLitigationType] = useState<LitigationType>('civil');
    const [view, setView] = useState<View>('caseAnalysis');
    const [mainActionType, setMainActionType] = useState<MainActionType>('analyze');
    const [isSaving, setIsSaving] = useState(false);
    const [clientPosition, setClientPosition] = useState<ClientPosition>('not_applicable');
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [libsReady, setLibsReady] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPreprocessingFinished, setIsPreprocessingFinished] = useState(false);
    const [showWorkflowSelection, setShowWorkflowSelection] = useState(true);
    const [currentWorkflow, setCurrentWorkflow] = useState<AppWorkflowType>('litigation');

    const isMobile = useIsMobile();
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const loadCases = async () => {
            try {
                const cases = await getAllCasesSorted();
                setSavedCases(cases);
            } catch (error) {
                console.error("Failed to load cases:", error);
            }
        };
        loadCases();

        const checkLibs = () => {
            if (typeof docx !== 'undefined' && typeof XLSX !== 'undefined' && typeof jspdf !== 'undefined' && typeof html2canvas !== 'undefined') {
                setLibsReady(true);
            } else {
                setTimeout(checkLibs, 500);
            }
        };
        checkLibs();
    }, []);

    // Auto-collapse left panel on mobile when report is present
    useEffect(() => {
      if (isMobile && report) {
        setIsLeftPanelCollapsed(true);
      }
    }, [isMobile, report]);


    const handleNewCase = (type: AppWorkflowType) => {
        const newCase: SavedCase = {
            id: `new_${Date.now()}`,
            name: `Vụ việc mới ${new Date().toLocaleString('vi-VN')}`,
            workflowType: type,
            caseContent: '', clientRequest: '', query: '', files: [],
            createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
            litigationType: type === 'litigation' ? 'civil' : null,
            litigationStage: type === 'litigation' ? 'first_instance' : 'consulting',
            analysisReport: null,
        };
        setActiveCase(newCase);
        setCurrentWorkflow(type);
        setShowWorkflowSelection(false);
        setFiles([]);
        setReport(null);
        setCaseSummary('');
        setClientRequestSummary('');
        setQuery('');
        setError(null);
        setMainActionType('analyze');
        setIsLeftPanelCollapsed(false); // Ensure panel is open for new case
    };

    const handleSelectCase = (savedCase: SavedCase) => {
        setActiveCase(savedCase);
        setCurrentWorkflow(savedCase.workflowType || 'litigation');
        setShowWorkflowSelection(false);
        const loadedFiles: UploadedFile[] = (savedCase.files || []).map(sf => ({
            id: `${sf.name}-${Math.random()}`,
            file: base64ToFile(sf.content, sf.name, sf.type),
            preview: null, category: 'Uncategorized', status: 'completed' // Assume loaded files are processed
        }));
        setFiles(loadedFiles);
        setReport(savedCase.analysisReport);
        setQuery(savedCase.query);
        setJurisdiction(savedCase.jurisdiction || '');
        if (savedCase.litigationType) setLitigationType(savedCase.litigationType);
        setError(null);
        setMainActionType(savedCase.analysisReport ? 'update' : 'analyze');
        if (savedCase.analysisReport) {
             setIsLeftPanelCollapsed(true); // Auto collapse if report exists
        } else {
             setIsLeftPanelCollapsed(false);
        }
    };

    const handleDeleteCase = async (e: React.MouseEvent, caseId: string) => {
        e.stopPropagation();
        if (window.confirm("Bạn có chắc chắn muốn xóa vụ việc này?")) {
            await deleteCaseById(caseId);
            const updatedCases = await getAllCasesSorted();
            setSavedCases(updatedCases);
            if (activeCase?.id === caseId) {
                setActiveCase(null);
                setShowWorkflowSelection(true);
            }
        }
    };

    const handleBackupData = async () => {
        try {
            const allCases = await getAllCasesSorted();
            const blob = new Blob([JSON.stringify(allCases, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `backup_tro_ly_luat_su_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Backup failed:", error);
            alert("Sao lưu thất bại.");
        }
    };

    const handleRestoreData = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!window.confirm("CẢNH BÁO: Hành động này sẽ GHI ĐÈ toàn bộ dữ liệu hiện tại bằng dữ liệu từ file sao lưu. Bạn có chắc chắn muốn tiếp tục?")) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                await clearAndBulkAddCases(data);
                const updatedCases = await getAllCasesSorted();
                setSavedCases(updatedCases);
                alert("Phục hồi dữ liệu thành công!");
                window.location.reload(); 
            } catch (error) {
                console.error("Restore failed:", error);
                alert("Phục hồi thất bại. File không hợp lệ.");
            }
        };
        reader.readAsText(file);
    };

    // ... (Keep processFiles, performAnalysis, handleAnalyzeClick, handleUpdateClick as is)
    const processFiles = useCallback(async (filesToProcess: UploadedFile[]) => {
        const filesOnly = filesToProcess.map(f => f.file);
        
        // Run categorization and summarization in parallel
        const [categories, summaries] = await Promise.all([
            categorizeMultipleFiles(filesOnly),
            extractSummariesFromFiles(filesToProcess, clientPosition)
        ]);

        // Update categories
        setFiles(prevFiles => prevFiles.map(f => ({
            ...f,
            status: 'completed',
            category: categories[f.file.name] || 'Uncategorized'
        })));
        
        // Update summaries only if not already set manually
        if (!caseSummary) setCaseSummary(summaries.caseSummary);
        if (!clientRequestSummary) setClientRequestSummary(summaries.clientRequestSummary);

    }, [caseSummary, clientRequestSummary, clientPosition]);

    const performAnalysis = useCallback(async (filesToAnalyze: UploadedFile[]) => {
        setIsLoading(true);
        try {
            const result = await analyzeCaseFiles(filesToAnalyze, query, undefined, clientPosition, jurisdiction);
            setReport(result);
            setIsLeftPanelCollapsed(true); // Auto-collapse on successful analysis
            setMainActionType('update');
            if (result.litigationStage) {
                 // Check if the stage exists for the current type, if not default to first
                 const stageExists = litigationStagesByType[litigationType].some(s => s.id === result.litigationStage);
                 if (!stageExists) {
                     // Keep current manual selection or default? AI's output might be raw string.
                     // For now, we trust the AI but if it's not in the list, UI might show raw ID.
                 }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
            setIsLoading(false);
        }
    }, [query, clientPosition, jurisdiction, litigationType]);

    const handleAnalyzeClick = useCallback(async () => {
        if (files.length === 0 && !query.trim()) {
            setError("Vui lòng tải lên hồ sơ hoặc nhập yêu cầu.");
            return;
        }
        setError(null);
        setReport(null); // Clear previous report

        setIsProcessing(true);
        setIsPreprocessingFinished(false);
        const filesToProcess = files.map(f => ({ ...f, status: 'processing' as const }));
        setFiles(filesToProcess);

        try {
             await processFiles(filesToProcess);
        } catch (e) {
             const failedFiles = files.map(f => ({ ...f, status: 'failed' as const, error: e instanceof Error ? e.message : 'Processing failed' }));
             setFiles(failedFiles);
        } finally {
            setIsPreprocessingFinished(true);
        }

    }, [files, query, processFiles]);

    const handleUpdateClick = async () => {
        if (!report) return;
        setIsLoading(true);
        setError(null);
        try {
            // Pass the current report AND the current selected stage (which might have been manually changed)
            const result = await analyzeCaseFiles(files, query, { report, stage: report.litigationStage }, clientPosition, jurisdiction);
            setReport(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred during update");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReanalyze = async (reportToReanalyze: AnalysisReport) => {
        setIsReanalyzing(true);
        try {
             const result = await reanalyzeCaseWithCorrections(reportToReanalyze, files, clientPosition);
             setReport(result);
        } catch (err) {
             alert("Phân tích lại thất bại: " + (err instanceof Error ? err.message : "Lỗi không xác định"));
        } finally {
            setIsReanalyzing(false);
        }
    };

    const handleSaveCase = async () => {
        if (!activeCase) return;
        setIsSaving(true);
        try {
            const serializableFiles: SerializableFile[] = await Promise.all(
                files.map(async f => ({
                    name: f.file.name,
                    type: f.file.type,
                    content: await fileToBase64(f.file)
                }))
            );

            const now = new Date().toISOString();
            const isNewCase = activeCase.id.startsWith('new_');
            
            const caseToSave: SavedCase = {
                ...activeCase,
                id: isNewCase ? now : activeCase.id, // Use timestamp as ID for new cases
                createdAt: isNewCase ? now : activeCase.createdAt,
                updatedAt: now,
                caseContent: caseSummary, // Using summary as content for preview
                clientRequest: clientRequestSummary, // Using summary
                query,
                files: serializableFiles,
                litigationType,
                litigationStage: report?.litigationStage || 'first_instance',
                analysisReport: report,
                jurisdiction
            };

            await saveCase(caseToSave);
            const updatedCases = await getAllCasesSorted();
            setSavedCases(updatedCases);
            setActiveCase(caseToSave); // Update active case with new ID/Data
            alert("Đã lưu vụ việc thành công!");
        } catch (err) {
            console.error("Error saving case:", err);
            alert("Lỗi khi lưu vụ việc.");
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleExportReport = async (format: 'docx' | 'xlsx' | 'pdf', customizedReport: AnalysisReport, orderedSections: ReportSection[]) => {
        if (!libsReady) {
            alert("Thư viện xuất file chưa sẵn sàng. Vui lòng thử lại sau vài giây.");
            return;
        }
        setIsExporting(true);
        
        try {
            const fileName = `Bao_cao_Phan_tich_${new Date().toISOString().split('T')[0]}`;
            
            if (format === 'pdf') {
                const { jsPDF } = (window as any).jspdf;
                const doc = new jsPDF();
                // Basic PDF generation (placeholder)
                doc.setFontSize(18);
                doc.text("BÁO CÁO PHÂN TÍCH VỤ VIỆC", 105, 20, { align: 'center' });
                doc.setFontSize(12);
                let y = 40;
                
                if (customizedReport.customNotes) {
                     doc.text("GHI CHÚ:", 20, y); y+=10;
                     const splitNotes = doc.splitTextToSize(customizedReport.customNotes, 170);
                     doc.text(splitNotes, 20, y);
                     y += splitNotes.length * 7 + 10;
                }

                orderedSections.forEach(section => {
                    if (section.id !== 'customNotesSection' && customizedReport[section.id as keyof AnalysisReport]) {
                        doc.setFont("helvetica", "bold");
                        doc.text(section.title.toUpperCase(), 20, y);
                        y += 10;
                        doc.setFont("helvetica", "normal");
                        const content = JSON.stringify(customizedReport[section.id as keyof AnalysisReport]); // Simplification
                        const splitContent = doc.splitTextToSize(content.substring(0, 500) + "...", 170);
                        doc.text(splitContent, 20, y);
                        y += splitContent.length * 7 + 10;
                        if (y > 280) { doc.addPage(); y = 20; }
                    }
                });
                
                doc.save(`${fileName}.pdf`);
            } else {
                alert("Tính năng xuất file này đang được hoàn thiện.");
            }
        } catch (e) {
            console.error(e);
            alert("Lỗi khi xuất báo cáo.");
        } finally {
            setIsExporting(false);
            setIsCustomizeModalOpen(false);
        }
    };
    
    const handleIntelligentSearch = async (searchQuery: string) => {
        if (!report) return;
        
        const currentHistory = report.intelligentSearchChat || [];
        const newUserMessage: ChatMessage = { role: 'user', content: searchQuery };
        const updatedHistory = [...currentHistory, newUserMessage];
        
        const updatedReport = { ...report, intelligentSearchChat: updatedHistory };
        setReport(updatedReport);
        
        try {
            const answer = await intelligentSearchQuery(report, files, updatedHistory, searchQuery);
             const aiMessage: ChatMessage = { role: 'model', content: answer };
             const finalReport = { ...updatedReport, intelligentSearchChat: [...updatedHistory, aiMessage] };
             setReport(finalReport);
        } catch (err) {
            const errorMessage: ChatMessage = { role: 'model', content: "Lỗi: Không thể trả lời câu hỏi lúc này." };
             const finalReport = { ...updatedReport, intelligentSearchChat: [...updatedHistory, errorMessage] };
             setReport(finalReport);
        }
    };

    if (showWorkflowSelection) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
                <header className="bg-white shadow-sm border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg shadow-md"><AppLogo className="w-8 h-8 text-white" /></div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Trợ lý Luật sư AI</h1>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 shadow-sm transition-all">
                            <UploadIcon className="w-5 h-5 text-slate-500" /> Phục hồi Dữ liệu
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleRestoreData} className="hidden" accept=".json" />
                        <button onClick={handleBackupData} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-900 shadow-md transition-all">
                            <DownloadIcon className="w-5 h-5" /> Sao lưu Dữ liệu
                        </button>
                    </div>
                </header>
                <main className="flex-grow p-8 max-w-7xl mx-auto w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
                        {/* Litigation Card */}
                        <button onClick={() => handleNewCase('litigation')} className="group relative flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-blue-400 transition-all duration-300 text-center">
                             <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <StyledAnalysisIcon className="w-8 h-8 text-blue-600" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">Tranh tụng</h2>
                            <p className="text-sm text-slate-500 line-clamp-3">Phân tích hồ sơ, xây dựng chiến lược, tìm kiếm chứng cứ cho các vụ án.</p>
                        </button>
                        {/* Consulting Card */}
                        <button onClick={() => handleNewCase('consulting')} className="group relative flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-green-400 transition-all duration-300 text-center">
                             <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <ChatBubbleLeftIcon className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-green-600 transition-colors">Tư vấn Nhanh</h2>
                            <p className="text-sm text-slate-500 line-clamp-3">Tư vấn pháp lý, rà soát hợp đồng, giải đáp thắc mắc thường xuyên.</p>
                        </button>
                        {/* Business Formation Card */}
                         <button onClick={() => handleNewCase('businessFormation')} className="group relative flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-purple-400 transition-all duration-300 text-center">
                             <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <BuildingOfficeIcon className="w-8 h-8 text-purple-600" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-purple-600 transition-colors">Thành lập DN</h2>
                            <p className="text-sm text-slate-500 line-clamp-3">Tư vấn mô hình, thuế, và soạn hồ sơ đăng ký kinh doanh.</p>
                        </button>
                        {/* Land Procedure Card */}
                         <button onClick={() => handleNewCase('landProcedure')} className="group relative flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-teal-400 transition-all duration-300 text-center">
                             <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <MapIcon className="w-8 h-8 text-teal-600" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-teal-600 transition-colors">Đăng ký Đất đai</h2>
                            <p className="text-sm text-slate-500 line-clamp-3">Thủ tục sang tên sổ đỏ, biến động đất đai, tính thuế phí.</p>
                        </button>
                        {/* Divorce Consultation Card */}
                         <button onClick={() => handleNewCase('divorceConsultation')} className="group relative flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-rose-400 transition-all duration-300 text-center">
                             <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <HeartIcon className="w-8 h-8 text-rose-600" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-rose-600 transition-colors">Tư vấn Ly hôn</h2>
                            <p className="text-sm text-slate-500 line-clamp-3">Chiến lược quyền nuôi con, phân chia tài sản, thủ tục ly hôn.</p>
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><FolderIcon className="w-5 h-5 text-slate-500"/> Vụ việc đã lưu</h3>
                            <span className="text-sm font-semibold text-slate-500">{savedCases.length} vụ việc</span>
                        </div>
                        {savedCases.length === 0 ? (
                             <div className="p-12 text-center text-slate-400">Chưa có vụ việc nào được lưu.</div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {savedCases.map(c => (
                                    <div key={c.id} onClick={() => handleSelectCase(c)} className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer group transition-colors duration-200">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg ${
                                                c.workflowType === 'consulting' ? 'bg-green-100 text-green-600' : 
                                                (c.workflowType === 'businessFormation' ? 'bg-purple-100 text-purple-600' : 
                                                (c.workflowType === 'landProcedure' ? 'bg-teal-100 text-teal-600' :
                                                (c.workflowType === 'divorceConsultation' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600')))
                                            }`}>
                                                {c.workflowType === 'consulting' && <ChatBubbleLeftIcon className="w-6 h-6"/>}
                                                {c.workflowType === 'businessFormation' && <BuildingOfficeIcon className="w-6 h-6"/>}
                                                {c.workflowType === 'landProcedure' && <MapIcon className="w-6 h-6"/>}
                                                {c.workflowType === 'divorceConsultation' && <HeartIcon className="w-6 h-6"/>}
                                                {(!c.workflowType || c.workflowType === 'litigation') && <StyledAnalysisIcon className="w-6 h-6"/>}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{c.name}</h4>
                                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                                    <span>Cập nhật: {new Date(c.updatedAt).toLocaleDateString('vi-VN')}</span>
                                                    <span>•</span>
                                                    <span className="capitalize">
                                                        {c.workflowType === 'businessFormation' ? 'Thành lập DN' : 
                                                        (c.workflowType === 'consulting' ? 'Tư vấn' : 
                                                        (c.workflowType === 'landProcedure' ? 'Đất đai' :
                                                        (c.workflowType === 'divorceConsultation' ? 'Ly hôn' : 'Tranh tụng')))}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                        <button onClick={(e) => handleDeleteCase(e, c.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        );
    }

    if (currentWorkflow === 'consulting') {
        return <ConsultingWorkflow onPreview={setPreviewFile} onGoBack={() => setShowWorkflowSelection(true)} activeCase={activeCase} onCasesUpdated={async () => setSavedCases(await getAllCasesSorted())} />;
    }
    
    if (currentWorkflow === 'businessFormation') {
        return <BusinessFormationWorkflow onPreview={setPreviewFile} onGoBack={() => setShowWorkflowSelection(true)} activeCase={activeCase} onCasesUpdated={async () => setSavedCases(await getAllCasesSorted())} />;
    }

    if (currentWorkflow === 'landProcedure') {
        return <LandProcedureWorkflow onPreview={setPreviewFile} onGoBack={() => setShowWorkflowSelection(true)} activeCase={activeCase} onCasesUpdated={async () => setSavedCases(await getAllCasesSorted())} />;
    }

    if (currentWorkflow === 'divorceConsultation') {
        return <DivorceWorkflow onPreview={setPreviewFile} onGoBack={() => setShowWorkflowSelection(true)} activeCase={activeCase} onCasesUpdated={async () => setSavedCases(await getAllCasesSorted())} />;
    }

    // Litigation Workflow (Default)
    return (
        <div className="flex flex-col h-screen bg-slate-100 overflow-hidden font-sans text-slate-900">
            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden relative">
                {/* Left Input Panel */}
                <div 
                    className={`${isLeftPanelCollapsed ? (isMobile ? 'hidden' : 'w-0 opacity-0 p-0 border-none') : (isMobile ? 'w-full absolute z-20 h-full bg-white' : 'w-2/5 opacity-100 p-6 border-r border-slate-200')} bg-white flex flex-col transition-all duration-300 ease-in-out shadow-xl lg:shadow-none flex-shrink-0`}
                >
                    <div className="flex justify-between items-center mb-4 flex-shrink-0">
                        <button onClick={() => setShowWorkflowSelection(true)} className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"><BackIcon className="w-5 h-5"/> Tranh tụng</button>
                        <div className="flex gap-2">
                            <button onClick={() => setIsLeftPanelCollapsed(true)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="Thu gọn">
                                <PanelCollapseIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto pr-2 space-y-5">
                        <div className="space-y-3">
                             <div className="flex items-center justify-between">
                                <label className="block text-sm font-bold text-slate-700">Hồ sơ & Tài liệu</label>
                            </div>
                            <FileUpload files={files} setFiles={setFiles} onPreview={setPreviewFile} />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Thông tin cơ bản</label>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Loại vụ việc</label>
                                    <select value={litigationType} onChange={(e) => setLitigationType(e.target.value as LitigationType)} className="w-full p-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                                        <option value="civil">Dân sự</option>
                                        <option value="criminal">Hình sự</option>
                                        <option value="administrative">Hành chính</option>
                                    </select>
                                </div>
                                 <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Khách hàng là...</label>
                                    <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-300">
                                        <button 
                                            onClick={() => setClientPosition('left')}
                                            className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${clientPosition === 'left' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                                            title="Tin nhắn của khách hàng ở bên trái"
                                        >
                                            Trái
                                        </button>
                                        <button 
                                            onClick={() => setClientPosition('not_applicable')}
                                             className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${clientPosition === 'not_applicable' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                                            title="Không áp dụng (Văn bản thường)"
                                        >
                                            N/A
                                        </button>
                                        <button 
                                            onClick={() => setClientPosition('right')}
                                             className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${clientPosition === 'right' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                                            title="Tin nhắn của khách hàng ở bên phải"
                                        >
                                            Phải
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Tòa án thụ lý (Khu vực)</label>
                                <input
                                    type="text"
                                    value={jurisdiction}
                                    onChange={(e) => setJurisdiction(e.target.value)}
                                    placeholder="VD: Tòa án nhân dân khu vực Hoàn Kiếm..."
                                    className="w-full p-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    list="regional-courts-list-main"
                                />
                                <datalist id="regional-courts-list-main">
                                    {REGIONAL_COURTS.map(court => <option key={court} value={court} />)}
                                </datalist>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Yêu cầu phân tích</label>
                                <textarea value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nhập yêu cầu cụ thể cho AI..." className="w-full h-24 p-3 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 mt-auto flex flex-col gap-3 flex-shrink-0">
                        {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}
                        
                        {isProcessing && (
                           <ProcessingProgress 
                                files={files} 
                                onContinue={() => { setIsProcessing(false); performAnalysis(files.filter(f => f.status === 'completed')); }} 
                                onCancel={() => setIsProcessing(false)} 
                                isFinished={isPreprocessingFinished}
                                hasTextContent={!!query}
                           />
                        )}

                        <div className="flex gap-3">
                             {report && (
                                <button onClick={handleUpdateClick} disabled={isLoading || isProcessing} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50 flex justify-center items-center gap-2">
                                    {isLoading ? <Loader /> : 'Cập nhật'}
                                </button>
                            )}
                            <button onClick={handleAnalyzeClick} disabled={isLoading || isProcessing} className="flex-[2] py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg hover:shadow-blue-200/50 transition-all disabled:bg-slate-300 disabled:shadow-none flex justify-center items-center gap-2">
                                {isLoading ? <><Loader /> <span>Đang phân tích...</span></> : <><StyledAnalysisIcon className="w-5 h-5"/> <span>{report ? 'Phân tích Lại' : 'Phân tích Vụ việc'}</span></>}
                            </button>
                        </div>
                         <button onClick={handleSaveCase} disabled={isSaving} className="w-full py-2 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-900 transition-all disabled:bg-slate-400 flex justify-center items-center gap-2">
                            {isSaving ? <Loader /> : <SaveCaseIcon className="w-5 h-5"/>} <span>Lưu Vụ việc</span>
                        </button>
                    </div>
                </div>

                {/* Right Content Panel */}
                <div className="flex-1 flex flex-col h-full min-w-0 bg-slate-50 relative">
                    {/* Collapsed Expand Button */}
                    {isLeftPanelCollapsed && (
                         <button 
                            onClick={() => setIsLeftPanelCollapsed(false)} 
                            className="absolute top-4 left-4 z-30 p-2 bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg shadow-md transition-all"
                            title="Mở rộng bảng điều khiển"
                        >
                            <PanelExpandIcon className="w-6 h-6" />
                        </button>
                    )}

                    {/* Navigation Tabs */}
                     <div className={`bg-white border-b border-slate-200 px-4 flex items-center gap-1 overflow-x-auto no-scrollbar flex-shrink-0 ${isLeftPanelCollapsed ? 'pl-16' : ''} transition-all duration-300`}>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setView(item.id as View)}
                                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${view === item.id ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                                >
                                    <Icon className={`w-5 h-5 ${view === item.id ? 'text-blue-600' : 'text-slate-400'}`} />
                                    {item.label}
                                </button>
                            )
                        })}
                    </div>

                    {/* View Content */}
                    <div className="flex-grow overflow-hidden p-6 relative">
                        <div className="h-full w-full overflow-y-auto rounded-2xl bg-white shadow-sm border border-slate-200 p-6">
                            {view === 'caseAnalysis' && (
                                report ? (
                                    <>
                                        <div className="flex justify-end mb-4">
                                             <button onClick={() => setIsCustomizeModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors">
                                                <ExportIcon className="w-4 h-4" /> Xuất Báo cáo
                                            </button>
                                        </div>
                                        <ReportDisplay 
                                            report={report} 
                                            files={files}
                                            onPreview={setPreviewFile}
                                            onClearSummary={() => { setReport({ ...report, quickSummary: undefined }); setMainActionType('update'); }}
                                            litigationType={litigationType}
                                            onUpdateUserLaws={(laws) => { setReport({ ...report, userAddedLaws: laws }); setMainActionType('update'); }}
                                            onUpdateReport={(updatedReport) => { setReport(updatedReport); setMainActionType('update'); }}
                                            caseSummary={caseSummary}
                                            clientRequestSummary={clientRequestSummary}
                                            onReanalyze={handleReanalyze}
                                            isReanalyzing={isReanalyzing}
                                        />
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                        {isLoading ? (
                                            <div className="text-center">
                                                 <div className="loading-bar-container mb-4">
                                                    <div className="loading-bars">
                                                        <div className="loading-bar"></div>
                                                        <div className="loading-bar"></div>
                                                        <div className="loading-bar"></div>
                                                    </div>
                                                </div>
                                                <p className="font-medium text-slate-600">AI đang phân tích hồ sơ...</p>
                                                <p className="text-sm text-slate-400 mt-2">Quá trình này có thể mất vài phút tùy thuộc vào độ lớn của hồ sơ.</p>
                                            </div>
                                        ) : (
                                            <>
                                                <StyledAnalysisIcon className="w-16 h-16 mb-4 opacity-20" />
                                                <p>Vui lòng tải lên hồ sơ và nhấn "Phân tích" để bắt đầu.</p>
                                            </>
                                        )}
                                    </div>
                                )
                            )}
                            {view === 'intelligentSearch' && (
                                <IntelligentSearch report={report} onSearch={(q) => handleIntelligentSearch(q)} isLoading={isLoading} error={error} />
                            )}
                            {view === 'argumentMap' && (
                                <ArgumentMapView report={report} onUpdateReport={(updatedReport) => { setReport(updatedReport); setMainActionType('update'); }} />
                            )}
                            {view === 'documentGenerator' && <DocumentGenerator />}
                            {view === 'quickDraft' && <QuickDraftGenerator />}
                        </div>
                    </div>
                </div>
            </div>

            {/* Global Modals & Overlays */}
            <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
            {report && <GlobalLitigationChat report={report} onUpdateReport={setReport} files={files} />}
            <CustomizeReportModal 
                isOpen={isCustomizeModalOpen} 
                onClose={() => setIsCustomizeModalOpen(false)} 
                onExport={handleExportReport} 
                baseReport={report || {} as AnalysisReport}
                isExporting={isExporting}
                libsReady={libsReady}
            />
        </div>
    );
}