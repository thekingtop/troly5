import React, { useState, useRef, useEffect } from 'react';
import type { AnalysisReport } from '../types.ts';
import { DragHandleIcon } from './icons/DragHandleIcon.tsx';
import { ExportIcon } from './icons/ExportIcon.tsx';
import { Loader } from './Loader.tsx';

export interface ReportSection {
  id: keyof AnalysisReport | 'customNotesSection';
  title: string;
  enabled: boolean;
}

const initialSections: Omit<ReportSection, 'enabled'>[] = [
  { id: 'customNotesSection', title: 'Ghi chú Tùy chỉnh' },
  { id: 'caseTimeline', title: 'Dòng thời gian Vụ việc' },
  { id: 'legalRelationship', title: '1. Quan hệ pháp luật' },
  { id: 'proceduralStatus', title: '2. Tư cách Tố tụng' },
  { id: 'coreLegalIssues', title: '3. Vấn đề pháp lý cốt lõi' },
  { id: 'requestResolutionPlan', title: '4. Phương án giải quyết theo Yêu cầu' },
  { id: 'applicableLaws', title: '5. Cơ sở pháp lý áp dụng' },
  { id: 'gapAnalysis', title: '6. Phân tích Lỗ hổng & Hành động' },
  { id: 'caseProspects', title: '7. Đánh giá Triển vọng Vụ việc' },
  { id: 'proposedStrategy', title: '8. Đề xuất Lộ trình & Chiến lược' },
  { id: 'contingencyPlan', title: '9. Phương án xử lý nếu thua kiện' },
];


interface CustomizeReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'docx' | 'xlsx' | 'pdf', customizedReport: AnalysisReport, orderedSections: ReportSection[]) => void;
  baseReport: AnalysisReport;
  isExporting: boolean;
  libsReady: boolean;
}

export const CustomizeReportModal: React.FC<CustomizeReportModalProps> = ({ isOpen, onClose, onExport, baseReport, isExporting, libsReady }) => {
  const [sections, setSections] = useState<ReportSection[]>(() => initialSections.map(s => ({ ...s, enabled: true })));
  const [customNotes, setCustomNotes] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => {
    // Reset state when modal opens
    if (isOpen) {
      setSections(initialSections.map(s => ({ ...s, enabled: true })));
      setCustomNotes('');
    }
  }, [isOpen]);

  const handleToggleSection = (id: ReportSection['id']) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const handleSort = () => {
    if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) return;
    
    const sectionsCopy = [...sections];
    const draggedItemContent = sectionsCopy.splice(dragItem.current, 1)[0];
    sectionsCopy.splice(dragOverItem.current, 0, draggedItemContent);
    
    dragItem.current = null;
    dragOverItem.current = null;
    
    setSections(sectionsCopy);
  };
  
  const handleExportClick = (format: 'docx' | 'xlsx' | 'pdf') => {
    const customizedReport: Partial<AnalysisReport> = {};
    const orderedEnabledSections = sections.filter(s => s.enabled);

    if (customNotes.trim() && orderedEnabledSections.some(s => s.id === 'customNotesSection')) {
      customizedReport.customNotes = customNotes.trim();
    }
  
    // Add enabled sections (data) to the report object
    orderedEnabledSections.forEach(section => {
      if (section.id !== 'customNotesSection' && baseReport.hasOwnProperty(section.id as keyof AnalysisReport)) {
        (customizedReport as any)[section.id] = baseReport[section.id as keyof AnalysisReport];
      }
    });
  
    onExport(format, customizedReport as AnalysisReport, orderedEnabledSections);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl p-6 w-11/12 max-w-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center pb-4 border-b border-slate-200">
          <h3 className="text-xl font-bold text-slate-900">Tùy chỉnh Báo cáo</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-red-600 text-3xl p-1 leading-none rounded-full hover:bg-slate-100">&times;</button>
        </div>

        <div className="flex-grow overflow-y-auto space-y-5 py-5 pr-2 -mr-4">
          <div>
            <label htmlFor="customNotes" className="block text-base font-semibold text-slate-800 mb-2">Thêm Ghi chú / Tóm tắt Mở đầu</label>
            <textarea
              id="customNotes"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="Thêm tóm tắt, nhận định cá nhân hoặc các ghi chú khác vào đầu báo cáo..."
              className="w-full h-24 p-2.5 bg-gray-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>
          
          <div>
            <h4 className="text-base font-semibold text-slate-800 mb-2">Sắp xếp và Ẩn/Hiện các Mục</h4>
            <p className="text-sm text-slate-500 mb-3">Kéo và thả để sắp xếp lại thứ tự các mục trong báo cáo.</p>
            <ul className="space-y-2">
              {sections.map((section, index) => {
                const isBeingDragged = isDragging && dragItem.current === index;
                let itemClasses = `flex items-center justify-between p-2 bg-white rounded-lg relative transition-all border border-slate-200 ${section.enabled ? 'hover:bg-slate-50/50' : 'bg-slate-100'}`;
                if (isBeingDragged) itemClasses += ' dragging';
                if (dragOverItem.current === index) itemClasses += ' drag-placeholder';

                return (
                  <li
                    key={section.id}
                    draggable
                    onDragStart={() => {
                      dragItem.current = index;
                      setIsDragging(true);
                    }}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      dragOverItem.current = index;
                    }}
                    onDragEnd={() => {
                      handleSort();
                      setIsDragging(false);
                      dragOverItem.current = null;
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    className={itemClasses}
                  >
                    <div className="flex items-center gap-3 flex-grow min-w-0">
                      <div className="flex-shrink-0 cursor-grab active:cursor-grabbing p-1 text-slate-400" title="Kéo để sắp xếp">
                        <DragHandleIcon className="w-5 h-5" />
                      </div>
                      <span className={`text-sm font-medium ${section.enabled ? 'text-slate-700' : 'text-slate-400 line-through'}`}>{section.title}</span>
                    </div>

                    <div className="flex-shrink-0">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={section.enabled} onChange={() => handleToggleSection(section.id)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="pt-5 border-t border-slate-200">
          <h4 className="text-base font-semibold text-slate-800 mb-3 text-center">Hoàn tất và Xuất file</h4>
           {!libsReady && (
                <div className="text-center text-amber-700 bg-amber-100 p-2 rounded-md text-sm mb-3">
                    Thư viện xuất file đang được tải, vui lòng đợi trong giây lát...
                </div>
            )}
          <div className="grid grid-cols-3 gap-3">
             <button disabled={isExporting || !libsReady} onClick={() => handleExportClick('pdf')} className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:bg-slate-400">
                {isExporting && <Loader />}
                <ExportIcon className="w-4 h-4" />
                <span>Xuất PDF</span>
             </button>
             <button disabled={isExporting || !libsReady} onClick={() => handleExportClick('docx')} className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-400">
                {isExporting && <Loader />}
                <ExportIcon className="w-4 h-4" />
                <span>Xuất DOCX</span>
             </button>
             <button disabled={isExporting || !libsReady} onClick={() => handleExportClick('xlsx')} className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:bg-slate-400">
                {isExporting && <Loader />}
                <ExportIcon className="w-4 h-4" />
                <span>Xuất XLSX</span>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};