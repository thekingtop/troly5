
import React, { useState, useCallback } from 'react';
import { generateDocumentFromTemplate, extractInfoFromFile, generateFieldContent } from '../services/geminiService.ts';
import { Loader } from './Loader.tsx';
import { MagicIcon } from './icons/MagicIcon.tsx';
import { FileImportIcon } from './icons/FileImportIcon.tsx';
import type { DocType, FormData, UploadedFile } from '../types.ts';
import { DOC_TYPE_FIELDS, FIELD_LABELS, REGIONAL_COURTS } from '../constants.ts';
import { DocumentEditor } from './DocumentEditor.tsx';

const DOC_TYPE_LABELS: Record<DocType, string> = {
    '': '--- Chọn loại văn bản ---',
    legalServiceContract: 'Hợp đồng Dịch vụ Pháp lý',
    demandLetter: 'Thư yêu cầu',
    powerOfAttorney: 'Giấy ủy quyền',
    meetingMinutes: 'Biên bản làm việc',
    lawsuit: 'Đơn khởi kiện',
    evidenceList: 'Bản kê khai chứng cứ',
    civilMatterPetition: 'Đơn yêu cầu giải quyết việc dân sự',
    statement: 'Bản tự khai',
    appeal: 'Đơn kháng cáo',
    civilContract: 'Hợp đồng Dân sự',
    businessRegistration: 'Hồ sơ Đăng ký Kinh doanh',
    divorcePetition: 'Đơn xin ly hôn',
    will: 'Di chúc',
    enforcementPetition: 'Đơn yêu cầu thi hành án',
    complaint: 'Đơn khiếu nại',
    reviewPetition: 'Đơn đề nghị Giám đốc thẩm/Tái thẩm',
    inheritanceWaiver: 'Văn bản từ chối nhận di sản',
    statementOfOpinion: 'Bản trình bày ý kiến',
    defenseStatement: 'Bản bào chữa cho Bị đơn',
    enterpriseRegistration: 'Hồ sơ Đăng ký Doanh nghiệp',
    householdRegistration: 'Hồ sơ Đăng ký Hộ kinh doanh',
    landRegistrationApplication: 'Đơn Đăng ký Biến động Đất đai',
    divorceAgreement: 'Thỏa thuận Ly hôn',
    noContactOrder: 'Đơn yêu cầu cấm tiếp xúc',
};

const FieldLabel: React.FC<{ fieldName: string }> = ({ fieldName }) => {
    const formatted = fieldName
        .replace(/([A-Z])/g, ' $1') // Add space before uppercase letters
        .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter
    return <>{FIELD_LABELS[fieldName] || formatted}</>;
};

export const DocumentGenerator: React.FC = () => {
    const [docType, setDocType] = useState<DocType>('');
    const [formData, setFormData] = useState<FormData>({});
    const [generatedText, setGeneratedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [isGeneratingField, setIsGeneratingField] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleDocTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newDocType = e.target.value as DocType;
        setDocType(newDocType);
        setFormData({}); // Reset form data when type changes
        setGeneratedText('');
        setError(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !docType) return;

        setError(null);
        setIsExtracting(true);
        try {
            const uploadedFile: UploadedFile = {
                id: file.name, file, preview: null,
                category: 'Uncategorized', status: 'pending'
            };
            const extractedData = await extractInfoFromFile(uploadedFile, docType);
            setFormData(prev => ({ ...prev, ...extractedData }));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi không xác định khi trích xuất.');
        } finally {
            setIsExtracting(false);
        }
    };

    const handleGenerateField = async (fieldName: string) => {
        setError(null);
        setIsGeneratingField(fieldName);
        try {
            const result = await generateFieldContent(formData, DOC_TYPE_LABELS[docType], fieldName);
            setFormData(prev => ({...prev, [fieldName]: result}));
        } catch (err) {
             setError(err instanceof Error ? err.message : 'Lỗi khi tạo nội dung.');
        } finally {
            setIsGeneratingField(null);
        }
    }

    const handleGenerateDocument = async () => {
        if (!docType) {
            setError('Vui lòng chọn loại văn bản.');
            return;
        }
        setError(null);
        setIsLoading(true);
        setGeneratedText('');
        try {
            const result = await generateDocumentFromTemplate(docType, formData);
            setGeneratedText(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi không xác định khi tạo văn bản.');
        } finally {
            setIsLoading(false);
        }
    };

    const currentFields = DOC_TYPE_FIELDS[docType] || [];

    return (
        <div className="w-full h-full p-1 flex flex-col">
            <h2 className="text-2xl font-bold text-slate-900 mb-2 flex-shrink-0">Soạn thảo Văn bản theo Mẫu</h2>
            <p className="text-sm text-slate-600 mb-4 flex-shrink-0">Chọn loại văn bản, điền thông tin, và để AI giúp bạn soạn thảo.</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full overflow-hidden">
                {/* --- Left Column: Form (4 Cols) --- */}
                <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-2 h-full">
                     <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <label htmlFor="docType" className="block text-base font-bold text-slate-800 mb-2">1. Chọn loại văn bản</label>
                        <select id="docType" value={docType} onChange={handleDocTypeChange} className="w-full p-3 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500">
                           {Object.entries(DOC_TYPE_LABELS).map(([key, label]) => (
                               <option key={key} value={key} disabled={key === ''}>{label}</option>
                           ))}
                        </select>
                     </div>

                     {docType && (
                         <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg animate-fade-in flex-grow flex flex-col min-h-0">
                            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                                <h3 className="text-base font-bold text-slate-800">2. Cung cấp thông tin</h3>
                                <label className="relative flex items-center gap-2 px-3 py-1.5 text-xs bg-white text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 cursor-pointer disabled:opacity-50 font-semibold">
                                   {isExtracting ? <Loader/> : <FileImportIcon className="w-4 h-4" />}
                                   <span>Điền từ tệp...</span>
                                   <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} disabled={isExtracting} accept=".pdf,.doc,.docx" />
                                </label>
                            </div>
                            <div className="space-y-4 overflow-y-auto flex-grow pr-2 -mr-2">
                               {currentFields.map(field => {
                                   const isTextArea = field.toLowerCase().includes('content') || field.toLowerCase().includes('summary') || field.toLowerCase().includes('request') || field.toLowerCase().includes('actions') || field.toLowerCase().includes('analysis') || field.toLowerCase().includes('basis') || field.toLowerCase().includes('arguments') || field.toLowerCase().includes('evidence') || field.toLowerCase().includes('circumstances');
                                   
                                   if (field === 'courtName') {
                                    return (
                                        <div key={field}>
                                            <label htmlFor={field} className="block text-sm font-semibold text-slate-700 mb-1"><FieldLabel fieldName={field} /></label>
                                            <input
                                                type="text"
                                                id={field}
                                                name={field}
                                                value={formData[field] || ''}
                                                onChange={handleInputChange}
                                                className="w-full p-2 border border-slate-300 rounded-md bg-white"
                                                list="regional-courts-list"
                                            />
                                            <datalist id="regional-courts-list">
                                                {REGIONAL_COURTS.map(court => <option key={court} value={court} />)}
                                            </datalist>
                                        </div>
                                    )
                                   }

                                   return (
                                       <div key={field}>
                                           <label htmlFor={field} className="block text-sm font-semibold text-slate-700 mb-1"><FieldLabel fieldName={field} /></label>
                                           <div className="relative">
                                              {isTextArea ? (
                                                  <textarea id={field} name={field} value={formData[field] || ''} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-md min-h-[100px] bg-white" />
                                              ) : (
                                                  <input type="text" id={field} name={field} value={formData[field] || ''} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-md bg-white" />
                                              )}
                                              {isTextArea && (
                                                <button onClick={() => handleGenerateField(field)} disabled={isGeneratingField === field} title="Gợi ý nội dung bằng AI" className="absolute bottom-2 right-2 p-1.5 bg-slate-200 text-blue-600 rounded-md hover:bg-slate-300 disabled:opacity-50">
                                                    {isGeneratingField === field ? <Loader /> : <MagicIcon className="w-4 h-4"/>}
                                                </button>
                                              )}
                                           </div>
                                       </div>
                                   )
                               })}
                            </div>
                         </div>
                     )}
                     
                     <button onClick={handleGenerateDocument} disabled={isLoading || !docType || currentFields.length === 0} className="w-full py-3 px-4 bg-blue-600 text-white font-bold text-base rounded-lg hover:bg-blue-700 disabled:bg-slate-300 transition-all flex items-center justify-center gap-2 flex-shrink-0 shadow-md">
                         {isLoading ? (<><Loader/><span>Đang soạn thảo...</span></>) : 'Soạn thảo & Xem trước'}
                     </button>
                     {error && <p className="text-red-600 text-center mt-2 text-sm">{error}</p>}
                </div>

                {/* --- Right Column: Result (8 Cols) --- */}
                <div className="lg:col-span-8 flex flex-col h-full min-h-[600px]">
                    <h3 className="text-base font-bold text-slate-800 mb-2 flex-shrink-0">3. Văn bản được tạo (Chỉnh sửa & Xuất)</h3>
                    <div className="flex-grow h-full rounded-xl overflow-hidden border border-slate-300 shadow-inner bg-slate-100">
                         {isLoading && (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500"><Loader /><p className="mt-4">AI đang tư duy và soạn thảo...</p></div>
                        )}
                        {!isLoading && !generatedText && (
                            <div className="flex items-center justify-center h-full text-slate-400 text-center"><p>Văn bản do AI tạo sẽ xuất hiện ở đây.</p></div>
                        )}
                        {generatedText && !isLoading && (
                            <DocumentEditor initialContent={generatedText} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};