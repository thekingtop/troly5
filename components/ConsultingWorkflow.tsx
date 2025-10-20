
import React, { useState, useCallback, useEffect } from 'react';
import { FileUpload } from './FileUpload.tsx';
import { Loader } from './Loader.tsx';
import { MagicIcon } from './icons/MagicIcon.tsx';
import { analyzeConsultingCase, generateConsultingDocument, categorizeMultipleFiles, summarizeText } from '../services/geminiService.ts';
import type { UploadedFile, SavedCase, SerializableFile, ConsultingReport, LitigationType, LegalLoophole } from '../types.ts';
import { BackIcon } from './icons/BackIcon.tsx';
import { saveCase } from '../services/db.ts';
import { SaveCaseIcon } from './icons/SaveCaseIcon.tsx';
import { PlusIcon } from './icons/PlusIcon.tsx';
import { ProcessingProgress } from './ProcessingProgress.tsx';

// --- Internal Icons ---
const DiscussionIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.006 3 11.55c0 2.944 1.79 5.515 4.5 6.943.25.123.5.217.75.284V21a.75.75 0 0 0 .94.724l2.16-1.08a8.25 8.25 0 0 0 4.66 0l2.16 1.08a.75.75 0 0 0 .94-.724v-2.008c.25-.067.5-.16.75-.284A8.845 8.845 0 0 0 21 11.55c0-4.556-4.03-8.25-9-8.25Z" />
    </svg>
);
const CaseInfoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75c0-.231-.035-.454-.1-.664M6.75 7.5h10.5a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25-2.25H6.75a2.25 2.25 0 0 1-2.25-2.25v-7.5a2.25 2.25 0 0 1 2.25-2.25Z" />
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

interface ConsultingWorkflowProps {
    onPreview: (file: UploadedFile) => void;
    onGoBack: () => void;
    activeCase: SavedCase | null;
    onCasesUpdated: () => void;
}

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

export const ConsultingWorkflow: React.FC<ConsultingWorkflowProps> = ({ onPreview, onGoBack, activeCase, onCasesUpdated }) => {
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
            setIsPreprocessingFinished(false);
            setIsProcessing(true);
            setFiles(prev => prev.map(f => ({ ...f, status: 'processing' as const, error: undefined })));

            try {
                const fileObjects = files.map(f => f.file);
                const categoryMap = await categorizeMultipleFiles(fileObjects);
                setFiles(prev => prev.map(f => ({
                    ...f,
                    status: 'completed',
                    category: categoryMap[f.file.name] || 'Uncategorized'
                })));
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Lỗi không xác định';
                setFiles(prev => prev.map(f => ({ ...f, status: 'failed', error: message })));
            } finally {
                setIsPreprocessingFinished(true);
            }
        } else {
            if (!disputeContent.trim() && !clientRequest.trim()) {
                setAnalysisError("Vui lòng tải tệp hoặc nhập nội dung để phân tích.");
                return;
            }
            await performAnalysis([]);
        }
    }, [files, disputeContent, clientRequest, performAnalysis]);

    
    const handleContinueAnalysis = useCallback(async () => {
        const successfulFiles = files.filter(f => f.status === 'completed');
        setIsProcessing(false);
        await performAnalysis(successfulFiles);
    }, [files, performAnalysis]);
    
    const handleCancelProcessing = () => {
        setIsProcessing(false);
        setIsPreprocessingFinished(false);
        setFiles(prev => prev.map(f => ({ ...f, status: 'pending', error: undefined })));
    };

    const handleGenerate = async (request: string) => {
        if (!request.trim()) { setGenerationError("Vui lòng nhập yêu cầu."); return; }
        setGenerationRequest(request);
        setGenerationError(null);
        setIsGenerating(true);
        setGeneratedText('');
        try {
            const result = await generateConsultingDocument(consultingReport, disputeContent, request);
            setGeneratedText(result);
        } catch (err) {
            setGenerationError(err instanceof Error ? err.message : "Lỗi không xác định.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    const isAnalyzeDisabled = isAnalyzing || isProcessing || isSummarizingField || (files.length === 0 && !disputeContent.trim() && !clientRequest.trim());

    return (
        <div className="animate-fade-in">
             <div className="mb-6 flex justify-between items-center">
                <button onClick={handleBackClick} className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 font-semibold transition-colors">
                    <BackIcon className="w-5 h-5" /> Quay lại Chọn Nghiệp vụ
                </button>
                <button onClick={handleSave} disabled={isSaving} className="flex items-center justify-center gap-2 py-2 px-4 bg-slate-600 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 disabled:bg-slate-300">
                    {isSaving ? <Loader /> : <><SaveCaseIcon className="w-4 h-4" /> <span>Lưu vụ việc</span></>}
                </button>
            </div>
            
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Nghiệp vụ Tư vấn & Soạn thảo</h2>
                <p className="text-slate-600 max-w-2xl mx-auto mt-2">Cung cấp thông tin, để AI phân tích và đề xuất các bước tiếp theo, sau đó soạn thảo văn bản.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-3">1. Cung cấp Thông tin</h3>
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
                            <FileUpload files={files} setFiles={setFiles} onPreview={onPreview} />
                             
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label htmlFor="disputeContent" className="text-sm font-semibold text-slate-700">Tóm tắt bối cảnh, tình huống</label>
                                    <button 
                                        onClick={() => handleSummarizeField('disputeContent')} 
                                        disabled={!disputeContent.trim() || !!isSummarizingField} 
                                        className="flex items-center gap-1.5 px-2 py-1 text-xs text-blue-600 font-semibold hover:bg-blue-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        title="Dùng AI để tóm tắt và làm rõ nội dung bên dưới"
                                    >
                                        {isSummarizingField === 'disputeContent' ? <Loader /> : <MagicIcon className="w-4 h-4" />}
                                        <span>Tóm tắt bằng AI</span>
                                    </button>
                                </div>
                                <textarea 
                                    id="disputeContent"
                                    value={disputeContent} 
                                    onChange={e => setDisputeContent(e.target.value)} 
                                    placeholder="Dán hoặc nhập nội dung vụ việc, diễn biến sự kiện vào đây..." 
                                    className="input-base w-full h-28 bg-white" 
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label htmlFor="clientRequest" className="text-sm font-semibold text-slate-700">Yêu cầu của khách hàng</label>
                                    <button 
                                        onClick={() => handleSummarizeField('clientRequest')} 
                                        disabled={!clientRequest.trim() || !!isSummarizingField} 
                                        className="flex items-center gap-1.5 px-2 py-1 text-xs text-blue-600 font-semibold hover:bg-blue-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        title="Dùng AI để tóm tắt và làm rõ nội dung bên dưới"
                                    >
                                        {isSummarizingField === 'clientRequest' ? <Loader /> : <MagicIcon className="w-4 h-4" />}
                                        <span>Tóm tắt bằng AI</span>
                                    </button>
                                </div>
                                <textarea 
                                    id="clientRequest"
                                    value={clientRequest} 
                                    onChange={e => setClientRequest(e.target.value)} 
                                    placeholder="Dán hoặc nhập yêu cầu, mong muốn của khách hàng..." 
                                    className="input-base w-full h-20 bg-white" 
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-3">2. Phân tích Sơ bộ</h3>
                        {summarizationError && <div className="mb-2"><Alert message={summarizationError} type="error" /></div>}
                        <button onClick={handleAnalyzeClick} disabled={isAnalyzeDisabled} className="btn btn-primary w-full !py-3 !text-base">
                            {isAnalyzing || isProcessing ? <><Loader /> <span>Đang phân tích...</span></> : <><MagicIcon className="w-5 h-5" /> Phân tích Tư vấn</>}
                        </button>
                    </div>
                </div>

                <div className="space-y-6 min-h-[400px]">
                     <h3 className="text-lg font-bold text-slate-800">3. Kết quả & Soạn thảo</h3>
                    {isAnalyzing && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500 bg-slate-50 rounded-lg border p-6">
                            <Loader /><p className="mt-4">AI đang phân tích...</p>
                        </div>
                    )}
                    {analysisError && <Alert message={analysisError} type="error" />}
                    
                    {!isAnalyzing && !consultingReport && !analysisError && (
                        <div className="flex flex-col items-center justify-center text-center text-slate-400 bg-slate-50 rounded-lg border p-6 h-full">
                            <MagicIcon className="w-16 h-16 mb-4 text-slate-300" />
                            <p className="font-medium text-slate-600">Kết quả phân tích và soạn thảo sẽ xuất hiện ở đây.</p>
                        </div>
                    )}

                    {consultingReport && (
                        <div className="space-y-6 animate-fade-in">
                            <AnalysisResultDisplay report={consultingReport} onGenerateRequest={handleGenerate} />
                            <GenerationSection
                                onGenerate={handleGenerate}
                                isLoading={isGenerating}
                                error={generationError}
                                generatedText={generatedText}
                                currentRequest={generationRequest}
                                setCurrentRequest={setGenerationRequest}
                            />
                        </div>
                    )}
                </div>
            </div>
            {isProcessing && (<ProcessingProgress files={files} onContinue={handleContinueAnalysis} onCancel={handleCancelProcessing} isFinished={isPreprocessingFinished} hasTextContent={disputeContent.trim().length > 0 || clientRequest.trim().length > 0} />)}
        </div>
    );
};

// --- Sub-components for ConsultingWorkflow ---

const InfoCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; }> = ({ icon, title, children }) => (
    <div className="bg-white p-4 rounded-lg border border-slate-200 soft-shadow">
        <div className="flex items-center gap-3 mb-3">
            <div className="flex-shrink-0 bg-blue-100 text-blue-600 p-2 rounded-full">{icon}</div>
            <h4 className="font-bold text-slate-800">{title}</h4>
        </div>
        <div className="pl-12 text-sm text-slate-700">{children}</div>
    </div>
);

const LegalLoopholesDisplay: React.FC<{ loopholes: LegalLoophole[] }> = ({ loopholes }) => {
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
        'Hợp đồng': { icon: <ContractIcon className="w-5 h-5" />, color: 'text-purple-800', title: 'Lỗ hổng Hợp đồng' },
        'Quy phạm Pháp luật': { icon: <LawIcon className="w-5 h-5" />, color: 'text-teal-800', title: 'Lỗ hổng Luật & QPPL' },
        'Tố tụng': { icon: <ProcedureIcon className="w-5 h-5" />, color: 'text-indigo-800', title: 'Lỗ hổng Tố tụng' },
        'Khác': { icon: <InfoIcon className="w-5 h-5" />, color: 'text-slate-800', title: 'Lỗ hổng Khác' },
    };

    return (
        <div className="space-y-4">
            {classificationOrder
                .filter(classification => groupedLoopholes[classification])
                .map(classification => (
                    <div key={classification}>
                        <div className={`flex items-center gap-2 ${classificationMeta[classification].color}`}>
                            {classificationMeta[classification].icon}
                            <h5 className="font-semibold text-sm">{classificationMeta[classification].title}</h5>
                        </div>
                        <div className="space-y-2 mt-2 pl-7">
                            {groupedLoopholes[classification].map((item, index) => (
                                <div key={index} className="p-2 bg-slate-50 border border-slate-200 rounded-md text-xs">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="font-semibold text-slate-700">{item.description}</p>
                                        <span className={`font-bold px-2 py-0.5 rounded-full border text-xs ${getSeverityClasses(item.severity)}`}>
                                            {item.severity}
                                        </span>
                                    </div>
                                    <p className="text-slate-600"><span className="font-semibold">Gợi ý:</span> {item.suggestion}</p>
                                    <blockquote className="mt-1 border-l-2 border-slate-300 pl-2 italic text-slate-500">
                                      {item.evidence}
                                    </blockquote>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
        </div>
    );
};

const AnalysisResultDisplay: React.FC<{ report: ConsultingReport; onGenerateRequest: (req: string) => void; }> = ({ report, onGenerateRequest }) => {
    const caseTypeLabel: Record<LitigationType | 'unknown', string> = {
      civil: 'Dân sự', criminal: 'Hình sự', administrative: 'Hành chính', unknown: 'Chưa xác định'
    };
    
    return (
        <div className="space-y-4">
            <InfoCard icon={<DiscussionIcon className="w-5 h-5"/>} title="Điểm quan trọng cần trao đổi">
                <ul className="list-disc list-inside space-y-1.5">{report.discussionPoints.map((p, i) => <li key={i}>{p}</li>)}</ul>
            </InfoCard>
            <InfoCard icon={<CaseInfoIcon className="w-5 h-5"/>} title="Thông tin Vụ việc">
                <p><span className="font-semibold">Loại vụ việc:</span> {caseTypeLabel[report.caseType]}</p>
                <p><span className="font-semibold">Giai đoạn sơ bộ:</span> {report.preliminaryStage}</p>
            </InfoCard>
            {report.legalLoopholes && report.legalLoopholes.length > 0 && (
                <InfoCard icon={<ExclamationTriangleIcon className="w-5 h-5"/>} title="Lỗ hổng Pháp lý Tiềm ẩn">
                     <LegalLoopholesDisplay loopholes={report.legalLoopholes} />
                </InfoCard>
            )}
            <InfoCard icon={<DocumentSuggestionIcon className="w-5 h-5"/>} title="Đề xuất Tiếp theo">
                <div className="flex flex-col items-start gap-2">
                    {report.suggestedDocuments.map((doc, i) => (
                        <button key={i} onClick={() => onGenerateRequest(doc)} className="text-left w-full p-2 bg-blue-50 text-blue-800 font-medium rounded-md hover:bg-blue-100 text-sm flex items-center gap-2 transition-colors">
                            <PlusIcon className="w-4 h-4 shrink-0" />{doc}
                        </button>
                    ))}
                </div>
            </InfoCard>
        </div>
    );
};

const GenerationSection: React.FC<{
    onGenerate: (req: string) => void;
    isLoading: boolean;
    error: string | null;
    generatedText: string;
    currentRequest: string;
    setCurrentRequest: (req: string) => void;
}> = ({ onGenerate, isLoading, error, generatedText, currentRequest, setCurrentRequest }) => {
    
    const handleCopyToClipboard = () => {
        if (generatedText) {
            navigator.clipboard.writeText(generatedText);
            alert("Đã sao chép vào bộ nhớ tạm!");
        }
    };
    
    return (
        <div className="space-y-4 pt-6 border-t border-slate-200">
            <textarea
                value={currentRequest}
                onChange={(e) => setCurrentRequest(e.target.value)}
                placeholder="Nhập yêu cầu soạn thảo..."
                className="input-base w-full h-24 bg-white"
            />
            <button
                onClick={() => onGenerate(currentRequest)}
                disabled={isLoading || !currentRequest.trim()}
                className="w-full py-2 px-4 bg-slate-700 text-white font-semibold text-sm rounded-lg hover:bg-slate-800 disabled:bg-slate-300 transition-colors flex items-center justify-center gap-2"
            >
                {isLoading ? <><Loader /> <span>Đang soạn thảo...</span></> : 'Soạn thảo theo Yêu cầu'}
            </button>
            {error && <Alert message={error} type="error" />}

            <div className="rounded-xl bg-white border border-slate-200 p-4 overflow-y-auto min-h-[250px] relative shadow-inner">
                {generatedText && !isLoading && (
                    <button onClick={handleCopyToClipboard} className="absolute top-3 right-3 bg-slate-200 text-slate-700 px-2.5 py-1 text-xs font-semibold rounded-md hover:bg-slate-300 z-10">Copy</button>
                )}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500"><Loader /><p className="mt-4">AI đang tư duy...</p></div>
                )}
                {!isLoading && !generatedText && (
                    <div className="flex items-center justify-center h-full text-slate-400 text-center"><p>Văn bản do AI tạo sẽ xuất hiện ở đây.</p></div>
                )}
                {generatedText && <pre className="whitespace-pre-wrap break-words text-slate-800 font-sans">{generatedText}</pre>}
            </div>
        </div>
    );
};