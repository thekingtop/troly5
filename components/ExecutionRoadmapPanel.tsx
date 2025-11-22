
import React from 'react';

// --- Local Icons for this component ---
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

const ActorIcon: React.FC<{ actor: 'Client' | 'Lawyer' | 'Both' }> = ({ actor }) => {
    if (actor === 'Lawyer') return <span title="Luật sư thực hiện">⚖️</span>;
    if (actor === 'Client') return <span title="Khách hàng tự đi">👤</span>;
    return <span title="Cả hai cùng đi">👥</span>;
};

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
                const actorLabel = t.actor === 'Client' ? 'Khách' : (t.actor === 'Lawyer' ? 'Luật sư' : 'Cả hai');
                text += `  - [${actorLabel}] ${t.taskName}: ${t.description}\n`;
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
                    Lộ trình Thực thi Thông minh (Gom theo Chuyến)
                </h3>
                <button onClick={handleCopyPlan} className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 font-semibold flex items-center gap-1">
                    <CopyIconLocal className="w-4 h-4" /> Sao chép gửi Khách
                </button>
            </div>
            
            <div className="space-y-8 relative pb-2">
                {/* Vertical Connector Line */}
                <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-200 z-0"></div>

                {roadmap.trips.map((trip, tripIndex) => (
                    <div key={tripIndex} className="relative z-10 pl-10">
                        {/* Trip Counter Bullet */}
                        <div className="absolute left-0 top-0 w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm border-4 border-white shadow-sm z-20">
                            {tripIndex + 1}
                        </div>
                        
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            {/* Header: Location & Notes */}
                            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-base uppercase flex items-center gap-2">
                                            <span>📍</span> {trip.location}
                                        </h4>
                                        {trip.notes && <p className="text-xs text-amber-700 mt-1 italic bg-amber-50 px-2 py-1 rounded border border-amber-100 inline-block">ℹ️ {trip.notes}</p>}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-4">
                                {/* Logistics: Documents */}
                                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                                    <span className="font-bold text-yellow-800 block mb-1 flex items-center gap-2">
                                        🎒 GIẤY TỜ CẦN MANG THEO (BẮT BUỘC):
                                    </span>
                                    <ul className="list-none pl-1 text-slate-800 space-y-1">
                                        {trip.documentsToBring.map((doc, i) => (
                                            <li key={i} className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                                                {doc}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Task List */}
                                <div className="space-y-3">
                                    {trip.tasks.map((task, taskIndex) => {
                                        const taskId = `${tripIndex}-${taskIndex}`;
                                        const isChecked = checkedTasks.includes(taskId);
                                        
                                        // Style based on Actor
                                        let actorStyle = "bg-gray-100 text-gray-700";
                                        if (task.actor === 'Lawyer') actorStyle = "bg-purple-100 text-purple-800 border-purple-200";
                                        if (task.actor === 'Client') actorStyle = "bg-blue-100 text-blue-800 border-blue-200";
                                        if (task.actor === 'Both') actorStyle = "bg-orange-100 text-orange-800 border-orange-200";

                                        return (
                                            <div key={taskIndex} className={`flex items-start gap-3 p-3 rounded-lg transition-all border cursor-pointer ${isChecked ? 'bg-green-50 border-green-200' : 'bg-white border-slate-100 hover:border-blue-300'}`} onClick={() => toggleTask(taskId)}>
                                                <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${isChecked ? 'bg-green-500 border-green-500' : 'border-slate-300 bg-white'}`}>
                                                    {isChecked && <span className="text-white text-xs font-bold">✓</span>}
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 uppercase tracking-wide ${actorStyle}`}>
                                                            <ActorIcon actor={task.actor} />
                                                            {task.actor === 'Lawyer' ? 'Luật sư' : (task.actor === 'Client' ? 'Khách hàng' : 'Cùng đi')}
                                                        </span>
                                                        <span className={`font-bold text-sm ${isChecked ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{task.taskName}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-600 ml-1">{task.description}</p>
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
