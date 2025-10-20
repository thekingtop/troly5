
import React, { useState } from 'react';
// FIX: Import ParagraphGenerationOptions from the correct source file.
import { generateParagraph, refineText } from '../services/geminiService.ts';
import type { ParagraphGenerationOptions } from '../types.ts';
import { Loader } from './Loader.tsx';
import { MagicIcon } from './icons/MagicIcon.tsx';

// Define the extended type for tone options for clarity and reusability
type ToneOption = ParagraphGenerationOptions['tone'];
type RefineMode = 'concise' | 'detailed';

// A reusable radio button group component
const RadioGroup: React.FC<{
    label: string;
    name: string;
    options: { value: string; label: string }[];
    selected: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, name, options, selected, onChange }) => (
    <div>
        <label className="block text-base font-semibold text-slate-800 mb-2">{label}</label>
        <div className="flex flex-wrap gap-2">
            {options.map(option => {
                const inputId = `${name}-option-${option.value}`;
                return (
                    <div key={option.value}>
                        <input
                            type="radio"
                            id={inputId}
                            name={name}
                            value={option.value}
                            checked={selected === option.value}
                            onChange={onChange}
                            className="sr-only"
                            aria-label={option.label}
                        />
                        <label 
                            htmlFor={inputId}
                            className={`cursor-pointer px-4 py-2 text-sm rounded-lg transition-all duration-200 border ${selected === option.value ? 'bg-blue-600 text-white font-semibold border-blue-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}`}
                        >
                            <span>{option.label}</span>
                        </label>
                    </div>
                );
            })}
        </div>
    </div>
);

export const QuickDraftGenerator: React.FC = () => {
    const [request, setRequest] = useState('');
    const [tone, setTone] = useState<ToneOption>('assertive');
    const [terminology, setTerminology] = useState<'legal' | 'plain'>('legal');
    const [detail, setDetail] = useState<'concise' | 'detailed'>('concise');
    const [outputFormat, setOutputFormat] = useState<'text' | 'markdown'>('text');

    const [isLoading, setIsLoading] = useState(false);
    const [isRefining, setIsRefining] = useState(false);
    const [refiningMode, setRefiningMode] = useState<RefineMode | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [generatedText, setGeneratedText] = useState('');

    const handleGenerate = async () => {
        if (!request.trim()) {
            setError('Vui lòng nhập yêu cầu của bạn.');
            return;
        }
        setError(null);
        setIsLoading(true);
        setGeneratedText('');

        try {
            const options: ParagraphGenerationOptions = { tone, terminology, detail, outputFormat };
            const result = await generateParagraph(request, options);
            setGeneratedText(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi không xác định');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefineOutput = async (mode: RefineMode) => {
        if (!generatedText.trim() || isLoading || isRefining) return;
        
        setError(null);
        setIsRefining(true);
        setRefiningMode(mode);
        
        try {
            const refinedResult = await refineText(generatedText, mode);
            setGeneratedText(refinedResult);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi khi hoàn thiện văn bản.');
        } finally {
            setIsRefining(false);
            setRefiningMode(null);
        }
    };

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(generatedText);
    };

    const RefineButton: React.FC<{ mode: RefineMode, text: string }> = ({ mode, text }) => (
        <button
            onClick={() => handleRefineOutput(mode)}
            disabled={isRefining}
            className="flex items-center text-xs px-2 py-1 bg-slate-200 text-blue-600 rounded-md hover:bg-slate-300 disabled:opacity-50"
            title={text}
        >
            {isRefining && refiningMode === mode ? <Loader /> : <MagicIcon className="w-3 h-3 mr-1" />}
            {text}
        </button>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Form */}
            <div className="space-y-6">
                <div>
                    <label htmlFor="draftRequest" className="block text-lg font-bold text-slate-800 mb-3">1. Yêu cầu Soạn thảo</label>
                    <textarea
                        id="draftRequest"
                        value={request}
                        onChange={(e) => setRequest(e.target.value)}
                        placeholder="Ví dụ: Soạn một đoạn văn yêu cầu bên B phải bàn giao mặt bằng theo đúng thỏa thuận trong hợp đồng số..."
                        className="w-full h-40 p-3 bg-gray-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all text-slate-800 placeholder:text-slate-400"
                    />
                </div>

                <div className="space-y-5">
                        <h3 className="text-lg font-bold text-slate-800">2. Tùy chỉnh Văn phong</h3>
                    <RadioGroup
                        label="Giọng văn"
                        name="tone"
                        selected={tone}
                        onChange={(e) => setTone(e.target.value as ToneOption)}
                        options={[
                            { value: 'assertive', label: 'Quyết đoán' },
                            { value: 'persuasive', label: 'Thuyết phục' },
                            { value: 'formal', label: 'Trang trọng' },
                            { value: 'conciliatory', label: 'Hòa giải' },
                            { value: 'warning', label: 'Cảnh báo' },
                        ]}
                    />
                    <RadioGroup
                        label="Mức độ thuật ngữ"
                        name="terminology"
                        selected={terminology}
                        onChange={(e) => setTerminology(e.target.value as 'legal' | 'plain')}
                        options={[
                            { value: 'legal', label: 'Pháp lý cao' },
                            { value: 'plain', label: 'Thông thường' },
                        ]}
                    />
                    <RadioGroup
                        label="Mức độ chi tiết"
                        name="detail"
                        selected={detail}
                        onChange={(e) => setDetail(e.target.value as 'concise' | 'detailed')}
                        options={[
                            { value: 'concise', label: 'Ngắn gọn' },
                            { value: 'detailed', label: 'Chi tiết' },
                        ]}
                    />
                     <RadioGroup
                        label="Định dạng đầu ra"
                        name="outputFormat"
                        selected={outputFormat}
                        onChange={(e) => setOutputFormat(e.target.value as 'text' | 'markdown')}
                        options={[
                            { value: 'text', label: 'Văn bản thường' },
                            { value: 'markdown', label: 'Markdown' },
                        ]}
                    />
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !request}
                    className="w-full py-3 px-4 bg-blue-600 text-white font-bold text-base rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                    {isLoading ? (<><Loader /><span>Đang soạn thảo...</span></>) : 'Tạo Đoạn văn'}
                </button>
                {error && <p className="text-red-500 text-center mt-2">{error}</p>}

            </div>

            {/* Right Column: Generated Text */}
            <div className="flex flex-col">
                <h3 className="text-lg font-bold text-slate-800 mb-3">3. Kết quả</h3>
                <div className="flex-grow rounded-xl bg-slate-50 border border-slate-200 p-4 overflow-y-auto min-h-[400px] relative shadow-inner">
                    {generatedText && !isLoading && (
                        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                            <RefineButton mode="concise" text="Làm gọn"/>
                            <RefineButton mode="detailed" text="Chi tiết hóa"/>
                            <div className="w-px h-4 bg-slate-300"></div>
                             <button onClick={handleCopyToClipboard} className="bg-slate-200 text-slate-700 px-2.5 py-1 text-xs font-semibold rounded-md hover:bg-slate-300 transition-colors">
                                Copy
                            </button>
                        </div>
                    )}
                        {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500">
                            <Loader />
                            <p className="mt-4">AI đang tư duy...</p>
                        </div>
                    )}
                    {!isLoading && !generatedText && (
                        <div className="flex items-center justify-center h-full text-slate-400 text-center">
                            <p>Đoạn văn được tạo sẽ xuất hiện ở đây.</p>
                        </div>
                    )}
                    {generatedText && (
                        <pre className="whitespace-pre-wrap break-words text-slate-800 font-sans pt-8">{generatedText}</pre>
                    )}
                </div>
            </div>
        </div>
    );
};