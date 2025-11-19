
import React, { useState, useRef, useEffect } from 'react';
import { generateDocxFromHtml } from '../services/exportService.ts';
import { WordIcon } from './icons/WordIcon.tsx';
import { Loader } from './Loader.tsx';

// Simple Copy Icon if import fails
const CopyIconSimple: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m9.75 11.625-3.75-3.75" />
    </svg>
);

interface DocumentEditorProps {
    initialContent: string; // Markdown string from AI
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({ initialContent }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [htmlContent, setHtmlContent] = useState('');
    const [isExporting, setIsExporting] = useState(false);

    // Simple Markdown to HTML converter (Basic)
    const parseMarkdown = (md: string) => {
        if (!md) return '';
        let html = md
            // Headers
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            // Bold
            .replace(/\*\*(.*?)\*\*/gim, '<b>$1</b>')
            // Italic
            .replace(/\*(.*?)\*/gim, '<i>$1</i>')
            // Lists
            .replace(/^\- (.*$)/gim, '<li>$1</li>')
            // Newlines to Paragraphs (simple logic)
            .split('\n\n').map(para => {
                if (para.trim().startsWith('<h') || para.trim().startsWith('<li>')) return para;
                return `<p>${para.replace(/\n/g, '<br>')}</p>`;
            }).join('');
            
        // Wrap lists
        html = html.replace(/<\/li><li>/g, '</li><li>');
        // A very basic list wrapper - typically needs regex lookahead but for simple AI output this might suffice or just let bullets render as lines
        // Improving list wrapping:
        // This simple parser might leave <li> outside <ul>. Browsers handle this loosely, but better structure is preferred.
        // For now, we rely on visual simulation.
        
        return html;
    };

    useEffect(() => {
        if (initialContent) {
            setHtmlContent(parseMarkdown(initialContent));
        }
    }, [initialContent]);

    const handleCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    };

    const handleExport = async () => {
        if (!editorRef.current) return;
        setIsExporting(true);
        try {
            await generateDocxFromHtml(editorRef.current.innerHTML, 'Van_ban_du_thao.docx');
        } catch (e) {
            console.error(e);
            alert("Lỗi xuất file.");
        } finally {
            setIsExporting(false);
        }
    };
    
    const handleCopy = () => {
        if (!editorRef.current) return;
        
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        
        document.execCommand('copy');
        selection?.removeAllRanges();
        alert("Đã sao chép văn bản (giữ nguyên định dạng). Bạn có thể dán trực tiếp vào Word.");
    };

    return (
        <div className="flex flex-col h-full bg-slate-100 rounded-lg overflow-hidden border border-slate-300">
            {/* Toolbar */}
            <div className="bg-white border-b border-slate-200 p-2 flex items-center gap-2 flex-wrap shadow-sm z-10">
                <div className="flex gap-1 border-r pr-2 mr-2 border-slate-200">
                    <button onClick={() => handleCommand('bold')} className="p-1.5 hover:bg-slate-100 rounded font-bold text-slate-700 w-8" title="In đậm">B</button>
                    <button onClick={() => handleCommand('italic')} className="p-1.5 hover:bg-slate-100 rounded italic text-slate-700 w-8" title="In nghiêng">I</button>
                    <button onClick={() => handleCommand('underline')} className="p-1.5 hover:bg-slate-100 rounded underline text-slate-700 w-8" title="Gạch chân">U</button>
                </div>
                <div className="flex gap-1 border-r pr-2 mr-2 border-slate-200">
                     <button onClick={() => handleCommand('justifyLeft')} className="p-1.5 hover:bg-slate-100 rounded text-slate-700" title="Căn trái">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" /></svg>
                    </button>
                    <button onClick={() => handleCommand('justifyCenter')} className="p-1.5 hover:bg-slate-100 rounded text-slate-700" title="Căn giữa">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                     <button onClick={() => handleCommand('justifyRight')} className="p-1.5 hover:bg-slate-100 rounded text-slate-700" title="Căn phải">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M4 18h16" /></svg>
                    </button>
                    <button onClick={() => handleCommand('justifyFull')} className="p-1.5 hover:bg-slate-100 rounded text-slate-700" title="Căn đều">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                </div>
                 <div className="flex gap-2 ml-auto">
                     <button onClick={handleCopy} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors">
                        <CopyIconSimple className="w-4 h-4"/> Copy
                     </button>
                     <button onClick={handleExport} disabled={isExporting} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors disabled:bg-slate-400">
                        {isExporting ? <Loader /> : <WordIcon className="w-4 h-4 text-white"/>} Xuất DOCX
                     </button>
                 </div>
            </div>

            {/* Editor Canvas (A4 Simulation) */}
            <div className="flex-grow overflow-y-auto bg-slate-200 p-8 flex justify-center">
                <div 
                    ref={editorRef}
                    contentEditable
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                    className="bg-white shadow-lg min-h-[29.7cm] w-[21cm] p-[2.5cm] outline-none text-slate-900 text-justify font-serif leading-relaxed whitespace-pre-wrap break-words"
                    style={{ 
                        fontFamily: '"Times New Roman", Times, serif',
                        fontSize: '13pt',
                        lineHeight: '1.5'
                    }}
                    onInput={(e) => setHtmlContent(e.currentTarget.innerHTML)}
                />
            </div>
        </div>
    );
};
