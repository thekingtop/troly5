import React, { useState, useRef, useEffect } from 'react';
import type { AnalysisReport, ChatMessage } from '../types.ts';
import { Loader } from './Loader.tsx';
import { MagicIcon } from './icons/MagicIcon.tsx';
import { SendIcon } from './icons/SendIcon.tsx';
import { QuestionIcon } from './icons/QuestionIcon.tsx';

interface IntelligentSearchProps {
    report: AnalysisReport | null;
    onSearch: (query: string) => Promise<void>;
    isLoading: boolean;
    error: string | null;
}

export const IntelligentSearch: React.FC<IntelligentSearchProps> = ({ report, onSearch, isLoading, error }) => {
    const [userInput, setUserInput] = useState('');
    const chatHistory = report?.intelligentSearchChat || [];
    const chatEndRef = useRef<HTMLDivElement>(null);
    const isFirstMessageLoading = isLoading && chatHistory.length === 1 && chatHistory[0].role === 'user';

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;
        onSearch(userInput.trim());
        setUserInput('');
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    if (!report) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 bg-slate-50 rounded-lg border p-6">
                <QuestionIcon className="w-16 h-16 text-slate-300 mb-4" />
                <h2 className="text-xl font-bold text-slate-700">Hỏi đáp Thông minh về Vụ việc</h2>
                <p className="mt-2 max-w-md">Vui lòng chạy phân tích vụ việc trước. Sau khi có báo cáo, bạn có thể đặt câu hỏi chi tiết về hồ sơ tại đây.</p>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col h-full w-full max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                <QuestionIcon className="w-7 h-7 text-blue-600" />
                <span>Hỏi đáp Thông minh</span>
            </h2>
            <p className="text-sm text-slate-600 mb-4">Đặt câu hỏi bằng ngôn ngữ tự nhiên, AI sẽ trả lời dựa trên toàn bộ bối cảnh của hồ sơ đã phân tích.</p>
            
            <div className="flex-grow bg-white border border-slate-200 rounded-lg p-4 mb-4 overflow-y-auto min-h-0">
                {chatHistory.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center">
                        <p>Bắt đầu cuộc trò chuyện bằng cách đặt một câu hỏi bên dưới.</p>
                    </div>
                )}
                <div className="space-y-4">
                    {chatHistory.map((msg, index) => (
                        <div key={index} className={`flex gap-3 animate-fade-in ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'model' && (
                                 <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                                    <MagicIcon className="w-5 h-5 text-white"/>
                                </div>
                            )}
                            <div className={`max-w-[85%] p-3 rounded-lg shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && !isFirstMessageLoading && (
                         <div className="flex gap-3">
                             <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                                <MagicIcon className="w-5 h-5 text-white"/>
                            </div>
                            <div className="max-w-[80%] p-3 rounded-lg bg-slate-100 text-slate-800 flex items-center shadow-sm">
                                <Loader />
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
                 {isFirstMessageLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 p-8">
                        <Loader />
                        <p className="mt-4">AI đang phân tích câu hỏi của bạn dựa trên toàn bộ hồ sơ...</p>
                    </div>
                )}
            </div>

            {error && <p className="text-red-600 text-sm mb-2 text-center">{error}</p>}
            
            <form onSubmit={handleSendMessage} className="flex gap-3">
                <textarea 
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ví dụ: Bên B đã vi phạm điều khoản nào của hợp đồng? (Nhấn Enter để gửi, Shift+Enter để xuống dòng)"
                    className="flex-grow p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 resize-y"
                    disabled={isLoading}
                    rows={2}
                />
                <button type="submit" disabled={isLoading || !userInput.trim()} className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-slate-400 flex items-center justify-center transition-colors">
                    <SendIcon className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
};