
import React, { useState } from 'react';
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

// --- Helper to render text with tactical annotations ---
const TacticalTextRenderer: React.FC<{ text: string }> = ({ text }) => {
    const parts = text.split(/(<tactical tip=".*?">.*?<\/tactical>)/g);
    return (
        <div className="whitespace-pre-wrap break-words text-slate-800 font-sans pt-8">
            {parts.map((part, index) => {
                const match = part.match(/<tactical tip="(.*?)">(.*?)<\/tactical>/);
                if (match) {
                    const tip = match[1];
                    const content = match[2];
                    return (
                        <span key={index} className="relative group cursor-help border-b-2 border-purple-400 bg-purple-50 px-0.5 rounded text-purple-900 font-medium">
                            {content}
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                                <strong className="block text-amber-400 mb-1">Mẹo chiến thuật:</strong>
                                {tip}
                                <svg className="absolute text-gray-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                            </span>
                        </span>
                    );
                }
                return <span key={index}>{part}</span>;
            })}
        </div>
    );
};

export const QuickDraftGenerator: React.FC = () => {
    const [request, setRequest] = useState('');
    const [tone, setTone] = useState<ToneOption>('assertive');
    const [terminology, setTerminology] = useState<'legal' | 'plain'>('legal');
    const [detail, setDetail] = useState<'concise' | 'detailed'>('concise');
    const [outputFormat, setOutputFormat] = useState<'text' | 'markdown'>('text');
    const [useTacticalMode, setUseTacticalMode] = useState(false);

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
            const result = await generateParagraph(request, options, useTacticalMode);
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
            // Remove tactical tags before refining to avoid confusing the AI, or keep them if robust enough.
            // For simplicity, we refine the raw text.
            const cleanText = generatedText.replace(/<tactical tip=".*?">(.*?)<\/tactical>/g, '$1');
            const refinedResult = await refineText(cleanText, mode);
            setGeneratedText(refinedResult);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi khi hoàn thiện văn bản.');
        } finally {
            setIsRefining(false);
            setRefiningMode(null);
        }
    };

    const handleCopyToClipboard = () => {
        const cleanText = generatedText.replace(/<tactical tip=".*?">(.*?)<\/tactical>/g, '$1');
        navigator.clipboard.writeText(cleanText);
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
                    
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <label className="flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={useTacticalMode} 
                                onChange={(e) => setUseTacticalMode(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            <span className="ms-3 text-sm font-bold text-purple-900">Bật "Chú thích Chiến thuật" (Tactical Annotation)</span>
                        </label>
                        <p className="text-xs text-purple-700 mt-1 ml-14">AI sẽ giải thích lý do chiến lược đằng sau các từ ngữ được chọn.</p>
                    </div>
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
                                Copy (Sạch)
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
                        <TacticalTextRenderer text={generatedText} />
                    )}
                </div>
            </div>
        </div>
    );
};
