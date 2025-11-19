
import React from 'react';

const CunningLawyerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM4.5 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM15.375 16.125a2.625 2.625 0 1 1 5.25 0 2.625 2.625 0 0 1-5.25 0ZM12 18.75a.75.75 0 0 0 .75.75h.008a.75.75 0 0 0 .75-.75V18a3 3 0 0 0-1.5 0v.75ZM12 21a.75.75 0 0 0 .75.75h.008a.75.75 0 0 0 .75-.75v-.375a3 3 0 0 0-1.5 0v.375Z" clipRule="evenodd" />
    <path d="M12 1.5c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 1.5 12 1.5ZM8.625 15a.75.75 0 0 0-1.5 0v.625H6.375a.75.75 0 0 0 0 1.5h.75v.625a.75.75 0 0 0 1.5 0v-.625h.75a.75.75 0 0 0 0-1.5h-.75V15Zm6 0a.75.75 0 0 0-1.5 0v.625H12.375a.75.75 0 0 0 0 1.5h.75v.625a.75.75 0 0 0 1.5 0v-.625h.75a.75.75 0 0 0 0-1.5h-.75V15Z" />
  </svg>
);

export const CunningLawyerText: React.FC<{ text: string | string[] | undefined }> = ({ text }) => {
    if (!text) return null;
    const content = Array.isArray(text) ? text.join('\n') : text;
    
    // Split by <cg> tags
    const parts = content.split(/(<cg>.*?<\/cg>)/g);
    
    return (
        <>
            {parts.map((part, index) => {
                // Handle Cunning Lawyer Tips
                if (part.startsWith('<cg>')) {
                    const tip = part.replace(/<\/?cg>/g, '');
                    return (
                        <div key={index} className="my-3 p-3 bg-amber-50 border-l-4 border-amber-300 rounded-r-md shadow-sm">
                            <div className="flex items-start gap-2">
                                <CunningLawyerIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-amber-900">
                                    <span className="font-bold uppercase text-xs block mb-1 text-amber-700">Mẹo chiến thuật:</span>
                                    <span className="leading-relaxed">{tip}</span>
                                </div>
                            </div>
                        </div>
                    );
                }
                
                // Handle Tactical Annotations (from Document Generator)
                if (part.includes('<tactical')) {
                     const subParts = part.split(/(<tactical tip=".*?">.*?<\/tactical>)/g);
                     return (
                        <React.Fragment key={index}>
                             {subParts.map((subPart, subIndex) => {
                                 const match = subPart.match(/<tactical tip="(.*?)">(.*?)<\/tactical>/);
                                 if (match) {
                                     const tip = match[1];
                                     const content = match[2];
                                     return (
                                         <span key={subIndex} className="relative group cursor-help border-b-2 border-purple-400 bg-purple-50 px-0.5 rounded text-purple-900 font-medium mx-1">
                                             {content}
                                             <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                                 <strong className="block text-amber-400 mb-1">Chiến thuật:</strong>
                                                 {tip}
                                             </span>
                                         </span>
                                     );
                                 }
                                 // Render regular text lines
                                 return <span key={subIndex} className="whitespace-pre-wrap">{subPart}</span>;
                             })}
                        </React.Fragment>
                     )
                }

                // Render regular text with newlines
                return <span key={index} className="whitespace-pre-wrap">{part}</span>;
            })}
        </>
    );
};
