import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FileUpload } from './components/FileUpload.tsx';
import { ReportDisplay } from './components/ReportDisplay.tsx';
import { Loader } from './components/Loader.tsx';
import { analyzeCaseFiles, generateContextualDocument, categorizeMultipleFiles, generateReportSummary, refineText, extractSummariesFromFiles } from './services/geminiService.ts';
import { db, getAllCasesSorted, saveCase, deleteCaseById, clearAndBulkAddCases } from './services/db.ts';
import type { AnalysisReport, UploadedFile, SavedCase, SerializableFile, LitigationStage, LitigationType, FileCategory, ApplicableLaw, LegalLoophole, ParagraphGenerationOptions } from './types.ts';
import { ConsultingWorkflow } from './components/ConsultingWorkflow.tsx';
import { AnalysisIcon } from './components/icons/AnalysisIcon.tsx';
import { PreviewModal } from './components/PreviewModal.tsx';
import { MagicIcon } from './components/icons/MagicIcon.tsx';
import { ExportIcon } from './components/icons/ExportIcon.tsx';
import { TrashIcon } from './components/icons/TrashIcon.tsx';
import { SaveCaseIcon } from './components/icons/SaveCaseIcon.tsx';
import { FolderIcon } from './components/icons/FolderIcon.tsx';
import { PlusIcon } from './components/icons/PlusIcon.tsx';
import { CustomizeReportModal, ReportSection } from './components/CustomizeReportModal.tsx';
import { BackIcon } from './components/icons/BackIcon.tsx';
import { litigationStagesByType, getStageLabel, litigationStageSuggestions } from './constants.ts';
import { AppLogo } from './components/icons/AppLogo.tsx';
import { PanelCollapseIcon } from './components/icons/PanelCollapseIcon.tsx';
import { PanelExpandIcon } from './components/icons/PanelExpandIcon.tsx';
import { DownloadIcon } from './components/icons/DownloadIcon.tsx';
import { UploadIcon } from './components/icons/UploadIcon.tsx';
import { DocumentGenerator } from './components/DocumentGenerator.tsx';
import { QuickDraftGenerator } from './components/QuickDraftGenerator.tsx';
import { DocumentIcon } from './components/icons/DocumentIcon.tsx';
import { ProcessingProgress } from './components/ProcessingProgress.tsx';


// Declare global variables from CDN scripts to satisfy TypeScript
declare var docx: any;
declare var XLSX: any;
declare var jspdf: any;
declare var html2canvas: any;

type MainActionType = 'analyze' | 'update' | 'none';
type View = 'caseInfo' | 'dashboard' | 'fileManagement' | 'calendar' | 'caseAnalysis' | 'client' | 'documentGenerator' | 'quickDraft';


interface MainAction {
    text: string;
    disabled: boolean;
    action: MainActionType;
    loadingText: string;
}

// --- New Icon Components for Sidebar ---
const HomeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955a1.5 1.5 0 0 1 2.122 0l8.954 8.955M3 10.5v.75A2.25 2.25 0 0 0 5.25 13.5h13.5A2.25 2.25 0 0 0 21 11.25v-.75M4.5 13.5V21A2.25 2.25 0 0 0 6.75 23.25h10.5A2.25 2.25 0 0 0 19.5 21V13.5" />
  </svg>
);
const DashboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
  </svg>
);
const FileManagementIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75h16.5m-16.5 0A2.25 2.25 0 0 1 5.25 7.5h13.5a2.25 2.25 0 0 1 2.25 2.25m-16.5 0v6.75a2.25 2.25 0 0 0 2.25 2.25h12a2.25 2.25 0 0 0 2.25-2.25v-6.75m-16.5 0H3.75" />
  </svg>
);
const CalendarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18M12 12.75h.008v.008H12v-.008Zm0 3h.008v.008H12v-.008Zm-3-3h.008v.008H9v-.008Zm0 3h.008v.008H9v-.008Zm-3-3h.008v.008H6v-.008Zm0 3h.008v.008H6v-.008Zm9-3h.008v.008H15v-.008Zm0 3h.008v.008H15v-.008Zm3-3h.008v.008H18v-.008Zm0 3h.008v.008H18v-.008Z" />
  </svg>
);
const ClientIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.962A3.75 3.75 0 1 0 9.75 6.25a3.75 3.75 0 0 0-3.75 3.75M10.5 13.5a7.5 7.5 0 0 0-7.5 7.5v.75c0 .414.336.75.75.75h15a.75.75 0 0 0 .75-.75v-.75a7.5 7.5 0 0 0-7.5-7.5h-1.5Z" />
  </svg>
);


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
  
const navItems = [
    { id: 'caseInfo', icon: HomeIcon, label: 'Thông tin vụ việc' },
    { id: 'dashboard', icon: DashboardIcon, label: 'Bảng điều khiển' },
    { id: 'fileManagement', icon: FileManagementIcon, label: 'Quản lý tài liệu' },
    { id: 'calendar', icon: CalendarIcon, label: 'Lịch họp & Deadline' },
    { id: 'caseAnalysis', icon: AnalysisIcon, label: 'Phân tích Vụ việc' },
    { id: 'documentGenerator', icon: DocumentIcon, label: 'Soạn thảo Văn bản' },
    { id: 'quickDraft', icon: MagicIcon, label: 'Soạn thảo Nhanh' },
    { id: 'client', icon: ClientIcon, label: 'Khách hàng' }
] as const;


// --- UI Components ---
const Sidebar: React.FC<{ 
    activeView: View; 
    onNavigate: (view: View) => void; 
    isExpanded: boolean; 
    onBackup: () => void;
    onRestore: () => void;
    isActionInProgress: boolean;
}> = ({ activeView, onNavigate, isExpanded, onBackup, onRestore, isActionInProgress }) => {
    
    const actionButtonClasses = `w-full flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors text-[var(--sidebar-text)] hover:bg-[var(--sidebar-active-bg)] hover:text-[var(--sidebar-text-hover)] disabled:opacity-50 disabled:cursor-not-allowed ${!isExpanded ? 'justify-center' : ''}`;

    return (
        <aside className={`transition-all duration-300 ease-in-out bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] p-4 flex flex-col rounded-l-xl h-full overflow-hidden ${isExpanded ? 'w-64' : 'w-20'}`}>
            <nav className="flex-grow">
                <ul>
                    {navItems.map(item => {
                        const Icon = item.icon;
                        const isActive = activeView === item.id;
                        const classes = `flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors ${
                            isActive 
                                ? 'bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)] font-semibold'
                                : 'hover:bg-[var(--sidebar-active-bg)] hover:text-[var(--sidebar-text-hover)]'
                        } ${!isExpanded ? 'justify-center' : ''}`;
                        return (
                            <li key={item.label} className="mb-2">
                                <a href="#" className={classes} onClick={e => { e.preventDefault(); onNavigate(item.id); }} title={isExpanded ? '' : item.label}>
                                    <Icon className="w-5 h-5 flex-shrink-0" />
                                    <span className={`transition-opacity duration-200 whitespace-nowrap ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>{item.label}</span>
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </nav>
            <div className="flex-shrink-0 mt-auto pt-4 border-t border-gray-700/50">
                <ul className="space-y-2">
                     <li>
                        <button onClick={onBackup} disabled={isActionInProgress} className={actionButtonClasses} title={isExpanded ? '' : 'Sao lưu Dữ liệu'}>
                            <DownloadIcon className="w-5 h-5 flex-shrink-0" />
                            <span className={`transition-opacity duration-200 whitespace-nowrap ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>Sao lưu Dữ liệu</span>
                        </button>
                    </li>
                    <li>
                        <button onClick={onRestore} disabled={isActionInProgress} className={actionButtonClasses} title={isExpanded ? '' : 'Khôi phục Dữ liệu'}>
                            <UploadIcon className="w-5 h-5 flex-shrink-0" />
                            <span className={`transition-opacity duration-200 whitespace-nowrap ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>Khôi phục Dữ liệu</span>
                        </button>
                    </li>
                </ul>
            </div>
        </aside>
    );
}

const Alert: React.FC<{ message: string; type: 'error' | 'warning' | 'info' }> = ({ message, type }) => {
  const baseClasses = "p-4 text-sm rounded-lg animate-fade-in";
  const typeClasses = {
    error: "bg-red-50 text-red-800",
    warning: "bg-amber-50 text-amber-800",
    info: "bg-blue-50 text-blue-800",
  };
  const messageParts = message.split(/:(.*)/s);
  const hasTitle = messageParts.length > 1;

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`} role="alert">
      {hasTitle ? (
        <>
          <span className="font-bold">{messageParts[0]}:</span>
          <span className="ml-1">{messageParts[1]}</span>
        </>
      ) : (
        message
      )}
    </div>
  );
};

const PlaceholderView: React.FC<{ viewName: string }> = ({ viewName }) => (
    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 bg-slate-50 rounded-lg border">
        <h2 className="text-2xl font-bold text-slate-700">Chức năng: {viewName}</h2>
        <p className="mt-2">Chức năng này đang được phát triển và sẽ sớm được cập nhật.</p>
    </div>
);


const App: React.FC = () => {
  // --- Core State ---
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [query, setQuery] = useState<string>('');
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [originalReport, setOriginalReport] = useState<AnalysisReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // --- Case Management State ---
  const [savedCases, setSavedCases] = useState<SavedCase[]>([]);
  const [activeCase, setActiveCase] = useState<SavedCase | null>(null);
  const [isCaseListOpen, setIsCaseListOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isWorkflowSelectorOpen, setIsWorkflowSelectorOpen] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  
  // --- Litigation Workflow State ---
  const [currentLitigationType, setCurrentLitigationType] = useState<LitigationType>('civil');
  const [currentLitigationStage, setCurrentLitigationStage] = useState<LitigationStage>('consulting');
  const [mainAction, setMainAction] = useState<MainAction>({ text: 'Phân tích Vụ việc', disabled: true, action: 'analyze', loadingText: 'Đang phân tích...' });
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  
  // --- Contextual Drafting State ---
  const [draftRequest, setDraftRequest] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [draftOptions, setDraftOptions] = useState<{
    detail: ParagraphGenerationOptions['detail'];
  }>({
    detail: 'detailed',
  });
  const [isDrafting, setIsDrafting] = useState(false);
  const [isRefining, setIsRefining] = useState<'concise' | 'detailed' | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);

  // --- UI State ---
  const [activeView, setActiveView] = useState<View>('caseAnalysis');
  const [previewingFile, setPreviewingFile] = useState<UploadedFile | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [libsReady, setLibsReady] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isInputPanelCollapsed, setIsInputPanelCollapsed] = useState(false);
  
  // --- Processing State ---
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPreprocessingFinished, setIsPreprocessingFinished] = useState(false);
  const [caseContentForDisplay, setCaseContentForDisplay] = useState('');
  const [clientRequestForDisplay, setClientRequestForDisplay] = useState('');


  const resetAnalysisState = useCallback(() => {
    setFiles([]);
    setQuery('');
    setReport(null);
    setOriginalReport(null);
    setError(null);
    setSummaryError(null);
    setDraftRequest('');
    setDraftContent('');
    setDraftError(null);
    setDraftOptions({ detail: 'detailed' });
    setIsLoading(false);
    setIsProcessing(false);
    setIsPreprocessingFinished(false);
    setCaseContentForDisplay('');
    setClientRequestForDisplay('');

    setActiveView('caseAnalysis');
    const defaultLitigationType: LitigationType = 'civil';
    const defaultStage = litigationStagesByType[defaultLitigationType]?.[0]?.value || 'consulting';
    setCurrentLitigationType(defaultLitigationType);
    setCurrentLitigationStage(defaultStage);
  }, []);


  const handleGoBackToSelection = useCallback(() => {
    setActiveCase(null);
    setIsWorkflowSelectorOpen(false);
  }, []);

  const loadData = useCallback(async () => {
      try {
          const casesFromDb = await getAllCasesSorted();
          setSavedCases(casesFromDb);
      } catch (e) {
          console.error("Failed to load cases:", e);
      }
  }, []);

  // --- Effects ---
  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const checkLibs = () => {
      if (typeof docx !== 'undefined' && typeof XLSX !== 'undefined' && typeof jspdf !== 'undefined' && typeof html2canvas !== 'undefined') {
        setLibsReady(true);
        return true;
      }
      return false;
    };
    if (checkLibs()) return;
    const interval = setInterval(() => { if (checkLibs()) clearInterval(interval); }, 500);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    const isReadyForAnalysis = query.trim().length > 0 && files.length > 0;
    const stageLabel = getStageLabel(currentLitigationType, currentLitigationStage);

    if (!report) {
        setMainAction({ text: 'Bắt đầu Phân tích', disabled: !isReadyForAnalysis || isLoading, action: 'analyze', loadingText: 'Đang xử lý...' });
    } else {
        const isUpdatableStage = currentLitigationStage !== 'consulting' && currentLitigationStage !== 'closed';
        if (isUpdatableStage) {
            setMainAction({ text: `Cập nhật cho GĐ: ${stageLabel}`, disabled: isLoading, action: 'update', loadingText: 'Đang cập nhật...' });
        } else {
            setMainAction({ text: 'Đã phân tích', disabled: true, action: 'none', loadingText: '' });
        }
    }
  }, [report, currentLitigationStage, currentLitigationType, files, query, isLoading]);
  
  const performMainAnalysis = useCallback(async (filesToAnalyze: UploadedFile[]) => {
    setIsLoading(true);
    setReport(null);
    setOriginalReport(null);
    setError(null);

    try {
        const analysisResult = await analyzeCaseFiles(filesToAnalyze, query);
        analysisResult.userAddedLaws = analysisResult.userAddedLaws || [];
        setReport(analysisResult);
        setOriginalReport(analysisResult);
        
        // After analysis, clear the pre-check summaries
        setCaseContentForDisplay('');
        setClientRequestForDisplay('');

        const currentStageOptions = litigationStagesByType[currentLitigationType] || [];
        if (analysisResult.litigationStage && currentStageOptions.some(opt => opt.value === analysisResult.litigationStage)) {
            setCurrentLitigationStage(analysisResult.litigationStage);
        } else if (currentLitigationStage === 'consulting') {
            const nextStage = litigationStagesByType[currentLitigationType]?.[1]?.value || currentLitigationStage;
            setCurrentLitigationStage(nextStage);
        }

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }, [query, currentLitigationType, currentLitigationStage]);


  const handleStartFileProcessing = useCallback(async () => {
    setError(null);
    setSummaryError(null);
    setReport(null);
    setOriginalReport(null);
    setDraftContent('');

    if (files.length > 0) {
        setIsPreprocessingFinished(false);
        setIsProcessing(true);
        setFiles(prev => prev.map(f => ({ ...f, status: 'processing' as const, error: undefined })));

        try {
            const fileObjects = files.map(f => f.file);
            const categoryMap = await categorizeMultipleFiles(fileObjects);
            const categorizedFiles = files.map(f => ({
                ...f,
                status: 'completed' as const,
                category: categoryMap[f.file.name] || 'Uncategorized'
            }));
            setFiles(categorizedFiles);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Lỗi không xác định';
            setFiles(prev => prev.map(f => ({ ...f, status: 'failed', error: message })));
            setError(`Lỗi khi phân loại tệp: ${message}`);
        } finally {
            setIsPreprocessingFinished(true);
        }
    } else {
        await performMainAnalysis([]);
    }
  }, [files, performMainAnalysis]);
  
  const handleContinueAnalysis = useCallback(async () => {
    const successfulFiles = files.filter(f => f.status === 'completed');
    setIsProcessing(false);
    await performMainAnalysis(successfulFiles);
  }, [files, performMainAnalysis]);

  const handleCancelProcessing = () => {
    setIsProcessing(false);
    setIsPreprocessingFinished(false);
    setFiles(prev => prev.map(f => ({ ...f, status: 'pending', error: undefined })));
  };


  const handleExtractAndDisplaySummaries = useCallback(async () => {
    if (files.length === 0) {
        setSummaryError("Vui lòng tải lên ít nhất một tệp để tóm tắt.");
        return;
    }

    setIsSummarizing(true);
    setSummaryError(null);
    setCaseContentForDisplay('');
    setClientRequestForDisplay('');
    setReport(null);
    setOriginalReport(null);

    try {
        // Step 1: Categorize files first to provide context
        setFiles(prev => prev.map(f => ({ ...f, status: 'processing' as const, error: undefined })));
        const fileObjects = files.map(f => f.file);
        const categoryMap = await categorizeMultipleFiles(fileObjects);
        const categorizedFiles = files.map(f => ({
            ...f,
            status: 'completed' as const,
            category: categoryMap[f.file.name] || 'Uncategorized'
        }));
        setFiles(categorizedFiles);

        // Step 2: Extract summaries using the now-categorized files
        const { caseSummary, clientRequestSummary } = await extractSummariesFromFiles(categorizedFiles);
        setCaseContentForDisplay(caseSummary);
        setClientRequestForDisplay(clientRequestSummary);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Lỗi không xác định';
        setSummaryError(`Lỗi khi tóm tắt hồ sơ: ${message}`);
        setFiles(prev => prev.map(f => ({ ...f, status: 'failed', error: message })));
    } finally {
        setIsSummarizing(false);
    }
  }, [files]);


  const handleUpdateAnalysis = useCallback(async () => {
    if (!originalReport) { setError("Không có báo cáo gốc để cập nhật."); return; }
    setError(null); setSummaryError(null); setIsLoading(true);
    try {
      const updatedReport = await analyzeCaseFiles(files, query, {
        report: originalReport,
        stage: getStageLabel(currentLitigationType, currentLitigationStage)
      });
      updatedReport.userAddedLaws = originalReport.userAddedLaws || []; // Preserve user-added laws on update
      setReport(updatedReport); setOriginalReport(updatedReport);
      alert(`Đã cập nhật thành công cho giai đoạn: ${getStageLabel(currentLitigationType, currentLitigationStage)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi không xác định khi cập nhật.");
    } finally {
      setIsLoading(false);
    }
  }, [originalReport, currentLitigationType, currentLitigationStage, files, query]);

  const handleMainActionClick = () => {
    if (mainAction.action === 'analyze') handleStartFileProcessing();
    else if (mainAction.action === 'update') handleUpdateAnalysis();
  };
  
  const handleUpdateUserLaws = (updatedLaws: ApplicableLaw[]) => {
    const updateLaws = (prevReport: AnalysisReport | null) => {
        if (!prevReport) return null;
        return { ...prevReport, userAddedLaws: updatedLaws };
    };
    setReport(updateLaws);
    setOriginalReport(updateLaws);
  };
  
  const handleUpdateReport = (updatedReport: AnalysisReport) => {
    setReport(updatedReport);
    setOriginalReport(updatedReport);
  };

  // --- Case Management Logic ---
  const startNewWorkflow = (type: 'consulting' | 'litigation') => {
        resetAnalysisState();
        setActiveCase({
          id: `new_${Date.now()}`,
          workflowType: type, name: '', caseContent: '', clientRequest: '', query: '',
          files: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
          litigationType: 'civil', litigationStage: 'consulting', analysisReport: null,
        });
        setIsWorkflowSelectorOpen(false);
  };

  const handleSaveCase = async () => {
    if (!activeCase) return;
    const defaultName = activeCase.name || query || `Vụ việc ngày ${new Date().toLocaleDateString('vi-VN')}`;
    const caseName = window.prompt("Nhập tên để lưu vụ việc:", defaultName);
    if (!caseName) return;
    
    setIsSaving(true);
    try {
      const serializableFiles: SerializableFile[] = await Promise.all(files.map(async (f) => ({ name: f.file.name, type: f.file.type, content: await fileToBase64(f.file) })));
      const now = new Date().toISOString();
      const caseToSave: SavedCase = {
        ...activeCase,
        id: activeCase.id.startsWith('new_') ? now : activeCase.id,
        createdAt: activeCase.id.startsWith('new_') ? now : activeCase.createdAt,
        name: caseName, 
        caseContent: '', // This is deprecated, content is in files
        clientRequest: '', // This is deprecated
        query, files: serializableFiles, updatedAt: now,
        litigationType: currentLitigationType, litigationStage: currentLitigationStage, analysisReport: report,
      };
      await saveCase(caseToSave);
      setActiveCase(caseToSave);
      await loadData();
      alert(`Vụ việc "${caseName}" đã được lưu!`);
    } catch (err) {
      alert("Đã xảy ra lỗi khi lưu vụ việc.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadCase = (caseToLoad: SavedCase) => {
    resetAnalysisState();
    setActiveCase({ ...caseToLoad, workflowType: caseToLoad.workflowType || 'litigation' });
    setQuery(caseToLoad.query);
    
    const reportToLoad = caseToLoad.analysisReport;
    if (reportToLoad) {
        reportToLoad.userAddedLaws = reportToLoad.userAddedLaws || []; // Ensure userAddedLaws exists
    }
    setReport(reportToLoad);
    setOriginalReport(reportToLoad);

    setCurrentLitigationType(caseToLoad.litigationType || 'civil');
    setCurrentLitigationStage(caseToLoad.litigationStage || 'consulting');
    const loadedFiles: UploadedFile[] = caseToLoad.files.map(sf => ({ id: `${sf.name}-${Math.random()}`, file: base64ToFile(sf.content, sf.name, sf.type), preview: null, category: 'Uncategorized', status: 'pending' }));
    setFiles(loadedFiles);
    setIsCaseListOpen(false);
    alert(`Đã tải vụ việc "${caseToLoad.name}".`);
  };

  const handleDeleteCase = async (caseId: string) => {
     if (window.confirm("Bạn có chắc chắn muốn xóa vụ việc này?")) {
        try {
            await deleteCaseById(caseId);
            setSavedCases(p => p.filter(c => c.id !== caseId));
            if (activeCase?.id === caseId) setActiveCase(null);
        } catch(err) {
            alert("Đã xảy ra lỗi khi xóa vụ việc.");
        }
     }
  };

    const handleBackup = async () => {
      if (isBackingUp) return;
      setIsBackingUp(true);
      try {
        const allCases = await getAllCasesSorted();
        if (allCases.length === 0) {
          alert("Không có vụ việc nào để sao lưu.");
          return;
        }
        const jsonData = JSON.stringify(allCases, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        link.download = `legal_assistant_backup_${timestamp}.json`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Backup failed:", err);
        alert("Sao lưu dữ liệu thất bại.");
      } finally {
        setIsBackingUp(false);
      }
    };

    const handleRestore = () => {
      if (isRestoring) return;
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.json';
      fileInput.onchange = (event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
          setIsRestoring(true);
          try {
            const text = e.target?.result;
            if (typeof text !== 'string') {
              throw new Error("Không thể đọc tệp.");
            }
            const data = JSON.parse(text);

            // Basic validation
            if (!Array.isArray(data) || (data.length > 0 && typeof data[0].id === 'undefined')) {
              throw new Error("Tệp sao lưu không hợp lệ hoặc bị hỏng.");
            }

            const confirmed = window.confirm(
              `Bạn sắp khôi phục ${data.length} vụ việc. Thao tác này sẽ XÓA TẤT CẢ các vụ việc hiện tại.\n\nBạn có chắc chắn muốn tiếp tục không?`
            );

            if (confirmed) {
              await clearAndBulkAddCases(data as SavedCase[]);
              await loadData(); // Refresh the list
              alert(`Đã khôi phục thành công ${data.length} vụ việc.`);
            }
          } catch (err) {
            console.error("Restore failed:", err);
            alert(`Khôi phục dữ liệu thất bại: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`);
          } finally {
            setIsRestoring(false);
          }
        };
        reader.onerror = () => {
           alert("Không thể đọc tệp đã chọn.");
        };
        reader.readAsText(file);
      };
      fileInput.click();
    };


  const filteredCases = savedCases.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // --- Export Logic ---
  const generateSafeFilename = (baseName: string) => baseName.replace(/[^a-z0-9_-\s]/gi, '').replace(/\s+/g, '_').substring(0, 50) || 'Bao_cao';
  
  const handleFinalExport = (format: 'docx' | 'xlsx' | 'pdf', customizedReport: AnalysisReport, orderedSections: ReportSection[]) => {
    if (!report || isExporting) return;
    const baseFilename = `Bao_cao_Phan_tich_${generateSafeFilename(query)}`;
    setIsExporting(true);
    try {
        if (format === 'docx') { exportToDocx(customizedReport, `${baseFilename}.docx`, orderedSections); setIsExporting(false); setIsCustomizeModalOpen(false); }
        else if (format === 'xlsx') { exportToXlsx(customizedReport, `${baseFilename}.xlsx`); setIsExporting(false); setIsCustomizeModalOpen(false); }
        else if (format === 'pdf') {
            setReport(customizedReport);
            setTimeout(() => exportToPdf(`${baseFilename}.pdf`), 100);
        }
    } catch (err) {
        setError(`Xuất file ${format.toUpperCase()} thất bại.`);
        setIsExporting(false);
    }
  }

  const exportToDocx = (reportData: AnalysisReport, fileName: string, orderedSections: ReportSection[]) => {
    if (typeof docx === 'undefined') { console.error("DOCX library not ready."); return; }
    const { Document, Packer, Paragraph, HeadingLevel, AlignmentType } = docx;
    const createHeading = (text: string) => new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } });
    const createSubHeading = (text: string) => new Paragraph({ text, style: "strongStyle", spacing: { before: 150, after: 75 } });
    const createParagraph = (text: string) => new Paragraph({ text, spacing: { after: 100 } });
    const createListItem = (text: string) => new Paragraph({ text, bullet: { level: 0 }, spacing: { after: 50 } });
    let docSections: any[] = [ new Paragraph({ text: `BÁO CÁO PHÂN TÍCH VỤ VIỆC`, heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }), new Paragraph({ text: query, heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, spacing: { after: 400 } }), ];
    orderedSections.forEach(section => {
        switch (section.id) {
            case 'customNotesSection': if (reportData.customNotes) docSections.push(createHeading(section.title), createParagraph(reportData.customNotes)); break;
            case 'legalRelationship': if (reportData.legalRelationship) docSections.push(createHeading(section.title), createParagraph(reportData.legalRelationship)); break;
            case 'coreLegalIssues': if (reportData.coreLegalIssues?.length) docSections.push(createHeading(section.title), ...reportData.coreLegalIssues.map(issue => createListItem(issue))); break;
            case 'applicableLaws': if (reportData.applicableLaws?.length) { docSections.push(createHeading(section.title)); reportData.applicableLaws.forEach(law => { docSections.push(createSubHeading(law.documentName)); law.articles.forEach(article => { docSections.push(createListItem(`${article.articleNumber}: ${article.summary}`)); }); }); } break;
            case 'gapAnalysis':
                if (reportData.gapAnalysis) {
                    docSections.push(
                        createHeading(section.title),
                        createSubHeading("Thông tin / Chứng cứ còn thiếu:"),
                        ...reportData.gapAnalysis.missingInformation.map(item => createListItem(item)),
                        createSubHeading("Hành động đề xuất:"),
                        ...reportData.gapAnalysis.recommendedActions.map(item => createListItem(item)),
                        createSubHeading("Lỗ hổng pháp lý tiềm ẩn:"),
                        ...(reportData.gapAnalysis.legalLoopholes || []).map((item: LegalLoophole) => createListItem(`[${item.classification} - Mức độ: ${item.severity}] ${item.description}`))
                    );
                }
                break;
            case 'caseProspects': if (reportData.caseProspects) docSections.push( createHeading(section.title), createSubHeading("Điểm mạnh:"), ...reportData.caseProspects.strengths.map(item => createListItem(item)), createSubHeading("Điểm yếu:"), ...reportData.caseProspects.weaknesses.map(item => createListItem(item)), createSubHeading("Rủi ro:"), ...reportData.caseProspects.risks.map(item => createListItem(item)) ); break;
            case 'proposedStrategy': if (reportData.proposedStrategy) docSections.push( createHeading(section.title), createSubHeading("Giai đoạn Tiền tố tụng:"), ...reportData.proposedStrategy.preLitigation.map(item => createListItem(item)), createSubHeading("Giai đoạn Tố tụng:"), ...reportData.proposedStrategy.litigation.map(item => createListItem(item)) ); break;
            case 'contingencyPlan': if (reportData.contingencyPlan?.length) docSections.push(createHeading(section.title), ...reportData.contingencyPlan.map(item => createListItem(item))); break;
        }
    });
    const doc = new Document({ styles: { paragraphStyles: [{ id: "strongStyle", name: "Strong Style", basedOn: "Normal", next: "Normal", run: { bold: true }, }], }, sections: [{ children: docSections }] });
    Packer.toBlob(doc).then(blob => { const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = fileName; document.body.appendChild(link); link.click(); document.body.removeChild(link); });
  };
  const exportToXlsx = (reportData: AnalysisReport, fileName: string) => {
    if (typeof XLSX === 'undefined') { console.error("XLSX library not ready."); return; }
    const wb = XLSX.utils.book_new();
    const appendSheet = (title: string, data: any[][]) => { const ws = XLSX.utils.aoa_to_sheet(data); XLSX.utils.book_append_sheet(wb, ws, title); };
    if (reportData.customNotes) appendSheet("Ghi chú", [["Ghi chú Tùy chỉnh"], [reportData.customNotes]]);
    if (reportData.legalRelationship) appendSheet("Tổng quan", [["Quan hệ pháp luật", reportData.legalRelationship],["Vấn đề pháp lý cốt lõi", (reportData.coreLegalIssues || []).join('\n')]]);
    if (reportData.applicableLaws?.length) { const d = [["Văn bản", "Điều luật", "Nội dung"]]; reportData.applicableLaws.forEach(l => l.articles.forEach(a => d.push([l.documentName, a.articleNumber, a.summary]))); appendSheet("Cơ sở pháp lý", d); }
    if (reportData.gapAnalysis) {
        const d = [["Lỗ hổng thông tin", "Hành động đề xuất", "Lỗ hổng pháp lý"]];
        const max = Math.max(reportData.gapAnalysis.missingInformation.length, reportData.gapAnalysis.recommendedActions.length, (reportData.gapAnalysis.legalLoopholes || []).length);
        for (let i = 0; i < max; i++) {
            const loophole = (reportData.gapAnalysis.legalLoopholes || [])[i];
            const loopholeText = loophole ? `[${loophole.classification} - Mức độ: ${loophole.severity}] ${loophole.description}` : '';
            d.push([
                reportData.gapAnalysis.missingInformation[i] || '',
                reportData.gapAnalysis.recommendedActions[i] || '',
                loopholeText
            ]);
        }
        appendSheet("Phân tích Lỗ hổng", d);
    }
    if (reportData.caseProspects) { const d = [["Điểm mạnh", "Điểm yếu", "Rủi ro"]]; const max = Math.max(reportData.caseProspects.strengths.length, reportData.caseProspects.weaknesses.length, reportData.caseProspects.risks.length); for (let i = 0; i < max; i++) d.push([reportData.caseProspects.strengths[i] || '', reportData.caseProspects.weaknesses[i] || '', reportData.caseProspects.risks[i] || '']); appendSheet("Triển vọng Vụ việc", d); }
    if (reportData.proposedStrategy) { const d = [["Chiến lược Tiền tố tụng", "Chiến lược Tố tụng"]]; const max = Math.max(reportData.proposedStrategy.preLitigation.length, reportData.proposedStrategy.litigation.length); for (let i = 0; i < max; i++) d.push([reportData.proposedStrategy.preLitigation[i] || '', reportData.proposedStrategy.litigation[i] || '']); appendSheet("Chiến lược Đề xuất", d); }
    if (reportData.contingencyPlan?.length) { const d = [["Phương án xử lý nếu thua kiện"]]; reportData.contingencyPlan.forEach(item => d.push([item])); appendSheet("Phương án Dự phòng", d); }
    XLSX.writeFile(wb, fileName);
  };
  const exportToPdf = (fileName: string) => {
    if (typeof jspdf === 'undefined' || typeof html2canvas === 'undefined') { setIsExporting(false); return; }
    const reportElement = document.getElementById('report-content');
    if (!reportElement) { setError("Could not find report content."); setIsExporting(false); return; }
    html2canvas(reportElement, { scale: 2, useCORS: true }).then((canvas) => { const imgData = canvas.toDataURL('image/png'); const { jsPDF } = jspdf; const pdf = new jsPDF({ orientation: 'p', unit: 'px', format: 'a4' }); const pdfWidth = pdf.internal.pageSize.getWidth(); const ratio = canvas.width / pdfWidth; const imgHeight = canvas.height / ratio; let heightLeft = imgHeight; let position = 0; pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight); heightLeft -= pdf.internal.pageSize.getHeight(); while (heightLeft > 0) { position = heightLeft - imgHeight; pdf.addPage(); pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight); heightLeft -= pdf.internal.pageSize.getHeight(); } pdf.save(fileName); }).catch(err => { setError("Error creating PDF."); }).finally(() => { setIsExporting(false); setIsCustomizeModalOpen(false); if (originalReport) setReport(originalReport); });
  };

  const handleGenerateDraft = useCallback(async () => {
    if (!report || !draftRequest.trim()) {
        setDraftError("Vui lòng nhập yêu cầu soạn thảo.");
        return;
    }
    setDraftError(null);
    setIsDrafting(true);
    setDraftContent('');
    try {
        const result = await generateContextualDocument(report, draftRequest, draftOptions);
        setDraftContent(result);
    } catch (err) {
        setDraftError(err instanceof Error ? err.message : "Lỗi khi soạn thảo.");
    } finally {
        setIsDrafting(false);
    }
  }, [report, draftRequest, draftOptions]);

  const handleRefineDraft = useCallback(async (mode: 'concise' | 'detailed') => {
      if (!draftContent.trim()) return;
      setDraftError(null);
      setIsRefining(mode);
      try {
          const result = await refineText(draftContent, mode);
          setDraftContent(result);
      } catch (err) {
          setDraftError(err instanceof Error ? err.message : `Lỗi khi ${mode === 'concise' ? 'làm gọn' : 'chi tiết hóa'}.`);
      } finally {
          setIsRefining(null);
      }
  }, [draftContent]);
  
  const handleGenerateSummary = useCallback(async () => {
    if (!report) return;
    setIsSummarizing(true); setSummaryError(null);
    try {
        const summary = await generateReportSummary(report);
        const newReport = { ...report, quickSummary: summary };
        setReport(newReport); setOriginalReport(newReport);
    } catch (err) {
        setSummaryError(err instanceof Error ? err.message : "Lỗi khi tạo tóm tắt.");
    } finally {
        setIsSummarizing(false);
    }
  }, [report]);

  const handleClearSummary = () => {
    const clearSummary = (prev: AnalysisReport | null) => { if (!prev) return null; const { quickSummary, ...rest } = prev; return rest as AnalysisReport; };
    setReport(clearSummary); setOriginalReport(clearSummary);
  };

  const renderLitigationWorkflow = () => {
    const currentStageSuggestions = litigationStageSuggestions[currentLitigationStage];
    const showStageSuggestions = report && currentStageSuggestions;

    const renderCurrentView = () => {
        switch(activeView) {
            case 'caseAnalysis':
                return (
                    <>
                        {/* Input Panel */}
                        {!isInputPanelCollapsed && (
                            <div className="w-5/12 flex-shrink-0 overflow-y-auto pr-2 -mr-2 space-y-4 animate-fade-in">
                                <div className="flex justify-between items-center">
                                    <button onClick={() => { if (window.confirm("Bạn có chắc chắn muốn quay lại? Mọi dữ liệu chưa lưu sẽ bị mất.")) { handleGoBackToSelection(); } }} className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 font-semibold transition-colors">
                                        <BackIcon className="w-4 h-4" /> Quay lại Chọn Nghiệp vụ
                                    </button>
                                </div>
                                <div className="p-4 border border-slate-200 rounded-lg">
                                    <FileUpload files={files} setFiles={setFiles} onPreview={setPreviewingFile} />
                                </div>
                                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                                    <label htmlFor="mainQuery" className="block text-sm font-bold text-blue-900 mb-1">Yêu cầu chính cho AI</label>
                                    <p className="text-xs text-blue-800/80 mb-2">Đây là yêu cầu quan trọng nhất, quyết định hướng phân tích của AI.</p>
                                    <textarea id="mainQuery" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ví dụ: Phân tích và đề xuất chiến lược khởi kiện" className="w-full bg-white p-2 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500" rows={2} />
                                </div>
                                <div className="pt-2 space-y-3">
                                    <button onClick={handleMainActionClick} disabled={mainAction.disabled} className="w-full py-2.5 px-4 font-semibold text-sm rounded-lg transition-all duration-200 flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-slate-300">
                                        {isLoading ? <><Loader /><span>{mainAction.loadingText}</span></> : <span>{mainAction.text}</span>}
                                    </button>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button onClick={handleExtractAndDisplaySummaries} disabled={files.length === 0 || isLoading || isSummarizing} className="py-2.5 px-4 font-semibold text-sm rounded-lg transition-all duration-200 flex items-center justify-center gap-2 bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-400 border border-slate-300">
                                            {isSummarizing ? <><Loader /><span>Đang tóm tắt...</span></> : <><MagicIcon className="w-4 h-4" /><span>Tóm tắt Hồ sơ</span></>}
                                        </button>
                                        <button onClick={handleSaveCase} disabled={isSaving} className="py-2.5 px-4 font-semibold text-sm rounded-lg transition-all duration-200 flex items-center justify-center gap-2 bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-400 border border-slate-300">
                                            {isSaving ? <Loader /> : <><SaveCaseIcon className="w-4 h-4" /><span>Lưu vụ việc</span></>}
                                        </button>
                                    </div>
                                </div>
                                {error && <div className="mt-2"><Alert message={error} type="error" /></div>}
                                {summaryError && <div className="mt-2"><Alert message={summaryError} type="error" /></div>}
                            </div>
                        )}
                        
                        {/* Separator / Button */}
                        <div className="flex-shrink-0 flex items-center justify-center -mx-3">
                            <button
                                onClick={() => setIsInputPanelCollapsed(p => !p)}
                                className="z-10 p-1.5 bg-white border border-slate-300 rounded-full shadow-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                                title={isInputPanelCollapsed ? "Hiện bảng nhập liệu" : "Ẩn bảng nhập liệu"}
                            >
                                {isInputPanelCollapsed ? <PanelExpandIcon className="w-5 h-5" /> : <PanelCollapseIcon className="w-5 h-5" />}
                            </button>
                        </div>

                        {/* Results Panel */}
                        <div className="flex-1 overflow-y-auto border border-slate-200 rounded-lg p-6 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-slate-800">Kết quả Phân tích</h3>
                                {report && !isLoading && (<div className="flex items-center gap-2">
                                    <button onClick={handleGenerateSummary} disabled={isSummarizing} className="flex items-center gap-2 px-3 py-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:bg-slate-200">{isSummarizing ? <Loader /> : <MagicIcon className="w-4 h-4" />}Tóm tắt</button>
                                    <button onClick={() => setIsCustomizeModalOpen(true)} disabled={isExporting || !libsReady} className="flex items-center gap-2 px-3 py-1.5 text-xs bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-400">{!libsReady ? <Loader /> : <ExportIcon className="w-4 h-4" />}{!libsReady ? "Tải..." : "Xuất"}</button>
                                </div>)}
                            </div>
                            
                            <div className="flex-grow rounded-lg bg-slate-50/50 p-1 min-h-[60vh]">
                                {isLoading && (
                                    <div className="loading-bar-container">
                                        <div className="loading-bars">
                                            <div className="loading-bar"></div>
                                            <div className="loading-bar"></div>
                                            <div className="loading-bar"></div>
                                        </div>
                                        <p className="mt-4 text-sm text-slate-500">{mainAction.loadingText}</p>
                                    </div>
                                )}
                                {!isLoading && !report && !caseContentForDisplay && (
                                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
                                        <p className="text-sm font-medium text-slate-500">Chờ kết quả phân tích và soạn thảo ở đây...</p>
                                    </div>
                                )}
                                {(report || caseContentForDisplay) && (
                                    <div className="animate-fade-in h-full overflow-y-auto p-4">
                                        <ReportDisplay 
                                            report={report} 
                                            files={files} 
                                            onPreview={setPreviewingFile} 
                                            onClearSummary={handleClearSummary}
                                            litigationType={currentLitigationType}
                                            onUpdateUserLaws={handleUpdateUserLaws}
                                            onUpdateReport={handleUpdateReport}
                                            caseSummary={caseContentForDisplay}
                                            clientRequestSummary={clientRequestForDisplay}
                                        />
                                       
                                        {showStageSuggestions && currentStageSuggestions.actions.length > 0 && (
                                            <div className="mt-8 pt-6 border-t-2 border-slate-100">
                                                <h3 className="text-xl font-bold text-slate-800 mb-4">Gợi ý Hành động cho GĐ: {getStageLabel(currentLitigationType, currentLitigationStage)}</h3>
                                                <div className="bg-slate-50 p-4 rounded-lg border">
                                                    <ul className="list-disc list-inside space-y-1.5 text-sm">
                                                        {currentStageSuggestions.actions.map((a, i) => <li key={i}>{a}</li>)}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}

                                        {report && (<div id="contextual-drafting-section" className="mt-8 pt-6 border-t-2 border-slate-100">
                                            <h3 className="text-xl font-bold text-slate-800 mb-4">Soạn thảo Văn bản theo Bối cảnh</h3>
                                            
                                            <div className="p-4 bg-slate-100 border border-slate-200 rounded-lg space-y-4">
                                                <div>
                                                    <label htmlFor="draftRequest" className="block text-sm font-semibold text-slate-700 mb-1.5">Yêu cầu soạn thảo</label>
                                                    {showStageSuggestions && currentStageSuggestions.documents.length > 0 && (
                                                        <div className="mb-3 flex flex-wrap gap-2">
                                                            {currentStageSuggestions.documents.map((d, i) => (
                                                                <button key={i} onClick={() => setDraftRequest(d)} className="flex items-center gap-1.5 text-xs p-1.5 bg-blue-100 text-blue-800 font-medium rounded-md hover:bg-blue-200">
                                                                    <PlusIcon className="w-3 h-3 shrink-0" />{d}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <textarea
                                                        id="draftRequest"
                                                        value={draftRequest}
                                                        onChange={(e) => setDraftRequest(e.target.value)}
                                                        placeholder="Ví dụ: Soạn thảo Đơn khởi kiện yêu cầu bồi thường thiệt hại..."
                                                        className="w-full h-24 p-2.5 bg-white border border-slate-300 rounded-md text-sm"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Mức độ chi tiết</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {(['detailed', 'concise'] as const).map(detail => {
                                                            const inputId = `detail-option-${detail}`;
                                                            return (
                                                                <div key={detail}>
                                                                    <input
                                                                        type="radio"
                                                                        id={inputId}
                                                                        name="detail"
                                                                        value={detail}
                                                                        checked={draftOptions.detail === detail}
                                                                        onChange={(e) => setDraftOptions({ detail: e.target.value as any })}
                                                                        className="sr-only"
                                                                    />
                                                                    <label
                                                                        htmlFor={inputId}
                                                                        className={`cursor-pointer px-3 py-1.5 text-xs rounded-md transition-colors border ${draftOptions.detail === detail ? 'bg-blue-600 text-white font-semibold border-blue-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}`}
                                                                    >
                                                                        <span>{detail === 'detailed' ? 'Chi tiết' : 'Ngắn gọn'}</span>
                                                                    </label>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>

                                                <button onClick={handleGenerateDraft} disabled={isDrafting || !draftRequest} className="w-full py-2.5 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-slate-300 flex items-center justify-center gap-2">
                                                    {isDrafting ? <><Loader /> <span>Đang soạn...</span></> : 'Soạn thảo'}
                                                </button>
                                            </div>

                                            {draftError && <div className="mt-2"><Alert message={draftError} type="error" /></div>}

                                            {(isDrafting || draftContent) && (
                                                <div className="mt-4 animate-fade-in">
                                                    <h4 className="text-base font-semibold text-slate-800 mb-2">Văn bản đã soạn:</h4>
                                                    <div className="relative">
                                                        <textarea
                                                            value={draftContent}
                                                            onChange={(e) => setDraftContent(e.target.value)}
                                                            placeholder={isDrafting ? "AI đang soạn thảo, vui lòng đợi..." : ""}
                                                            className="w-full p-4 bg-white border border-slate-200 rounded-lg min-h-[300px] text-sm font-sans shadow-inner"
                                                            readOnly={isDrafting || !!isRefining}
                                                        />
                                                        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                                                            <button onClick={() => handleRefineDraft('concise')} disabled={!!isRefining || !draftContent} className="flex items-center text-xs px-2 py-1 bg-slate-200 text-blue-600 rounded-md hover:bg-slate-300 disabled:opacity-50">
                                                                {isRefining === 'concise' ? <Loader/> : <MagicIcon className="w-3 h-3 mr-1"/>} Làm gọn
                                                            </button>
                                                            <button onClick={() => handleRefineDraft('detailed')} disabled={!!isRefining || !draftContent} className="flex items-center text-xs px-2 py-1 bg-slate-200 text-blue-600 rounded-md hover:bg-slate-300 disabled:opacity-50">
                                                                {isRefining === 'detailed' ? <Loader/> : <MagicIcon className="w-3 h-3 mr-1"/>} Chi tiết hóa
                                                            </button>
                                                            <div className="w-px h-4 bg-slate-300"></div>
                                                            <button onClick={() => { navigator.clipboard.writeText(draftContent); alert('Đã sao chép!'); }} disabled={!draftContent} className="bg-slate-200 text-slate-700 px-2.5 py-1 text-xs font-semibold rounded-md hover:bg-slate-300 disabled:opacity-50">
                                                                Copy
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                );
            case 'documentGenerator':
                return <div className="flex-1 overflow-y-auto"><DocumentGenerator /></div>;
            case 'quickDraft':
                return <div className="flex-1 overflow-y-auto"><QuickDraftGenerator /></div>;
            default:
                return (
                    <div className="flex-1">
                        <PlaceholderView viewName={navItems.find(item => item.id === activeView)?.label || ''} />
                    </div>
                );
        }
    };

    return (
      <div className="flex w-full bg-white rounded-xl soft-shadow animate-fade-in h-[calc(100vh-6.5rem)]">
        <div 
            className="flex-shrink-0 h-full relative z-20"
            onMouseEnter={() => setIsSidebarHovered(true)}
            onMouseLeave={() => setIsSidebarHovered(false)}
        >
            <Sidebar 
                activeView={activeView} 
                onNavigate={setActiveView} 
                isExpanded={isSidebarHovered}
                onBackup={handleBackup}
                onRestore={handleRestore}
                isActionInProgress={isBackingUp || isRestoring}
            />
        </div>
        <main className="flex-1 p-6 flex gap-6 overflow-hidden">
             {renderCurrentView()}
        </main>
      </div>
    );
  };
  
  const renderWelcomeScreen = () => (
    <div className="text-center py-24">
        <h2 className="text-2xl font-bold text-slate-800">Chào mừng đến với Trợ lý Pháp lý</h2>
        <p className="text-slate-600 mt-2 mb-8">Vui lòng bắt đầu bằng cách tạo một vụ việc mới hoặc mở một vụ việc đã có.</p>
        <div className="flex justify-center gap-4">
            <button onClick={() => setIsWorkflowSelectorOpen(true)} className="flex items-center justify-center gap-2 py-2 px-5 bg-blue-600 text-white text-base font-semibold rounded-lg hover:bg-blue-700"><PlusIcon className="w-5 h-5" />Vụ việc Mới</button>
            <button onClick={() => setIsCaseListOpen(true)} className="flex items-center justify-center gap-2 py-2 px-5 bg-slate-200 text-slate-800 text-base font-semibold rounded-lg hover:bg-slate-300"><FolderIcon className="w-5 h-5" />Mở danh sách</button>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen text-slate-800">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 flex items-center gap-4">
          <AppLogo className="w-12 h-12" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Trợ lý của LS Hồng Vân</h1>
            <p className="text-sm text-slate-500">Phân tích hồ sơ, xây dựng chiến lược, soạn thảo văn bản và quản lý vụ việc.</p>
          </div>
        </header>
        <main>
            {!activeCase && renderWelcomeScreen()}
            {activeCase?.workflowType === 'litigation' && renderLitigationWorkflow()}
            {activeCase?.workflowType === 'consulting' && <ConsultingWorkflow onPreview={setPreviewingFile} onGoBack={handleGoBackToSelection} activeCase={activeCase} onCasesUpdated={loadData} />}
        
            {isProcessing && (<ProcessingProgress files={files} onContinue={handleContinueAnalysis} onCancel={handleCancelProcessing} isFinished={isPreprocessingFinished} hasTextContent={false} />)}
        </main>
      </div>

       <PreviewModal file={previewingFile} onClose={() => setPreviewingFile(null)} />
       
       {isWorkflowSelectorOpen && (
           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                <div className="bg-white rounded-xl shadow-2xl p-8 w-11/12 max-w-lg text-center soft-shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Chọn loại Nghiệp vụ</h3>
                    <p className="text-slate-600 mb-8">Chọn một luồng công việc phù hợp với nhu cầu.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button onClick={() => startNewWorkflow('litigation')} className="p-6 border rounded-lg hover:bg-blue-50 hover:border-blue-400 text-left">
                            <h4 className="font-bold text-blue-700">Vụ việc Tranh tụng</h4>
                            <p className="text-sm text-slate-500 mt-2">Phân tích sâu, quản lý theo giai đoạn cho các vụ việc phức tạp.</p>
                        </button>
                        <button onClick={() => startNewWorkflow('consulting')} className="p-6 border rounded-lg hover:bg-green-50 hover:border-green-400 text-left">
                            <h4 className="font-bold text-green-700">Nhiệm vụ Tư vấn</h4>
                            <p className="text-sm text-slate-500 mt-2">Soạn thảo nhanh thư tư vấn hoặc các văn bản đơn lẻ khác.</p>
                        </button>
                    </div>
                     <button onClick={() => setIsWorkflowSelectorOpen(false)} className="mt-8 text-sm text-slate-500 hover:text-slate-800">Hủy</button>
                </div>
           </div>
       )}

       {isCaseListOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                <div className="bg-white rounded-xl shadow-2xl p-6 w-11/12 max-w-3xl flex flex-col max-h-[85vh] soft-shadow-lg">
                    <div className="flex justify-between items-center pb-4 border-b">
                         <div className="flex items-center gap-4">
                            <h3 className="text-xl font-bold">Danh sách Vụ việc đã lưu</h3>
                        </div>
                        <button onClick={() => setIsCaseListOpen(false)} className="text-slate-400 hover:text-red-600 text-3xl p-1 leading-none">&times;</button>
                    </div>
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Tìm kiếm..." className="w-full p-2.5 my-4 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                    <div className="flex-grow overflow-y-auto space-y-3 pr-2 -mr-2">
                       {filteredCases.length > 0 ? filteredCases.map(c => (
                           <div key={c.id} className="p-3 bg-white border rounded-lg flex justify-between items-center gap-4 hover:border-blue-400 hover:bg-slate-50/50">
                               <div>
                                   <p className="font-semibold text-blue-700 truncate">{c.name}</p>
                                   <div className="flex items-center gap-3 mt-1.5">
                                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${c.litigationType === 'criminal' ? 'bg-red-100 text-red-800 border-red-200' : c.litigationType === 'administrative' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-sky-100 text-sky-800 border-sky-200'}`}>
                                          {c.litigationType === 'civil' ? 'Dân sự' : c.litigationType === 'criminal' ? 'Hình sự' : 'Hành chính'}
                                      </span>
                                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${c.workflowType === 'consulting' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-blue-100 text-blue-800 border-blue-200'}`}>
                                          {c.workflowType === 'consulting' ? 'Tư vấn' : getStageLabel(c.litigationType, c.litigationStage)}
                                      </span>
                                      <p className="text-xs text-slate-500">Cập nhật: {new Date(c.updatedAt || c.createdAt).toLocaleString('vi-VN')}</p>
                                   </div>
                               </div>
                               <div className="flex-shrink-0 flex items-center gap-2">
                                   <button onClick={() => handleLoadCase(c)} className="px-4 py-1.5 text-sm bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">Mở</button>
                                   <button onClick={() => handleDeleteCase(c.id)} className="p-2 text-slate-500 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                               </div>
                           </div>
                       )) : (<p className="text-center text-slate-500 py-12">Không tìm thấy vụ việc nào.</p>)}
                    </div>
                </div>
            </div>
       )}

       {report && <CustomizeReportModal isOpen={isCustomizeModalOpen} onClose={() => setIsCustomizeModalOpen(false)} onExport={handleFinalExport} baseReport={report} isExporting={isExporting} libsReady={libsReady} />}
    </div>
  );
};

export default App;