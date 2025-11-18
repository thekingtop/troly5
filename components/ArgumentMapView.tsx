import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { AnalysisReport, ArgumentNode, ArgumentEdge, ArgumentNodeType, ChatMessage } from '../types.ts';
import { generateArgumentText, chatAboutArgumentNode } from '../services/geminiService.ts';
import { Loader } from './Loader.tsx';
import { MagicIcon } from './icons/MagicIcon.tsx';
import { DownloadIcon } from './icons/DownloadIcon.tsx';
import { nodeTypeMeta } from '../constants.ts';
import { ChatIcon } from './icons/ChatIcon.tsx';
import { EditIcon } from './icons/EditIcon.tsx';
import { ZoomInIcon } from './icons/ZoomInIcon.tsx';
import { ZoomOutIcon } from './icons/ZoomOutIcon.tsx';
import { ResetZoomIcon } from './icons/ResetZoomIcon.tsx';
import { ArrowUpIcon } from './icons/ArrowUpIcon.tsx';
import { ArrowDownIcon } from './icons/ArrowDownIcon.tsx';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon.tsx';
import { ArrowRightIcon } from './icons/ArrowRightIcon.tsx';
import { PlusIcon } from './icons/PlusIcon.tsx';
import { LinkIcon } from './icons/LinkIcon.tsx';
import { TrashIcon } from './icons/TrashIcon.tsx';
import { CursorArrowRaysIcon } from './icons/CursorArrowRaysIcon.tsx';


// --- Helper Components & Functions ---

// Declare html2canvas from global scope
declare var html2canvas: any;

const ArgumentNodeComponent: React.FC<{
    node: ArgumentNode;
    onMouseDown: (e: React.MouseEvent, id: string) => void;
    isSelected: boolean;
    onClick: (e: React.MouseEvent, id: string) => void;
    onStartEdit: (node: ArgumentNode) => void;
    onStartChat: (node: ArgumentNode) => void;
    onDelete: (id: string) => void;
    isLinkSource: boolean;
}> = ({ node, onMouseDown, isSelected, onClick, onStartEdit, onStartChat, onDelete, isLinkSource }) => {
    const meta = nodeTypeMeta[node.type] || nodeTypeMeta.custom;
    let selectionClass = 'hover:ring-2 hover:ring-blue-300';
    if (isSelected) {
        selectionClass = 'ring-2 ring-offset-2 ring-blue-500';
    } else if (isLinkSource) {
        selectionClass = 'ring-2 ring-offset-2 ring-green-500';
    }


    return (
        <div
            id={`node-${node.id}`}
            className={`absolute p-3 rounded-lg shadow-md cursor-grab active:cursor-grabbing text-xs text-slate-800 w-48 ${meta.color} border-2 ${selectionClass} transition-all duration-150 flex flex-col`}
            style={{ left: node.position.x, top: node.position.y }}
            onMouseDown={(e) => onMouseDown(e, node.id)}
            onClick={(e) => onClick(e, node.id)}
        >
            <div className="font-bold mb-1 flex justify-between items-start">
                <span className="pr-1">{node.label}</span>
                <div className="flex items-center gap-0.5 flex-shrink-0 -mr-1 -mt-1">
                    <button onClick={(e) => { e.stopPropagation(); onStartChat(node); }} className="p-1 rounded hover:bg-black/10" title="Trao đổi với AI"><ChatIcon className="w-4 h-4 text-slate-600"/></button>
                    <button onClick={(e) => { e.stopPropagation(); onStartEdit(node); }} className="p-1 rounded hover:bg-black/10" title="Chỉnh sửa"><EditIcon className="w-4 h-4 text-slate-600"/></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(node.id); }} className="p-1 rounded hover:bg-black/10" title="Xóa khối"><TrashIcon className="w-4 h-4 text-slate-600 hover:text-red-500"/></button>
                </div>
            </div>
            <p>{node.content}</p>
        </div>
    );
};

const ArgumentEdgeComponent: React.FC<{
    edge: ArgumentEdge;
    nodes: ArgumentNode[];
    nodeDimensions: Record<string, { width: number; height: number }>;
    onClick: (id: string) => void;
}> = ({ edge, nodes, nodeDimensions, onClick }) => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);

    if (!sourceNode || !targetNode) return null;
    
    const sourceDims = nodeDimensions[sourceNode.id];
    const targetDims = nodeDimensions[targetNode.id];
    
    // Calculate center of nodes using measured dimensions if available, otherwise fallback
    const x1 = sourceNode.position.x + (sourceDims ? sourceDims.width / 2 : 96);
    const y1 = sourceNode.position.y + (sourceDims ? sourceDims.height / 2 : 40);
    const x2 = targetNode.position.x + (targetDims ? targetDims.width / 2 : 96);
    const y2 = targetNode.position.y + (targetDims ? targetDims.height / 2 : 40);
    
    return (
      <g onClick={() => onClick(edge.id)} className="cursor-pointer">
        <line x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-slate-400 hover:stroke-red-500" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth="10" />
      </g>
    );
};


interface ArgumentEditorProps {
    selectedNodes: ArgumentNode[];
    onDownload: () => void;
    isDownloading: boolean;
}
const ArgumentEditor: React.FC<ArgumentEditorProps> = ({ selectedNodes, onDownload, isDownloading }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedText, setGeneratedText] = useState('');

    useEffect(() => {
        // Clear generated text when selection changes
        setGeneratedText('');
        setError(null);
    }, [selectedNodes]);


    const handleGenerate = async () => {
        if (selectedNodes.length === 0) return;
        setIsLoading(true);
        setError(null);
        setGeneratedText('');
        try {
            const result = await generateArgumentText(selectedNodes);
            setGeneratedText(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi không xác định');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 border-l border-slate-200 p-4">
            <div className="flex justify-between items-center mb-2">
                 <h3 className="text-base font-bold text-slate-800">Soạn thảo Luận cứ</h3>
                 <button
                    onClick={onDownload}
                    disabled={isDownloading}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 disabled:opacity-50"
                    title="Tải bản đồ về dưới dạng ảnh"
                >
                    {isDownloading ? <Loader /> : <DownloadIcon className="w-4 h-4" />}
                    <span>Tải ảnh</span>
                </button>
            </div>
            <div className="flex-grow bg-white border rounded-lg p-3 text-sm space-y-2 overflow-y-auto mb-4 min-h-[150px]">
                <p className="text-xs text-slate-500 mb-2">Chọn các khối trên bản đồ (giữ phím Shift để chọn nhiều) để cung cấp bối cảnh cho AI.</p>
                {selectedNodes.length > 0 ? (
                    selectedNodes.map(node => {
                        const meta = nodeTypeMeta[node.type] || nodeTypeMeta.custom;
                        return (
                            <div key={node.id} className={`p-1.5 rounded text-xs border ${meta.color}`}>
                                <span className="font-bold">{node.label}:</span> {node.content.substring(0, 50)}...
                            </div>
                        )
                    })
                ) : (
                    <p className="text-slate-400 text-center py-4">Chưa có khối nào được chọn.</p>
                )}
            </div>
            <button
                onClick={handleGenerate}
                disabled={isLoading || selectedNodes.length === 0}
                className="w-full py-2.5 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-slate-300 flex items-center justify-center gap-2 mb-4"
            >
                {isLoading ? <><Loader /> <span>Đang tạo...</span></> : <><MagicIcon className="w-5 h-5"/>Tạo Luận cứ</>}
            </button>
            <div className="flex-grow-[2] relative">
                <textarea
                    value={generatedText}
                    onChange={(e) => setGeneratedText(e.target.value)}
                    placeholder={isLoading ? "AI đang soạn thảo..." : "Kết quả sẽ xuất hiện ở đây..."}
                    className="w-full h-full p-3 bg-white border border-slate-200 rounded-lg shadow-inner text-sm font-sans"
                    readOnly={isLoading}
                />
                 {generatedText && (
                    <button onClick={() => navigator.clipboard.writeText(generatedText)} className="absolute top-2 right-2 bg-slate-200 text-slate-700 px-2 py-1 text-xs font-semibold rounded-md hover:bg-slate-300">
                        Copy
                    </button>
                )}
            </div>
             {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </div>
    );
};

const ArgumentNodeEditorModal: React.FC<{
    node: ArgumentNode;
    onSave: (id: string, newContent: string) => void;
    onClose: () => void;
}> = ({ node, onSave, onClose }) => {
    const [content, setContent] = useState(node.content);
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl p-6 w-11/12 max-w-lg" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4">Chỉnh sửa: {node.label}</h3>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full h-48 p-2 border border-slate-300 rounded-md bg-slate-50 focus:ring-1 focus:ring-blue-500"
                />
                <div className="flex justify-end gap-3 mt-4">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold bg-slate-200 rounded-md hover:bg-slate-300">Hủy</button>
                    <button onClick={() => { onSave(node.id, content); onClose(); }} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">Lưu</button>
                </div>
            </div>
        </div>
    );
};

const ArgumentNodeChatModal: React.FC<{
    node: ArgumentNode;
    onSendMessage: (nodeId: string, userMessage: ChatMessage) => Promise<void>;
    onClose: () => void;
    isLoading: boolean;
}> = ({ node, onSendMessage, onClose, isLoading }) => {
    const [userInput, setUserInput] = useState('');
    const chatHistory = node.chatHistory || [];
    const chatEndRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;
        const newUserMessage: ChatMessage = { role: 'user', content: userInput.trim() };
        setUserInput('');
        await onSendMessage(node.id, newUserMessage);
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
        <div className="bg-white rounded-xl shadow-2xl p-4 w-11/12 max-w-2xl flex flex-col h-[70vh]" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center pb-3 border-b mb-3">
              <h3 className="text-lg font-bold">Trao đổi về: {node.label}</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-red-600 text-3xl p-1 leading-none">&times;</button>
          </div>
          <div className="flex-grow bg-slate-50 border rounded-lg p-3 overflow-y-auto space-y-4">
              {chatHistory.map((msg, index) => (
                  <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                      {msg.role === 'model' && (
                           <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                              <MagicIcon className="w-5 h-5 text-white"/>
                          </div>
                      )}
                      <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                  </div>
              ))}
              {isLoading && (
                   <div className="flex gap-3">
                       <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                          <MagicIcon className="w-5 h-5 text-white"/>
                      </div>
                      <div className="max-w-[80%] p-3 rounded-lg bg-slate-100 text-slate-800 flex items-center">
                          <Loader />
                      </div>
                  </div>
              )}
              <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleFormSubmit} className="mt-3 flex gap-2">
              <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Hỏi AI để có giải pháp..." className="flex-grow p-2 border border-slate-300 rounded-md text-sm" disabled={isLoading} />
              <button type="submit" disabled={isLoading || !userInput.trim()} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-slate-400">Gửi</button>
          </form>
        </div>
      </div>
    );
};


// --- Main Component ---
interface ArgumentMapViewProps {
    report: AnalysisReport | null;
    onUpdateReport: (report: AnalysisReport) => void;
}

export const ArgumentMapView: React.FC<ArgumentMapViewProps> = ({ report, onUpdateReport }) => {
    const [nodes, setNodes] = useState<ArgumentNode[]>([]);
    const [edges, setEdges] = useState<ArgumentEdge[]>([]);
    const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
    const [isDownloading, setIsDownloading] = useState(false);
    const [editingNode, setEditingNode] = useState<ArgumentNode | null>(null);
    const [chattingNode, setChattingNode] = useState<ArgumentNode | null>(null);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [nodeDimensions, setNodeDimensions] = useState<Record<string, { width: number, height: number }>>({});
    const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
    const [mode, setMode] = useState<'select' | 'link' | 'delete'>('select');
    const [linkSource, setLinkSource] = useState<string | null>(null);

    const draggingNode = useRef<{ id: string; offset: { x: number; y: number } } | null>(null);
    const isPanning = useRef(false);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const mapRef = useRef<HTMLDivElement>(null);
    const mapContentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (report?.argumentGraph) {
            setNodes(report.argumentGraph.nodes);
            setEdges(report.argumentGraph.edges);
        } else {
            setNodes([]);
            setEdges([]);
        }
    }, [report]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const dimensions: Record<string, { width: number; height: number }> = {};
            nodes.forEach(node => {
                const elem = document.getElementById(`node-${node.id}`);
                if (elem) {
                    dimensions[node.id] = { width: elem.offsetWidth, height: elem.offsetHeight };
                }
            });
            if (Object.keys(dimensions).length > 0 && JSON.stringify(dimensions) !== JSON.stringify(nodeDimensions)) {
                setNodeDimensions(dimensions);
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [nodes, nodeDimensions]);

    const updateReport = (newNodes: ArgumentNode[], newEdges: ArgumentEdge[]) => {
        if (report) {
            onUpdateReport({
                ...report,
                argumentGraph: { nodes: newNodes, edges: newEdges },
            });
        }
    };

    const handleNodeDragStart = (e: React.MouseEvent, id: string) => {
        const node = nodes.find(n => n.id === id);
        if (!node || mode !== 'select' || e.button !== 0) return;

        e.preventDefault();
        e.stopPropagation();

        const offsetX = (e.clientX - transform.x) / transform.scale - node.position.x;
        const offsetY = (e.clientY - transform.y) / transform.scale - node.position.y;

        draggingNode.current = {
            id,
            offset: { x: offsetX, y: offsetY }
        };
    };

    const handleDownloadImage = async () => {
        if (!mapContentRef.current || nodes.length === 0 || typeof html2canvas === 'undefined') {
            alert("Bản đồ trống hoặc thư viện chưa sẵn sàng.");
            return;
        }
        setIsDownloading(true);

        const mapElement = mapContentRef.current;
        const PADDING = 50;

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        nodes.forEach(node => {
            const nodeElement = document.getElementById(`node-${node.id}`);
            if (nodeElement) {
                minX = Math.min(minX, nodeElement.offsetLeft);
                minY = Math.min(minY, nodeElement.offsetTop);
                maxX = Math.max(maxX, nodeElement.offsetLeft + nodeElement.offsetWidth);
                maxY = Math.max(maxY, nodeElement.offsetTop + nodeElement.offsetHeight);
            }
        });
        
        if (minX === Infinity) { minX = 0; minY = 0; maxX = 1000; maxY = 800; }

        try {
            const originalTransform = mapElement.style.transform;
            mapElement.style.transform = '';

            const canvas = await html2canvas(mapElement, {
                x: minX - PADDING,
                y: minY - PADDING,
                width: (maxX - minX) + PADDING * 2,
                height: (maxY - minY) + PADDING * 2,
                scale: 2,
                backgroundColor: '#f8fafc',
                useCORS: true
            });

            mapElement.style.transform = originalTransform;

            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = 'ban_do_lap_luan.png';
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error generating image:", error);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (mode === 'select' && draggingNode.current) {
            const newX = (e.clientX - transform.x) / transform.scale - draggingNode.current.offset.x;
            const newY = (e.clientY - transform.y) / transform.scale - draggingNode.current.offset.y;
            setNodes(prevNodes => prevNodes.map(n => n.id === draggingNode.current?.id ? { ...n, position: { x: newX, y: newY } } : n));
            return;
        }

        if (isPanning.current) {
            const dx = e.clientX - lastMousePos.current.x;
            const dy = e.clientY - lastMousePos.current.y;
            lastMousePos.current = { x: e.clientX, y: e.clientY };
            setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
        }
    };

    const handleMouseUp = () => {
        if (draggingNode.current) {
            updateReport(nodes, edges);
        }
        draggingNode.current = null;
        isPanning.current = false;
        if(mapRef.current) mapRef.current.style.cursor = 'auto';
    };

    const handleMapMouseDown = (e: React.MouseEvent) => {
        if (mode === 'select' && (e.button === 0 || e.button === 2)) { 
            e.preventDefault();
            isPanning.current = true;
            lastMousePos.current = { x: e.clientX, y: e.clientY };
            if(mapRef.current) mapRef.current.style.cursor = 'grabbing';
        }
    };
    
    const handleWheel = (e: React.WheelEvent) => {
        if (!mapRef.current) return;
        e.preventDefault();
        const scaleAmount = 1.1;
        const newScale = e.deltaY > 0 ? transform.scale / scaleAmount : transform.scale * scaleAmount;
        const mapRect = mapRef.current.getBoundingClientRect();
        const mouseX = e.clientX - mapRect.left;
        const mouseY = e.clientY - mapRect.top;
        const pointX = (mouseX - transform.x) / transform.scale;
        const pointY = (mouseY - transform.y) / transform.scale;
        const newX = mouseX - pointX * newScale;
        const newY = mouseY - pointY * newScale;
        setTransform({ x: newX, y: newY, scale: newScale });
    };

    const handleZoomControls = (direction: 'in' | 'out' | 'reset') => {
        if (direction === 'reset') { setTransform({ x: 0, y: 0, scale: 1 }); return; }
        const scaleAmount = direction === 'in' ? 1.25 : 1 / 1.25;
        setTransform(prev => ({...prev, scale: prev.scale * scaleAmount }));
    };

    const handlePanControls = (direction: 'up' | 'down' | 'left' | 'right') => {
        const PAN_AMOUNT = 100;
        setTransform(prev => {
            switch(direction) {
                case 'up': return { ...prev, y: prev.y + PAN_AMOUNT };
                case 'down': return { ...prev, y: prev.y - PAN_AMOUNT };
                case 'left': return { ...prev, x: prev.x + PAN_AMOUNT };
                case 'right': return { ...prev, x: prev.x - PAN_AMOUNT };
                default: return prev;
            }
        })
    };
    
    const handleDeleteNode = (id: string) => {
        if (!window.confirm("Bạn có chắc muốn xóa khối này?")) return;
        const newNodes = nodes.filter(n => n.id !== id);
        const newEdges = edges.filter(e => e.source !== id && e.target !== id);
        setNodes(newNodes);
        setEdges(newEdges);
        updateReport(newNodes, newEdges);
    };

    const handleDeleteEdge = (id: string) => {
        const newEdges = edges.filter(e => e.id !== id);
        setEdges(newEdges);
        updateReport(nodes, newEdges);
    };

    const handleNodeClick = (e: React.MouseEvent, id: string) => {
        switch (mode) {
            case 'select':
                setSelectedNodeIds(prev => {
                    const newSelection = new Set(prev);
                    if (e.shiftKey) { newSelection.has(id) ? newSelection.delete(id) : newSelection.add(id); } 
                    else { if (newSelection.has(id) && newSelection.size === 1) { newSelection.clear(); } else { newSelection.clear(); newSelection.add(id); } }
                    return newSelection;
                });
                break;
            case 'link':
                if (!linkSource) { setLinkSource(id); } 
                else if (linkSource !== id) {
                    const newEdge: ArgumentEdge = { id: `edge-${Date.now()}`, source: linkSource, target: id };
                    const newEdges = [...edges, newEdge];
                    setEdges(newEdges);
                    updateReport(nodes, newEdges);
                    setLinkSource(null);
                    setMode('select');
                }
                break;
            case 'delete': handleDeleteNode(id); break;
        }
    };
    
    const handleCanvasClick = (e: React.MouseEvent) => {
        if (e.target === mapRef.current || e.target === mapContentRef.current) {
            setSelectedNodeIds(new Set());
            if (mode === 'link') setLinkSource(null);
        }
    };

    const handleAddNode = () => {
        const newNode: ArgumentNode = {
            id: `custom-${Date.now()}`,
            type: 'custom',
            label: 'Ghi chú Mới',
            content: 'Nhấp để chỉnh sửa nội dung...',
            position: { x: 50, y: 50 },
        };
        const newNodes = [...nodes, newNode];
        setNodes(newNodes);
        updateReport(newNodes, edges);
    };

    const selectedNodesMemo = useMemo(() => {
        return nodes.filter(node => selectedNodeIds.has(node.id));
    }, [nodes, selectedNodeIds]);

    const handleSaveNodeEdit = (id: string, newContent: string) => {
        const newNodes = nodes.map(n => n.id === id ? { ...n, content: newContent } : n);
        setNodes(newNodes);
        updateReport(newNodes, edges);
    };
    
    const handleSendMessageInNode = async (nodeId: string, userMessage: ChatMessage) => {
        const targetNode = nodes.find(n => n.id === nodeId);
        if (!targetNode) return;
        const updatedHistory = [...(targetNode.chatHistory || []), userMessage];
        const newNodesTemp = nodes.map(n => n.id === nodeId ? { ...n, chatHistory: updatedHistory } : n);
        setNodes(newNodesTemp);
        setChattingNode(newNodesTemp.find(n => n.id === nodeId) || null);
        setIsChatLoading(true);
        try {
            const aiResponseContent = await chatAboutArgumentNode(targetNode, updatedHistory, userMessage.content);
            const aiMessage: ChatMessage = { role: 'model', content: aiResponseContent };
            const finalHistory = [...updatedHistory, aiMessage];
            const finalNodes = newNodesTemp.map(n => n.id === nodeId ? { ...n, chatHistory: finalHistory } : n);
            setNodes(finalNodes);
            setChattingNode(finalNodes.find(n => n.id === nodeId) || null);
            updateReport(finalNodes, edges);
        } catch (err) { console.error(err); } 
        finally { setIsChatLoading(false); }
    };


    if (!report || !report.argumentGraph) {
        return <div className="flex items-center justify-center w-full h-full text-center text-slate-500 bg-slate-50 rounded-lg border">Vui lòng chạy phân tích vụ việc để tạo bản đồ lập luận.</div>;
    }
    
    const mapCursor = { select: 'auto', link: 'crosshair', delete: 'crosshair' }[mode];

    return (
        <div className="grid grid-cols-12 w-full h-full gap-0">
            <div 
                className="col-span-8 bg-slate-100/50 rounded-l-lg relative overflow-hidden"
                style={{ cursor: isPanning.current ? 'grabbing' : mapCursor }}
                ref={mapRef}
                onMouseMove={handleMouseMove}
                onMouseDown={handleMapMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                onContextMenu={(e) => e.preventDefault()}
                onClick={handleCanvasClick}
            >
                <div 
                    className="relative w-[4000px] h-[4000px]" 
                    ref={mapContentRef}
                    style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: '0 0' }}
                >
                    <svg className="absolute w-full h-full pointer-events-none">
                        <defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" /></marker></defs>
                        {edges.map(edge => (<ArgumentEdgeComponent key={edge.id} edge={edge} nodes={nodes} nodeDimensions={nodeDimensions} onClick={(id) => mode === 'delete' && handleDeleteEdge(id)} />))}
                    </svg>
                    {nodes.map(node => (
                        <ArgumentNodeComponent
                            key={node.id} node={node} onMouseDown={handleNodeDragStart} isSelected={selectedNodeIds.has(node.id)}
                            onClick={handleNodeClick} onStartEdit={setEditingNode} onStartChat={setChattingNode} onDelete={handleDeleteNode}
                            isLinkSource={linkSource === node.id}
                        />
                    ))}
                </div>
                
                {/* Main Toolbar */}
                <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg shadow-md flex items-center p-1 gap-1">
                    <button onClick={() => setMode('select')} className={`p-2 rounded ${mode === 'select' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`} title="Chọn & Di chuyển"><CursorArrowRaysIcon className="w-5 h-5"/></button>
                    <button onClick={() => { setMode('link'); setLinkSource(null); }} className={`p-2 rounded ${mode === 'link' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`} title="Liên kết các khối"><LinkIcon className="w-5 h-5"/></button>
                    <button onClick={() => setMode('delete')} className={`p-2 rounded ${mode === 'delete' ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`} title="Xóa"><TrashIcon className="w-5 h-5"/></button>
                    <div className="w-px h-6 bg-slate-200 mx-1"></div>
                    <button onClick={handleAddNode} className="p-2 text-slate-600 hover:bg-slate-200 rounded" title="Thêm khối tùy chỉnh"><PlusIcon className="w-5 h-5"/></button>
                </div>

                {/* Pan Controls */}
                <div className="absolute top-20 left-4 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg shadow-md grid grid-cols-3 w-24">
                    <div/><button onClick={() => handlePanControls('up')} className="p-2 text-slate-600 hover:text-blue-600 flex justify-center"><ArrowUpIcon className="w-5 h-5"/></button><div/>
                    <button onClick={() => handlePanControls('left')} className="p-2 text-slate-600 hover:text-blue-600 flex justify-center"><ArrowLeftIcon className="w-5 h-5"/></button><div/><button onClick={() => handlePanControls('right')} className="p-2 text-slate-600 hover:text-blue-600 flex justify-center"><ArrowRightIcon className="w-5 h-5"/></button>
                    <div/><button onClick={() => handlePanControls('down')} className="p-2 text-slate-600 hover:text-blue-600 flex justify-center"><ArrowDownIcon className="w-5 h-5"/></button><div/>
                </div>

                {/* Zoom Controls */}
                <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg shadow-md flex flex-col items-center">
                    <button onClick={() => handleZoomControls('in')} className="p-2 text-slate-600 hover:text-blue-600 w-full" title="Phóng to"><ZoomInIcon className="w-5 h-5"/></button>
                    <div className="w-full h-px bg-slate-200"></div>
                    <button onClick={() => handleZoomControls('out')} className="p-2 text-slate-600 hover:text-blue-600 w-full" title="Thu nhỏ"><ZoomOutIcon className="w-5 h-5"/></button>
                    <div className="w-full h-px bg-slate-200"></div>
                    <button onClick={() => handleZoomControls('reset')} className="p-2 text-slate-600 hover:text-blue-600 w-full" title="Reset"><ResetZoomIcon className="w-5 h-5"/></button>
                </div>
            </div>
            <div className="col-span-4 h-full">
                <ArgumentEditor selectedNodes={selectedNodesMemo} onDownload={handleDownloadImage} isDownloading={isDownloading} />
            </div>

            {editingNode && <ArgumentNodeEditorModal node={editingNode} onClose={() => setEditingNode(null)} onSave={handleSaveNodeEdit} />}
            {chattingNode && <ArgumentNodeChatModal node={chattingNode} onClose={() => setChattingNode(null)} onSendMessage={handleSendMessageInNode} isLoading={isChatLoading} />}
        </div>
    );
};
