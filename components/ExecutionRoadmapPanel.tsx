
import React from 'react';
import { CopyIcon } from './components/SpecializedWorkflows.tsx'; // Import icon from existing file or define locally if needed.
// Since CopyIcon was defined locally in SpecializedWorkflows, let's define the necessary icons here to be self-contained or export them.
// For simplicity in this refactor, I will redefine the simple icons used here to avoid complex exports.

const RoadmapIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
    </svg>
);

const CopyIconLocal: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m9.75 11.625-3.75-3.75" />
    </svg>
);

import type { ExecutionRoadmap } from '../types.ts';

export const ExecutionRoadmapPanel: React.FC<{
    roadmap: ExecutionRoadmap;
    checkedTasks: string[]; // array of "tripIndex-taskIndex" strings
    setCheckedTasks: (tasks: string[]) => void;
}> = ({ roadmap, checkedTasks, setCheckedTasks }) => {
    const toggleTask = (id: string) => {
        if (checkedTasks.includes(id)) {
            setCheckedTasks(checkedTasks.filter(t => t !== id));
        } else {
            setCheckedTasks([...checkedTasks, id]);
        }
    };

    const handleCopyPlan = () => {
        let text = "📋 LỘ TRÌNH THỰC HIỆN CÔNG VIỆC\n\n";
        roadmap.trips.forEach((trip, i) => {
            text += `📍 CHUYẾN ${i + 1}: ${trip.location.toUpperCase()}\n`;
            if (trip.notes) text += `ℹ️ Lưu ý: ${trip.notes}\n`;
            text += `🎒 Cần mang theo:\n${trip.documentsToBring.map(d => `  - ${d}`).join('\n')}\n`;
            text += `✅ Công việc:\n`;
            trip.tasks.forEach(t => {
                text += `  - [${t.actor === 'Client' ? 'Khách' : (t.actor === 'Lawyer' ? 'Luật sư' : 'Cả hai')}] ${t.taskName}: ${t.description}\n`;
            });
            text += `\n`;
        });
        navigator.clipboard.writeText(text);
        alert("Đã sao chép lộ trình vào bộ nhớ tạm!");
    };

    return (
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-lg mt-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <RoadmapIcon className="w-6 h-6 text-blue-600" />
                    Lộ trình Thực thi & Thủ tục (Gom theo Chuyến đi)
                </h3>
                <button onClick={handleCopyPlan} className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 font-semibold flex items-center gap-1">
                    <CopyIconLocal className="w-4 h-4" /> Sao chép gửi Khách
                </button>
            </div>
            
            <div className="space-y-6 relative">
                {/* Vertical Line */}
                <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-200 z-0"></div>

                {roadmap.trips.map((trip, tripIndex) => (
                    <div key={tripIndex} className="relative z-10 pl-10">
                        {/* Bullet */}
                        <div className="absolute left-0 top-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm border-4 border-white shadow-sm">
                            {tripIndex + 1}
                        </div>
                        
                        <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                                <h4 className="font-bold text-slate-800">{trip.location}</h4>
                                {trip.notes && <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">{trip.notes}</span>}
                            </div>
                            
                            <div className="p-4">
                                {/* Logistics */}
                                <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                                    <span className="font-bold text-yellow-800 block mb-1">🎒 Mang theo giấy tờ gốc:</span>
                                    <ul className="list-disc list-inside text-slate-700 space-y-0.5">
                                        {trip.documentsToBring.map((doc, i) => <li key={i}>{doc}</li>)}
                                    </ul>
                                </div>

                                {/* Tasks */}
                                <div className="space-y-2">
                                    {trip.tasks.map((task, taskIndex) => {
                                        const taskId = `${tripIndex}-${taskIndex}`;
                                        const isChecked = checkedTasks.includes(taskId);
                                        return (
                                            <div key={taskIndex} className={`flex items-start gap-3 p-2 rounded-lg transition-colors cursor-pointer ${isChecked ? 'bg-green-50' : 'hover:bg-white border border-transparent hover:border-slate-200'}`} onClick={() => toggleTask(taskId)}>
                                                <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${isChecked ? 'bg-green-500 border-green-500' : 'border-slate-300 bg-white'}`}>
                                                    {isChecked && <span className="text-white text-xs font-bold">✓</span>}
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${task.actor === 'Lawyer' ? 'bg-purple-100 text-purple-700' : (task.actor === 'Client' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700')}`}>
                                                            {task.actor === 'Lawyer' ? 'Luật sư' : (task.actor === 'Client' ? 'Khách' : 'Cùng đi')}
                                                        </span>
                                                        <span className={`font-semibold text-sm ${isChecked ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{task.taskName}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-600 mt-1">{task.description}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
