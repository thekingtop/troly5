
import React, { useEffect, useState } from 'react';
import type { UploadedFile } from '../types.ts';

interface PreviewModalProps {
    file: UploadedFile | null;
    onClose: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ file, onClose }) => {
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    
    useEffect(() => {
        if (file) {
            // For images, the preview URL is already created and stored.
            // For other files like PDF, we create a new Object URL.
            if (file.preview) {
                setFileUrl(file.preview);
            } else {
                const url = URL.createObjectURL(file.file);
                setFileUrl(url);
                // Clean up the object URL when the component unmounts or file changes
                return () => URL.revokeObjectURL(url);
            }
        }
    }, [file]);

    if (!file || !fileUrl) {
        return null;
    }

    const isImage = file.file.type.startsWith('image/');
    const isPdf = file.file.type === 'application/pdf';

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-xl shadow-2xl p-4 w-11/12 h-5/6 max-w-5xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900 truncate pr-4">{file.file.name}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-red-600 text-3xl leading-none p-1 rounded-full hover:bg-slate-100">&times;</button>
                </div>
                <div className="flex-grow overflow-hidden bg-slate-50 rounded-lg flex flex-col">
                    {isImage && <div className="overflow-auto p-2"><img src={fileUrl} alt="Preview" className="max-w-full h-auto mx-auto" /></div>}
                    {isPdf && (
                        <iframe src={fileUrl} title={`Preview of ${file.file.name}`} className="w-full h-full" frameBorder="0">
                            <div className="flex flex-col items-center justify-center h-full text-center text-slate-600 p-4">
                                <p className="mb-4">Trình duyệt của bạn không hỗ trợ xem trước PDF.</p>
                                <a 
                                    href={fileUrl} 
                                    download={file.file.name} 
                                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Nhấn vào đây để tải tệp về
                                </a>
                            </div>
                        </iframe>
                    )}
                    {!isImage && !isPdf && (
                         <div className="flex items-center justify-center h-full text-slate-500">
                            <p>Không hỗ trợ xem trước cho loại tệp này.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};