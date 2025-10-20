
import React from 'react';
import type { UploadedFile } from '../types.ts';
import { Loader } from './Loader.tsx';
import { WordIcon } from './icons/WordIcon.tsx';
import { ExcelIcon } from './icons/ExcelIcon.tsx';
import { PdfIcon } from './icons/PdfIcon.tsx';
import { ImageIcon } from './icons/ImageIcon.tsx';
import { FileIcon } from './icons/FileIcon.tsx';

const getFileIcon = (fileType: string, fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    const iconProps = { className: "w-7 h-7 flex-shrink-0" };
    if (fileType.startsWith('image/')) return <ImageIcon {...iconProps} />;
    if (extension === 'pdf') return <PdfIcon {...iconProps} />;
    if (['doc', 'docx'].includes(extension)) return <WordIcon {...iconProps} />;
    if (['xls', 'xlsx'].includes(extension)) return <ExcelIcon {...iconProps} />;
    return <FileIcon {...iconProps} />;
};

export const ProcessingProgress: React.FC<{
    files: UploadedFile[];
    onContinue: () => void;
    onCancel: () => void;
    isFinished: boolean;
    hasTextContent: boolean;
}> = ({ files, onContinue, onCancel, isFinished, hasTextContent }) => {
    const completedCount = files.filter(f => f.status === 'completed' || f.status === 'failed').length;
    const successfulCount = files.filter(f => f.status === 'completed').length;
    const failedCount = files.filter(f => f.status === 'failed').length;
    const totalCount = files.length;
    const overallProgress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    const canContinue = successfulCount > 0 || (totalCount === 0 && hasTextContent) || (totalCount > 0 && isFinished);

    const getStatusPill = (status: UploadedFile['status']) => {
        switch (status) {
            case 'pending': return <span className="text-xs font-medium text-slate-500">Đang chờ...</span>;
            case 'processing': return <div className="flex items-center gap-1.5"><Loader /><span className="text-xs font-medium text-blue-600">Đang xử lý...</span></div>;
            case 'completed': return <span className="text-xs font-bold text-green-600">Hoàn thành</span>;
            case 'failed': return <span className="text-xs font-bold text-red-600">Thất bại</span>;
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            role="dialog" aria-modal="true" aria-labelledby="progress-dialog-title"
        >
            <div className="bg-white rounded-xl shadow-2xl p-6 w-11/12 max-w-2xl flex flex-col max-h-[90vh] soft-shadow-lg">
                <h3 id="progress-dialog-title" className="text-xl font-bold text-slate-900 mb-2">Tiền xử lý & Phân loại Hồ sơ</h3>
                <p className="text-sm text-slate-600 mb-4">AI đang đọc và phân loại tài liệu để chuẩn bị phân tích. Vui lòng đợi trong giây lát.</p>
                <div
                    className="w-full bg-slate-200 rounded-full h-3 mb-1"
                    role="progressbar" aria-valuenow={overallProgress} aria-valuemin={0} aria-valuemax={100}
                >
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 animate-progress-stripes" style={{ width: `${overallProgress}%` }}></div>
                </div>
                <p className="text-sm text-slate-600 text-center mb-4" aria-live="polite">Hoàn thành {completedCount} / {totalCount} tệp</p>
                <div className="flex-grow overflow-y-auto space-y-2 pr-2 -mr-4 border-t border-b border-slate-200 py-3 my-2">
                    {files.map(file => (
                        <div key={file.id} className={`p-2 rounded-lg flex items-center gap-3 transition-colors duration-200 ${file.status === 'failed' ? 'bg-red-50' : 'bg-slate-50 hover:bg-slate-100'}`}>
                            {getFileIcon(file.file.type, file.file.name)}
                            <div className="flex-grow min-w-0">
                                <p className="text-sm font-medium text-slate-800 truncate">{file.file.name}</p>
                                {file.status === 'failed' && file.error && (
                                    <p className="text-xs text-red-700 mt-0.5 truncate" title={file.error}>Lỗi: {file.error}</p>
                                )}
                            </div>
                            <div className="flex-shrink-0 flex items-center gap-2">
                                {getStatusPill(file.status)}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="pt-4 space-y-2">
                    {isFinished && failedCount > 0 && (
                        <div className="p-3 text-center text-sm text-amber-800 bg-amber-100 rounded-md" role="alert">
                           Có {failedCount} tệp xử lý thất bại. Vui lòng thử lại toàn bộ quá trình.
                        </div>
                    )}
                    <div className="flex justify-end gap-3">
                         {!isFinished ? (
                             <button onClick={onCancel} className="px-5 py-2 text-sm font-semibold text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 transition-colors">Hủy bỏ</button>
                         ) : (
                             <>
                                 <button onClick={onCancel} className="px-5 py-2 text-sm font-semibold text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 transition-colors">Đóng</button>
                                 <button onClick={onContinue} disabled={!canContinue} className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors">
                                      {failedCount > 0 ? `Tiếp tục với ${successfulCount} tệp` : 'Bắt đầu Phân tích'}
                                  </button>
                             </>
                         )}
                    </div>
                </div>
            </div>
        </div>
    );
};