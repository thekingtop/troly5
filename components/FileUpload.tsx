
import React, { useCallback, useRef, useState, useEffect } from 'react';
import type { UploadedFile, FileCategory } from '../types.ts';
import { fileCategoryLabels } from '../constants.ts';
import { FileIcon } from './icons/FileIcon.tsx';
import { PdfIcon } from './icons/PdfIcon.tsx';
import { ImageIcon } from './icons/ImageIcon.tsx';
import { TrashIcon } from './icons/TrashIcon.tsx';
import { WordIcon } from './icons/WordIcon.tsx';
import { ExcelIcon } from './icons/ExcelIcon.tsx';
import { Loader } from './Loader.tsx';
import { ZipIcon } from './icons/ZipIcon.tsx';

// Access JSZip from the window object, as it's loaded via CDN
declare var JSZip: any;

interface FileUploadProps {
  files: UploadedFile[];
  setFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
  onPreview: (file: UploadedFile) => void;
}

const getFileIcon = (fileType: string, fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';

  if (fileType.startsWith('image/')) return <ImageIcon className="w-8 h-8 text-blue-500" />;
  if (extension === 'pdf') return <PdfIcon className="w-8 h-8 text-red-500" />;
  if (['doc', 'docx'].includes(extension)) return <WordIcon className="w-8 h-8 text-blue-600" />;
  if (['xls', 'xlsx'].includes(extension)) return <ExcelIcon className="w-8 h-8 text-green-600" />;
  if (extension === 'zip') return <ZipIcon className="w-8 h-8 text-amber-600" />;

  return <FileIcon className="w-8 h-8 text-slate-500" />;
};

export const FileUpload: React.FC<FileUploadProps> = ({ files, setFiles, onPreview }) => {
  const dragItem = useRef<number | null>(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState<number | null>(null);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  
  const [isZipping, setIsZipping] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleFileChange = useCallback((newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return;

    const filesToAdd: UploadedFile[] = Array.from(newFiles).map(file => ({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        category: 'Uncategorized',
        status: 'pending', // Set initial status to 'pending'
        error: undefined,
    }));
    
    // The App component will now handle the processing logic
    setFiles(prev => [...prev, ...filesToAdd]);

  }, [setFiles]);

  const handleCategoryChange = (fileId: string, newCategory: FileCategory) => {
    setFiles(prevFiles =>
      prevFiles.map(file =>
        file.id === fileId ? { ...file, category: newCategory } : file
      )
    );
  };

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(false);
    handleFileChange(event.dataTransfer.files);
  }, [handleFileChange]);

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
     setIsDraggingOver(true);
  };
  
  const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
     setIsDraggingOver(false);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const handleSort = () => {
    if (dragItem.current === null || dragOverItemIndex === null || dragItem.current === dragOverItemIndex) return;
    
    const filesCopy = [...files];
    const draggedItemContent = filesCopy.splice(dragItem.current, 1)[0];
    filesCopy.splice(dragOverItemIndex, 0, draggedItemContent);
    
    dragItem.current = null;
    
    setFiles(filesCopy);
  };
  
  const handleDownloadZip = async () => {
    if (files.length === 0 || isZipping) return;
    setIsZipping(true);
    
    const zip = new JSZip();
    files.forEach(uploadedFile => {
        zip.file(uploadedFile.file.name, uploadedFile.file);
    });
    
    try {
        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Ho_so_Vu_viec.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Failed to create ZIP file", error);
    } finally {
        setIsZipping(false);
    }
};


  return (
    <div className="space-y-3">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`relative flex flex-col items-center justify-center w-full p-5 border-2 border-dashed rounded-lg transition-colors duration-300 ${isDraggingOver ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}
      >
        <input
          type="file"
          multiple
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={(e) => handleFileChange(e.target.files)}
          accept=".png,.jpg,.jpeg,.pdf,.doc,.docx,.xls,.xlsx,.zip"
        />
        <div className="text-center pointer-events-none">
          <svg className="mx-auto h-10 w-10 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
          <p className="mt-2 text-sm text-slate-600">
            <span className="font-semibold text-blue-600">Kéo và thả tệp</span> hoặc click để chọn
          </p>
          <p className="text-xs text-slate-400">PNG, JPG, PDF, DOCX, XLSX, ZIP. Kéo thả để sắp xếp.</p>
        </div>
      </div>
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-700">Tài liệu đã tải lên ({files.length}):</h3>
             <button
                onClick={handleDownloadZip}
                disabled={isZipping}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-slate-100 text-slate-700 font-semibold rounded-md hover:bg-slate-200 disabled:opacity-50 transition-colors"
                title="Tải về toàn bộ hồ sơ dưới dạng file .zip"
            >
                {isZipping ? <Loader /> : <ZipIcon className="w-4 h-4" />}
                Tải về (.zip)
            </button>
          </div>
          <ul className="max-h-60 overflow-y-auto space-y-2 pr-2 -mr-2" onDragLeave={() => setDragOverItemIndex(null)}>
            {files.map((uploadedFile, index) => {
               const isItemDragging = draggedItemIndex === index;
               const isDragOver = dragOverItemIndex === index;
               const itemClasses = `flex items-center justify-between p-2 bg-white rounded-lg cursor-grab active:cursor-grabbing relative overflow-hidden transition-all duration-200 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 soft-shadow ${isItemDragging ? 'dragging' : ''} ${isDragOver ? 'drag-placeholder' : ''}`;

              return(
                <li 
                  key={uploadedFile.id}
                  draggable
                  onDragStart={() => {
                    dragItem.current = index;
                    setDraggedItemIndex(index);
                  }}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    setDragOverItemIndex(index);
                  }}
                  onDragEnd={() => {
                    handleSort();
                    setDraggedItemIndex(null);
                    setDragOverItemIndex(null);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  className={itemClasses}
                >
                  <div className="flex items-center gap-3 flex-grow min-w-0">
                    <div 
                       className="flex-shrink-0 cursor-pointer p-1 rounded-md hover:bg-slate-200" 
                       onClick={() => onPreview(uploadedFile)}
                       title="Xem trước tệp"
                     >
                       {getFileIcon(uploadedFile.file.type, uploadedFile.file.name)}
                     </div>
                    <div className="flex-grow min-w-0">
                      <p 
                        className="text-sm text-slate-800 font-medium truncate cursor-pointer"
                        onClick={() => onPreview(uploadedFile)}
                        title={uploadedFile.file.name}
                      >
                        {uploadedFile.file.name}
                      </p>
                       <select
                        value={uploadedFile.category}
                        onChange={(e) => handleCategoryChange(uploadedFile.id, e.target.value as FileCategory)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 w-full text-xs p-1 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-700"
                        aria-label={`Phân loại cho tệp ${uploadedFile.file.name}`}
                      >
                        {Object.entries(fileCategoryLabels).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFile(uploadedFile.id)} 
                    className="p-1.5 rounded-full hover:bg-slate-200 flex-shrink-0 z-10 ml-2 transition-colors"
                    title="Xóa tệp"
                  >
                    <TrashIcon className="w-5 h-5 text-slate-500 hover:text-red-500" />
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  );
};