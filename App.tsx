


import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FileUpload } from './components/FileUpload.tsx';
import { ReportDisplay } from './components/ReportDisplay.tsx';
import { Loader } from './components/Loader.tsx';
import { analyzeCaseFiles, generateContextualDocument, categorizeMultipleFiles, generateReportSummary, refineText, extractSummariesFromFiles, reanalyzeCaseWithCorrections, intelligentSearchQuery, continueLitigationChat } from './services/geminiService.ts';
import { db, getAllCasesSorted, saveCase, deleteCaseById, clearAndBulkAddCases } from './services/db.ts';
import type { AnalysisReport, UploadedFile, SavedCase, SerializableFile, LitigationStage, LitigationType, FileCategory, ApplicableLaw, LegalLoophole, ParagraphGenerationOptions, ChatMessage, DraftingMode } from './types.ts';
import { ConsultingWorkflow, BusinessFormationWorkflow } from './components/ConsultingWorkflow.tsx';
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
    
    const loadCases = useCallback(async () => {
        const cases = await getAllCasesSorted();
        setSavedCases(cases);
    }, []);

    useEffect(() => { loadCases(); }, [loadCases]);
    
    const handleNewCase = (workflowType: 'consulting' | 'litigation' | 'businessFormation') => {
      setActiveCase({
        id: `new_${Date.now()}`,
        name: '',
        workflowType,
        caseContent: '',
        clientRequest: '',
        query: '',
        files: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        litigationType: null,
        litigationStage: 'consulting',
        analysisReport: null,
        consultingReport: null,
        businessFormationReport: null,
        jurisdiction: '',
      });
    };
    
    const handleSelectCase = (caseData: SavedCase) => {
      // Logic for loading litigation case data into the main App state.
      // Other workflows handle their state internally from the `activeCase` prop.
      if (caseData.workflowType === 'litigation') {
        const loadedFiles = caseData.files.map(sf => ({
            id: `${sf.name}-${Math.random()}`,
            file: base64ToFile(sf.content, sf.name, sf.type),
            preview: null,
            category: 'Uncategorized' as FileCategory,
            status: 'completed' as const,
        }));
        setFiles(loadedFiles);
        setQuery(caseData.query);
        setReport(caseData.analysisReport);
        setLitigationType(caseData.litigationType || 'civil');
        setJurisdiction(caseData.jurisdiction || '');
      }
      setActiveCase(caseData);
    };

    const handleSaveCase = async () => {
      if (!activeCase) return;
      const defaultName = report?.editableCaseSummary?.substring(0, 50) || query || `Vụ việc ngày ${new Date().toLocaleDateString('vi-VN')}`;
      const newCaseName = window.prompt("Nhập tên để lưu vụ việc:", activeCase.name || defaultName);
      if (!newCaseName) return;
  
      setIsSaving(true);
      try {
        const serializableFiles = await Promise.all(
          files.map(async f => ({ name: f.file.name, type: f.file.type, content: await fileToBase64(f.file) }))
        );
        const now = new Date().toISOString();
        const isNewCase = activeCase.id.startsWith('new_');
        const caseToSave: SavedCase = {
            ...activeCase,
            id: isNewCase ? now : activeCase.id,
            createdAt: isNewCase ? now : activeCase.createdAt,
            updatedAt: now, name: newCaseName, workflowType: 'litigation', files: serializableFiles,
            query: query, analysisReport: report, litigationType: litigationType,
            litigationStage: report?.litigationStage || 'consulting',
            caseContent: caseSummary,
            clientRequest: clientRequestSummary,
            jurisdiction: jurisdiction
        };
        await saveCase(caseToSave);
        setActiveCase(caseToSave);
        await loadCases();
        alert(`Vụ việc "${newCaseName}" đã được lưu thành công!`);
      } catch (err) { alert("Đã xảy ra lỗi khi lưu.");
      } finally { setIsSaving(false); }
    };
  
    const handleDeleteCase = async (caseId: string, caseName: string) => {
      if (window.confirm(`Bạn có chắc muốn xóa vĩnh viễn vụ việc "${caseName}"?`)) {
        await deleteCaseById(caseId);
        await loadCases();
        if (activeCase?.id === caseId) {
            handleGoBackToSelection();
        }
      }
    };

    const handleGoBackToSelection = () => {
        setFiles([]);
        setReport(null);
        setQuery('');
        setCaseSummary('');
        setClientRequestSummary('');
        setError(null);
        setActiveCase(null);
        setJurisdiction('');
    };

    const handleAnalyzeClick = async () => {
        if (files.length === 0 && !caseSummary && !clientRequestSummary) {
          setError("Vui lòng tải tệp hoặc nhập nội dung để phân tích.");
          return;
        }
        setIsLoading(true); setError(null);
        try {
            const effectiveQuery = query.trim() || "Phân tích toàn diện hồ sơ.";
            if (!caseSummary && !clientRequestSummary && files.length > 0) {
              const summaries = await extractSummariesFromFiles(files, clientPosition !== 'not_applicable' ? clientPosition : undefined);
              setCaseSummary(summaries.caseSummary);
              setClientRequestSummary(summaries.clientRequestSummary);
            }
            const analysisResult = await analyzeCaseFiles(
                files, 
                effectiveQuery, 
                undefined, 
                clientPosition !== 'not_applicable' ? clientPosition : undefined,
                jurisdiction
            );
            setReport(analysisResult);
            setMainActionType('update');
        } catch (err) {
            setError(err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định.");
        } finally { setIsLoading(false); }
    };

    const handleReanalyzeClick = async (reportToReanalyze: AnalysisReport) => {
        setIsReanalyzing(true); setError(null);
        try {
            const newReport = await reanalyzeCaseWithCorrections(reportToReanalyze, files, clientPosition !== 'not_applicable' ? clientPosition : undefined);
            setReport(newReport);
        } catch (err) { setError(err instanceof Error ? err.message : "Lỗi khi phân tích lại.");
        } finally { setIsReanalyzing(false); }
    };

    const handleSearch = async (newQuery: string) => {
        if (!report) return;
        const currentHistory = report.intelligentSearchChat || [];
        const newUserMessage: ChatMessage = { role: 'user', content: newQuery };
        const updatedHistory = [...currentHistory, newUserMessage];
        setReport({ ...report, intelligentSearchChat: updatedHistory });
        setIsLoading(true); setError(null);
        try {
            const aiResponse = await intelligentSearchQuery(report, files, currentHistory, newQuery);
            const aiMessage: ChatMessage = { role: 'model', content: aiResponse };
            const finalHistory = [...updatedHistory, aiMessage];
            setReport(prev => prev ? { ...prev, intelligentSearchChat: finalHistory } : null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Lỗi khi tìm kiếm.");
        } finally { setIsLoading(false); }
    };

    const handleUpdateReport = (updatedReport: AnalysisReport) => {
        setReport(updatedReport);
    };
    
    const handleBackup = async () => {
        try {
            const allCases = await getAllCasesSorted();
            if (allCases.length === 0) {
                alert("Không có dữ liệu để sao lưu.");
                return;
            }
            const jsonData = JSON.stringify(allCases, null, 2);
            const blob = new Blob([jsonData], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
            link.download = `legal-assistant-backup-${timestamp}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Lỗi khi sao lưu:", error);
            alert(`Đã xảy ra lỗi khi sao lưu dữ liệu: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    };
    
    const handleRestore = () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.onchange = async (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (!file) return;
    
            if (!window.confirm("Khôi phục dữ liệu sẽ XÓA TẤT CẢ dữ liệu hiện tại và thay thế bằng dữ liệu từ tệp sao lưu. Bạn có chắc chắn muốn tiếp tục?")) {
                return;
            }
    
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const content = e.target?.result;
                    if (typeof content !== 'string') throw new Error("Không thể đọc tệp.");
                    
                    const restoredCases = JSON.parse(content);
                    
                    if (!Array.isArray(restoredCases) || (restoredCases.length > 0 && typeof restoredCases[0].id === 'undefined')) {
                         throw new Error("Tệp sao lưu không hợp lệ hoặc bị hỏng.");
                    }
                    
                    await clearAndBulkAddCases(restoredCases);
                    await loadCases(); // Reload cases into state
                    alert("Dữ liệu đã được khôi phục thành công!");
                } catch (error) {
                    console.error("Lỗi khi khôi phục:", error);
                    alert(`Đã xảy ra lỗi khi khôi phục dữ liệu: ${error instanceof Error ? error.message : "Tệp không hợp lệ."}`);
                }
            };
            reader.readAsText(file);
        };
        fileInput.click();
    };


    const CaseSelectionScreen: React.FC = () => (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center p-4 sm:p-6 md:p-8">
          <header className="flex items-center gap-4 mb-8">
              <AppLogo className="w-12 h-12"/>
              <div>
                  <h1 className="text-3xl font-bold text-slate-800">Trợ lý Luật sư AI</h1>
                  <p className="text-slate-500">Phân tích hồ sơ, xây dựng chiến lược, soạn thảo văn bản và quản lý vụ việc.</p>
              </div>
          </header>
          <div className="w-full max-w-5xl bg-white p-6 rounded-xl shadow-lg border border-slate-200/80">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Bắt đầu một Nghiệp vụ Mới</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button onClick={() => handleNewCase('litigation')} className="group flex flex-col items-center justify-center p-6 bg-blue-50 hover:bg-blue-100 border-2 border-dashed border-blue-200 hover:border-blue-400 rounded-lg transition-all">
                      <StyledAnalysisIcon className="w-10 h-10 text-blue-500 mb-3 transition-transform group-hover:scale-110"/>
                      <span className="font-semibold text-blue-800">Vụ việc Tranh tụng</span>
                      <span className="text-xs text-blue-600 text-center mt-1">Phân tích hồ sơ, xây dựng chiến lược tố tụng.</span>
                  </button>
                  <button onClick={() => handleNewCase('consulting')} className="group flex flex-col items-center justify-center p-6 bg-green-50 hover:bg-green-100 border-2 border-dashed border-green-200 hover:border-green-400 rounded-lg transition-all">
                      <ChatBubbleLeftIcon className="w-10 h-10 text-green-500 mb-3 transition-transform group-hover:scale-110"/>
                      <span className="font-semibold text-green-800">Nhiệm vụ Tư vấn</span>
                      <span className="text-xs text-green-600 text-center mt-1">Tư vấn nhanh, đề xuất lộ trình cho khách hàng.</span>
                  </button>
                  <button onClick={() => handleNewCase('businessFormation')} className="group flex flex-col items-center justify-center p-6 bg-purple-50 hover:bg-purple-100 border-2 border-dashed border-purple-200 hover:border-purple-400 rounded-lg transition-all">
                      <BuildingOfficeIcon className="w-10 h-10 text-purple-500 mb-3 transition-transform group-hover:scale-110"/>
                      <span className="font-semibold text-purple-800">Thành lập Doanh nghiệp</span>
                      <span className="text-xs text-purple-600 text-center mt-1">Tư vấn mô hình, thuế và chuẩn bị hồ sơ.</span>
                  </button>
              </div>
              <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-slate-800">Hoặc tiếp tục một Nghiệp vụ đã lưu</h2>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-2 -mr-2">
                      {savedCases.length > 0 ? (
                          savedCases.map(c => (
                              <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100/50 hover:shadow-sm transition-all">
                                  <div onClick={() => handleSelectCase(c)} className="cursor-pointer flex-grow min-w-0">
                                      <p className="font-semibold text-slate-800 truncate">{c.name}</p>
                                      <p className="text-xs text-slate-500">
                                        {c.workflowType === 'litigation' ? 'Vụ việc Tranh tụng' : c.workflowType === 'consulting' ? 'Nhiệm vụ Tư vấn' : 'Thành lập Doanh nghiệp'} - Cập nhật: {new Date(c.updatedAt).toLocaleString('vi-VN')}
                                      </p>
                                  </div>
                                  <button onClick={() => handleDeleteCase(c.id, c.name)} className="p-1.5 rounded-full hover:bg-red-100 ml-4"><TrashIcon className="w-5 h-5 text-slate-500 hover:text-red-500"/></button>
                              </div>
                          ))
                      ) : (
                          <p className="text-center text-slate-500 py-4">Chưa có nghiệp vụ nào được lưu.</p>
                      )}
                  </div>
              </div>
          </div>
      </div>
    );

    if (!activeCase) return <CaseSelectionScreen />;

    if (activeCase.workflowType === 'consulting') {
        return <ConsultingWorkflow onPreview={setPreviewFile} onGoBack={handleGoBackToSelection} activeCase={activeCase} onCasesUpdated={loadCases} />;
    }
    
    if (activeCase.workflowType === 'businessFormation') {
        return <BusinessFormationWorkflow onPreview={setPreviewFile} onGoBack={handleGoBackToSelection} activeCase={activeCase} onCasesUpdated={loadCases} />;
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
             {/* Sidebar */}
            <aside className="group transition-all duration-300 ease-in-out bg-gray-900 text-gray-400 p-4 flex flex-col h-full w-20 hover:w-64 z-30">
                <nav className="flex-grow">
                    <ul>
                        {navItems.map(item => {
                            const Icon = item.icon;
                            const isActive = view === item.id;
                            return (
                                <li key={item.label} className="mb-2">
                                    <a href="#" className={`flex items-center gap-4 p-3 rounded-lg transition-colors justify-center group-hover:justify-start ${isActive ? 'bg-gray-800 text-white font-semibold' : 'hover:bg-gray-800 hover:text-white'}`} onClick={e => { e.preventDefault(); setView(item.id); }} title={item.label}>
                                        <Icon className="w-5 h-5 flex-shrink-0" />
                                        <span className="transition-opacity duration-200 whitespace-nowrap opacity-0 group-hover:opacity-100">{item.label}</span>
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
                 <div className="mt-auto pt-4 border-t border-gray-700 space-y-2">
                    <button onClick={handleBackup} title="Sao lưu" className="flex items-center gap-4 p-3 rounded-lg w-full transition-colors hover:bg-gray-800 hover:text-white justify-center group-hover:justify-start">
                        <DownloadIcon className="w-5 h-5 flex-shrink-0" />
                        <span className="transition-opacity duration-200 whitespace-nowrap opacity-0 group-hover:opacity-100">Sao lưu</span>
                    </button>
                    <button onClick={handleRestore} title="Khôi phục" className="flex items-center gap-4 p-3 rounded-lg w-full transition-colors hover:bg-gray-800 hover:text-white justify-center group-hover:justify-start">
                        <UploadIcon className="w-5 h-5 flex-shrink-0" />
                        <span className="transition-opacity duration-200 whitespace-nowrap opacity-0 group-hover:opacity-100">Khôi phục</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-y-auto">
                <div className="grid grid-cols-12 gap-6 h-full">
                    {/* Left Panel */}
                    {!isLeftPanelCollapsed && (
                         <div className="col-span-12 lg:col-span-4 h-full flex flex-col space-y-4 relative">
                            <button
                                onClick={() => setIsLeftPanelCollapsed(true)}
                                className="absolute top-1/2 -translate-y-1/2 -right-3 z-20 bg-white border border-slate-300 rounded-full p-1.5 shadow-md hover:bg-slate-100"
                                title="Thu gọn"
                            >
                                <PanelCollapseIcon className="w-5 h-5 text-slate-600" />
                            </button>
                            <div className="flex justify-between items-center flex-shrink-0">
                                <button onClick={handleGoBackToSelection} className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 font-semibold"><BackIcon className="w-5 h-5" /> Chọn Vụ việc khác</button>
                                <button onClick={handleSaveCase} disabled={isSaving} className="flex items-center gap-2 px-3 py-1.5 text-xs bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 disabled:bg-slate-300"><SaveCaseIcon className="w-4 h-4"/> Lưu</button>
                            </div>
                            <div className="p-4 bg-white border rounded-lg flex-grow overflow-y-auto">
                                <div className="space-y-4">
                                    <FileUpload files={files} setFiles={setFiles} onPreview={setPreviewFile} />
                                    <div>
                                        <label htmlFor="mainQuery" className="block text-sm font-semibold text-slate-700 mb-1.5">Mục tiêu / Yêu cầu Phân tích</label>
                                        <textarea id="mainQuery" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="VD: Phân tích hồ sơ để chuẩn bị cho phiên tòa phúc thẩm, tập trung vào các điểm yếu của bản án sơ thẩm." className="w-full h-24 p-2.5 bg-slate-50 border border-slate-300 rounded-md text-sm"/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tòa án Thụ lý / Giải quyết</label>
                                        <input 
                                            list="courts-list" 
                                            value={jurisdiction} 
                                            onChange={(e) => setJurisdiction(e.target.value)} 
                                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-md text-sm" 
                                            placeholder="Chọn hoặc nhập tên Tòa án..." 
                                        />
                                        <datalist id="courts-list">
                                            {REGIONAL_COURTS.map(court => <option key={court} value={court} />)}
                                        </datalist>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Vị trí Thân chủ (trong ảnh chụp màn hình)</label>
                                        <div className="flex gap-2 rounded-lg bg-slate-100 p-1">
                                        {([['left', 'Bên Trái'], ['not_applicable', 'Không áp dụng'], ['right', 'Bên Phải']] as const).map(([pos, label]) => (
                                            <button key={pos} onClick={() => setClientPosition(pos)} className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${clientPosition === pos ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-white/70'}`}>{label}</button>
                                        ))}
                                        </div>
                                    </div>
                                    <button onClick={handleAnalyzeClick} disabled={isLoading} className="w-full py-2.5 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-slate-300 flex items-center justify-center gap-2">
                                        {isLoading ? <><Loader /> <span>Đang phân tích...</span></> : (mainActionType === 'analyze' ? 'Phân tích Vụ việc' : 'Cập nhật Phân tích')}
                                    </button>
                                    {error && <div className="text-red-600 text-sm p-3 bg-red-50 rounded-lg">{error}</div>}
                                </div>
                            </div>
                        </div>
                    )}


                    {/* Right Panel */}
                    <div className={`h-full overflow-y-auto relative transition-all duration-300 ${isLeftPanelCollapsed ? 'col-span-12' : 'col-span-12 lg:col-span-8'}`}>
                        {isLeftPanelCollapsed && (
                            <button
                                onClick={() => setIsLeftPanelCollapsed(false)}
                                className="absolute top-1/2 -translate-y-1/2 left-1 z-20 bg-white border border-slate-300 rounded-full p-1.5 shadow-md hover:bg-slate-100"
                                title="Mở bảng điều khiển"
                            >
                                <PanelExpandIcon className="w-5 h-5 text-slate-600" />
                            </button>
                        )}
                         <div className="bg-white border rounded-lg p-6 h-full">
                            {isLoading && !report && <div className="flex flex-col items-center justify-center h-full"><div className="loading-bar-container"><div className="loading-bars"><div className="loading-bar"></div><div className="loading-bar"></div><div className="loading-bar"></div></div><p className="mt-4 text-slate-600 font-medium">AI đang phân tích, vui lòng đợi trong giây lát...</p></div></div>}
                            {!isLoading && !report && <div className="flex flex-col items-center justify-center h-full text-center text-slate-400"><StyledAnalysisIcon className="w-16 h-16 mb-4 text-slate-300" /><p className="font-medium text-slate-600">Kết quả phân tích sẽ được hiển thị tại đây.</p></div>}
                            
                            {report && view === 'caseAnalysis' && <ReportDisplay report={report} onClearSummary={() => setReport(r => r ? {...r, quickSummary: ''} : null)} litigationType={litigationType} onUpdateUserLaws={(laws) => setReport(r => r ? {...r, userAddedLaws: laws} : null)} onUpdateReport={handleUpdateReport} caseSummary={caseSummary} clientRequestSummary={clientRequestSummary} onReanalyze={handleReanalyzeClick} isReanalyzing={isReanalyzing} files={files} onPreview={setPreviewFile} />}
                            {view === 'documentGenerator' && <DocumentGenerator />}
                            {view === 'quickDraft' && <QuickDraftGenerator />}
                            {view === 'argumentMap' && <ArgumentMapView report={report} onUpdateReport={handleUpdateReport} />}
                            {view === 'intelligentSearch' && <IntelligentSearch report={report} onSearch={handleSearch} isLoading={isLoading} error={error} />}
                            {(view === 'dashboard' || view === 'fileManagement' || view === 'calendar' || view === 'client') && <div className="flex flex-col items-center justify-center h-full text-center text-slate-500"><h2 className="text-2xl font-bold text-slate-700">Chức năng đang phát triển</h2><p className="mt-2">Chức năng này sẽ sớm được cập nhật.</p></div>}
                         </div>
                    </div>
                </div>
            </main>

            {previewFile && <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />}
            {report && <GlobalLitigationChat report={report} onUpdateReport={handleUpdateReport} files={files} />}
        </div>
    );
}
