import { GoogleGenAI, Type } from "@google/genai";
import type {
  AnalysisReport, UploadedFile, FileCategory, ApplicableLaw,
  LitigationType, ParagraphGenerationOptions, ConsultingReport,
  BusinessFormationReport, LandProcedureReport, DivorceReport,
  ChatMessage, ArgumentNode, FormData, DocType,
  OpponentArgument, LegalLoophole
} from '../types.ts';
import {
  SYSTEM_INSTRUCTION, REPORT_SCHEMA, CORE_REPORT_SCHEMA, STRATEGY_REPORT_SCHEMA, CORE_ANALYSIS_SYSTEM_INSTRUCTION, STRATEGIC_ANALYSIS_SYSTEM_INSTRUCTION, CONSULTING_REPORT_SCHEMA,
  BUSINESS_FORMATION_REPORT_SCHEMA, LAND_PROCEDURE_REPORT_SCHEMA,
  DIVORCE_REPORT_SCHEMA, SUMMARY_EXTRACTION_SCHEMA,
  OPPONENT_ANALYSIS_SCHEMA, PREDICT_OPPONENT_ARGS_SCHEMA,
  SUMMARY_EXTRACTION_SYSTEM_INSTRUCTION,
  CONSULTING_SYSTEM_INSTRUCTION,
  BUSINESS_FORMATION_SYSTEM_INSTRUCTION,
  LAND_PROCEDURE_SYSTEM_INSTRUCTION,
  DIVORCE_SYSTEM_INSTRUCTION,
  DOCUMENT_GENERATION_SYSTEM_INSTRUCTION,
  TACTICAL_DRAFTING_INSTRUCTION,
  OPPONENT_ANALYSIS_SYSTEM_INSTRUCTION,
  PREDICT_OPPONENT_ARGS_SYSTEM_INSTRUCTION,
  DEVIL_ADVOCATE_SYSTEM_INSTRUCTION,
  ARGUMENT_GENERATION_SYSTEM_INSTRUCTION,
  ARGUMENT_NODE_CHAT_SYSTEM_INSTRUCTION,
  INTELLIGENT_SEARCH_SYSTEM_INSTRUCTION,
  CONTEXTUAL_CHAT_SYSTEM_INSTRUCTION,
  QUICK_ANSWER_REFINE_SYSTEM_INSTRUCTION,
  CONSULTING_CHAT_UPDATE_SYSTEM_INSTRUCTION,
  LITIGATION_CHAT_UPDATE_SYSTEM_INSTRUCTION,
  BUSINESS_FORMATION_CHAT_UPDATE_SYSTEM_INSTRUCTION,
  LAND_PROCEDURE_CHAT_UPDATE_SYSTEM_INSTRUCTION,
  DIVORCE_CHAT_UPDATE_SYSTEM_INSTRUCTION
} from '../constants.ts';

// Declare process for the preview environment
declare var process: { env: { API_KEY: string } };
declare var mammoth: any;
declare var XLSX: any;

// Helper to get API Key from either Vite env (Vercel) or Process env (Preview)
const getApiKey = (): string => {
  try {
    // 1. Try getting from Vite environment (standard for Vercel/React deployments)
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
      // @ts-ignore
      return import.meta.env.VITE_API_KEY;
    }
  } catch (e) {
    // Ignore error if import.meta is not available
  }

  try {
    // 2. Fallback to process.env (for this Preview environment or Node.js)
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // Ignore error
  }

  return '';
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

// Helper function for Exponential Backoff Retry
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const generateContentWithRetry = async (modelName: string, params: any, retries = 3, baseDelay = 2000) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await ai.models.generateContent({
                model: modelName,
                ...params
            });
        } catch (error: any) {
            // Check for overload (503), rate limit (429), or internal server error (500)
            const isRetryable = error.message?.includes('503') || error.message?.includes('500') || error.message?.includes('429') || error.message?.includes('Overloaded') || error.status === 503;
            
            if (isRetryable && i < retries - 1) {
                const delay = baseDelay * Math.pow(2, i); // Exponential backoff: 2s, 4s, 8s
                console.warn(`Gemini API Overloaded (Attempt ${i + 1}/${retries}). Retrying in ${delay}ms...`);
                await wait(delay);
                continue;
            }
            throw error; // Rethrow if not retryable or out of retries
        }
    }
    throw new Error("Failed after max retries");
};

const handleGeminiError = (error: any, action: string) => {
    console.error(`Error during ${action}:`, error);
    if (error instanceof Error) {
        return new Error(`Lỗi khi ${action}: ${error.message}`);
    }
    return new Error(`Lỗi không xác định khi ${action}.`);
};

const fileToPart = async (file: UploadedFile) => {
    const fileType = file.file.type;
    const fileName = file.file.name;

    // 1. Handle Word Documents (.docx) via Mammoth
    if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        try {
            const arrayBuffer = await file.file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
            return { text: `[File Content: ${fileName}]\n${result.value}` };
        } catch (e) {
            console.error("Error reading DOCX", e);
            return { text: `[Error reading DOCX file: ${fileName}]` };
        }
    }

    // 2. Handle Excel Files (.xlsx, .xls) via XLSX
    if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || fileType === 'application/vnd.ms-excel') {
        try {
            const arrayBuffer = await file.file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            let textContent = `[Excel File Content: ${fileName}]\n`;
            workbook.SheetNames.forEach((sheetName: any) => {
                const sheet = workbook.Sheets[sheetName];
                const csv = XLSX.utils.sheet_to_csv(sheet);
                if (csv && csv.trim()) {
                    textContent += `--- Sheet: ${sheetName} ---\n${csv}\n`;
                }
            });
            return { text: textContent };
        } catch (e) {
             console.error("Error reading Excel", e);
             return { text: `[Error reading Excel file: ${fileName}]` };
        }
    }
    
    // 3. Handle Plain Text
    if (fileType === 'text/plain') {
        try {
            const text = await file.file.text();
            return { text: `[Text File Content: ${fileName}]\n${text}` };
        } catch (e) {
             return { text: `[Error reading text file: ${fileName}]` };
        }
    }

    // 4. Handle Supported Binary Types (Images & PDF) for Inline Data
    // Gemini supports: image/png, image/jpeg, image/webp, image/heic, image/heif, application/pdf
    if (fileType.startsWith('image/') || fileType === 'application/pdf') {
        try {
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file.file);
                reader.onload = () => {
                    const result = reader.result as string;
                    const base64Data = result.split(',')[1];
                    resolve(base64Data);
                };
                reader.onerror = reject;
            });

            return {
                inlineData: {
                    data: base64,
                    mimeType: fileType
                }
            };
        } catch (e) {
            console.error("Error reading binary file", e);
            return { text: `[Error processing file: ${fileName}]` };
        }
    }

    // 5. Fallback for unsupported types
    console.warn(`Unsupported file type: ${fileType}`);
    // Return a text warning so the prompt isn't empty, but don't crash the request
    return { text: `[Warning: File "${fileName}" has an unsupported type (${fileType}) and was skipped from analysis.]` };
};

export const analyzeCaseFiles = async (
    files: UploadedFile[],
    query: string,
    previousAnalysis?: { report: AnalysisReport, stage: string },
    clientPosition?: string,
    jurisdiction?: string
): Promise<AnalysisReport> => {
    try {
        const fileParts = await Promise.all(files.map(fileToPart));
        const prompt = `
        ANALYZE THIS CASE (PHASE 1: FACTUAL & LEGAL BASIS).
        User Query: "${query}"
        Client Position: "${clientPosition || 'Not specified'}"
        Jurisdiction: "${jurisdiction || 'Vietnam'}"
        ${previousAnalysis ? `Previous Stage: ${previousAnalysis.stage}. THIS IS AN UPDATE REQUEST.` : ''}
        `;

        // INCREASED RETRY SETTINGS FOR LITIGATION
        // Retries: 5 (instead of 3)
        // Base Delay: 4000ms (instead of 2000ms)
        // This allows for ~2 minutes of total retry time for heavy tasks.
        const response = await generateContentWithRetry("gemini-2.5-flash", {
            contents: {
                parts: [...fileParts, { text: prompt }]
            },
            config: {
                // Use the LIGHTWEIGHT Core Instructions & Schema to avoid 503 errors
                systemInstruction: CORE_ANALYSIS_SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: CORE_REPORT_SCHEMA,
            }
        }, 5, 4000); 
        
        if (!response.text) throw new Error("No response from AI");
        return JSON.parse(response.text) as AnalysisReport;
    } catch (error) {
        throw handleGeminiError(error, 'analyzeCaseFiles');
    }
};

export const generateStrategicPlan = async (
    report: AnalysisReport,
    files: UploadedFile[]
): Promise<AnalysisReport> => {
    try {
        // Limit files sent for strategy to save tokens/load, usually summary + key evidence is enough, but sending all for context now
        // If 503 persists here, we can slice files.
        const fileParts = await Promise.all(files.map(fileToPart)); 
        const prompt = `
        GENERATE STRATEGIC "WAR ROOM" PLAN (PHASE 2).
        Base Report Context: ${JSON.stringify(report)}
        `;

        const response = await generateContentWithRetry("gemini-2.5-flash", {
            contents: {
                parts: [...fileParts, { text: prompt }]
            },
            config: {
                systemInstruction: STRATEGIC_ANALYSIS_SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: STRATEGY_REPORT_SCHEMA
            }
        }, 5, 4000);

        if (!response.text) throw new Error("No strategy generated");
        
        const strategyData = JSON.parse(response.text);
        
        // Merge the new strategic data into the existing report
        return {
            ...report,
            winProbabilityAnalysis: strategyData.winProbabilityAnalysis,
            proposedStrategy: {
                ...report.proposedStrategy,
                ...strategyData.proposedStrategy
            }
        };

    } catch (error) {
        throw handleGeminiError(error, 'generateStrategicPlan');
    }
}

export const categorizeMultipleFiles = async (files: File[]): Promise<Record<string, FileCategory>> => {
     try {
        const fileList = files.map(f => f.name).join(', ');
        const prompt = `Categorize these files based on their names: ${fileList}. Return a JSON object where keys are filenames and values are categories (Uncategorized, Contract, Correspondence, Minutes, Evidence, Image).`;
        
        // Use retry logic for categorization as it happens in bulk during upload
        const response = await generateContentWithRetry("gemini-2.5-flash", {
             contents: prompt,
             config: {
                 responseMimeType: "application/json",
             }
        });
        
        if (!response.text) return {};
        return JSON.parse(response.text);
     } catch (error) {
         console.error("Categorization failed", error);
         return {};
     }
};

export const extractSummariesFromFiles = async (files: UploadedFile[], clientPosition: string): Promise<{caseSummary: string, clientRequestSummary: string}> => {
    try {
        const fileParts = await Promise.all(files.slice(0, 5).map(fileToPart)); // Limit to 5 files for summary
        const prompt = `Extract case summary and client request. Client position: ${clientPosition}`;
        
        // Use retry logic for summary extraction
        const response = await generateContentWithRetry("gemini-2.5-flash", {
             contents: { parts: [...fileParts, { text: prompt }] },
             config: {
                 systemInstruction: SUMMARY_EXTRACTION_SYSTEM_INSTRUCTION,
                 responseMimeType: "application/json",
                 responseSchema: SUMMARY_EXTRACTION_SCHEMA
             }
        });
        
         if (!response.text) throw new Error("No summary generated");
         return JSON.parse(response.text);
    } catch (error) {
        throw handleGeminiError(error, 'extractSummariesFromFiles');
    }
};

export const reanalyzeCaseWithCorrections = async (report: AnalysisReport, files: UploadedFile[], clientPosition: string): Promise<AnalysisReport> => {
    // Re-uses analyzeCaseFiles but could have specific prompt logic if needed.
    // For simplicity, treating it as a fresh analysis with existing report context if we were to implement robust re-analysis.
    // Currently simple re-run.
    return analyzeCaseFiles(files, "Re-analyze with corrections based on previous context.", { report, stage: report.litigationStage }, clientPosition);
};

export const intelligentSearchQuery = async (report: AnalysisReport, files: UploadedFile[], history: ChatMessage[], query: string): Promise<string> => {
    try {
        const fileParts = await Promise.all(files.map(fileToPart));
        // Construct chat history for context
        // ... (Simplified for brevity, usually we map history to Content objects)
        
        const prompt = `
        Context: ${JSON.stringify(report)}
        Question: ${query}
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [...fileParts, { text: prompt }] }, // Include files for grounding
            config: {
                systemInstruction: INTELLIGENT_SEARCH_SYSTEM_INSTRUCTION
            }
        });
        
        return response.text || "Không tìm thấy câu trả lời.";
    } catch (error) {
        throw handleGeminiError(error, 'intelligentSearchQuery');
    }
};

export const continueLitigationChat = async (report: AnalysisReport, history: ChatMessage[], message: string, files: UploadedFile[]): Promise<{chatResponse: string, updatedReport?: AnalysisReport}> => {
     try {
        const fileParts = await Promise.all(files.map(fileToPart));
        const prompt = `
        Current Report: ${JSON.stringify(report)}
        User Message: ${message}
        `;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [...fileParts, { text: prompt }] },
            config: {
                systemInstruction: LITIGATION_CHAT_UPDATE_SYSTEM_INSTRUCTION
            }
        });

        const text = response.text || "";
        // Parsing the response format: [Response] --UPDATES-- [JSON]
        const parts = text.split('--UPDATES--');
        const chatResponse = parts[0].trim();
        let updatedReport: AnalysisReport | undefined;
        
        if (parts.length > 1 && parts[1].trim() !== 'null') {
             try {
                 updatedReport = { ...report, ...JSON.parse(parts[1].trim()) };
             } catch (e) { console.error("Failed to parse updated report", e); }
        }
        
        return { chatResponse, updatedReport };

     } catch (error) {
         throw handleGeminiError(error, 'continueLitigationChat');
     }
};

export const refineText = async (text: string, mode: string): Promise<string> => {
    try {
        const prompt = `Refine this text. Mode: ${mode}. Text: ${text}`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: QUICK_ANSWER_REFINE_SYSTEM_INSTRUCTION
            }
        });
        return response.text || text;
    } catch (error) {
        throw handleGeminiError(error, 'refineText');
    }
};

export const generateDocumentFromTemplate = async (docType: DocType, formData: FormData): Promise<string> => {
    try {
        const systemInstruction = DOCUMENT_GENERATION_SYSTEM_INSTRUCTION;
        let toneInstruction = "";
        const lowerDocType = docType.toLowerCase();
        if (lowerDocType.includes('demand') || lowerDocType.includes('complaint') || lowerDocType.includes('petition')) {
            toneInstruction = "**TONE: AGGRESSIVE & ASSERTIVE.** This is a demand/complaint.";
        } else if (lowerDocType.includes('contract') || lowerDocType.includes('agreement')) {
            toneInstruction = "**TONE: PRECISE & DEFENSIVE.** This is a contract.";
        } else {
            toneInstruction = "**TONE: PROFESSIONAL & FIRM.**";
        }

        const prompt = `
        **TASK:** Draft a '${docType}' document.
        ${toneInstruction}
        **INPUT DATA (JSON):**
        \`\`\`json
        ${JSON.stringify(formData, null, 2)}
        \`\`\`
        **EXECUTION:**
        Draft the complete document in Vietnamese.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { systemInstruction, temperature: 0.5 }
        });
        
        if (!response || typeof response.text !== 'string') {
            throw new Error("AI không tạo được nội dung văn bản từ mẫu.");
        }
        return response.text.trim();
    } catch (error) {
        throw handleGeminiError(error, 'tạo văn bản từ mẫu');
    }
};

export const extractInfoFromFile = async (file: UploadedFile, docType: DocType): Promise<FormData> => {
    try {
        const filePart = await fileToPart(file);
        const prompt = `Extract information for a ${docType} form. Return JSON key-value pairs matching the form fields if possible.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [filePart, { text: prompt }] },
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || '{}');
    } catch (error) {
        throw handleGeminiError(error, 'extractInfoFromFile');
    }
};

export const generateFieldContent = async (formData: FormData, docTypeLabel: string, fieldName: string): Promise<string> => {
     try {
         const prompt = `Generate content for field '${fieldName}' in document '${docTypeLabel}'. Context: ${JSON.stringify(formData)}`;
         const response = await ai.models.generateContent({
             model: "gemini-2.5-flash",
             contents: prompt
         });
         return response.text || '';
     } catch (error) {
         throw handleGeminiError(error, 'generateFieldContent');
     }
};

export const generateParagraph = async (request: string, options: ParagraphGenerationOptions, useTacticalMode: boolean): Promise<string> => {
    try {
        const prompt = `
        Request: ${request}
        Options: ${JSON.stringify(options)}
        ${useTacticalMode ? TACTICAL_DRAFTING_INSTRUCTION : ''}
        `;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });
        return response.text || '';
    } catch (error) {
        throw handleGeminiError(error, 'generateParagraph');
    }
};

export const analyzeConsultingCase = async (files: UploadedFile[], disputeContent: string, clientRequest: string): Promise<ConsultingReport> => {
     try {
         const fileParts = await Promise.all(files.map(fileToPart));
         const prompt = `
         Analyze this consulting case.
         Content: ${disputeContent}
         Client Request: ${clientRequest}
         `;
         const response = await generateContentWithRetry("gemini-2.5-flash", {
             contents: { parts: [...fileParts, { text: prompt }] },
             config: {
                 systemInstruction: CONSULTING_SYSTEM_INSTRUCTION,
                 responseMimeType: "application/json",
                 responseSchema: CONSULTING_REPORT_SCHEMA
             }
         });
         
         if (!response.text) throw new Error("No response from AI");
         return JSON.parse(response.text);
     } catch (error) {
         throw handleGeminiError(error, 'analyzeConsultingCase');
     }
};

export const generateConsultingDocument = async (report: ConsultingReport, disputeContent: string, request: string): Promise<string> => {
    try {
        const prompt = `
        Context: ${JSON.stringify(report)}
        Dispute: ${disputeContent}
        Request: ${request}
        `;
        const response = await ai.models.generateContent({
             model: "gemini-2.5-flash",
             contents: prompt
        });
        return response.text || '';
    } catch (error) {
        throw handleGeminiError(error, 'generateConsultingDocument');
    }
};

export const summarizeText = async (text: string, fieldName: string): Promise<string> => {
    try {
        const prompt = `Summarize this text for field '${fieldName}': ${text}`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });
        return response.text || text;
    } catch (error) {
        throw handleGeminiError(error, 'summarizeText');
    }
};

export const refineQuickAnswer = async (text: string, mode: string): Promise<string> => {
     return refineText(text, mode);
};

export const continueConsultingChat = async (report: ConsultingReport, history: ChatMessage[], message: string, files: UploadedFile[]): Promise<{chatResponse: string, updatedReport?: ConsultingReport}> => {
     try {
         const fileParts = await Promise.all(files.map(fileToPart));
         const prompt = `
         Report: ${JSON.stringify(report)}
         Message: ${message}
         `;
         const response = await ai.models.generateContent({
             model: "gemini-2.5-flash",
             contents: { parts: [...fileParts, { text: prompt }] },
             config: { systemInstruction: CONSULTING_CHAT_UPDATE_SYSTEM_INSTRUCTION }
         });
         
         const text = response.text || "";
         const parts = text.split('--UPDATES--');
         const chatResponse = parts[0].trim();
         let updatedReport: ConsultingReport | undefined;
         if (parts.length > 1 && parts[1].trim() !== 'null') {
             try { updatedReport = { ...report, ...JSON.parse(parts[1].trim()) }; } catch (e) {}
         }
         return { chatResponse, updatedReport };
     } catch (error) {
         throw handleGeminiError(error, 'continueConsultingChat');
     }
};

export const analyzeBusinessFormation = async (idea: string, info: any): Promise<BusinessFormationReport> => {
     try {
         const prompt = `Analyze business formation. Idea: ${idea}. Info: ${JSON.stringify(info)}`;
         const response = await generateContentWithRetry("gemini-2.5-flash", {
             contents: prompt,
             config: {
                 systemInstruction: BUSINESS_FORMATION_SYSTEM_INSTRUCTION,
                 responseMimeType: "application/json",
                 responseSchema: BUSINESS_FORMATION_REPORT_SCHEMA
             }
         });
         
         if (!response.text) throw new Error("No response from AI");
         return JSON.parse(response.text);
     } catch (error) {
         throw handleGeminiError(error, 'analyzeBusinessFormation');
     }
};

export const continueBusinessFormationChat = async (report: BusinessFormationReport, history: ChatMessage[], message: string, files: UploadedFile[]): Promise<{chatResponse: string, updatedReport?: BusinessFormationReport}> => {
    try {
        const fileParts = await Promise.all(files.map(fileToPart));
        const prompt = `Report: ${JSON.stringify(report)}. Message: ${message}`;
        const response = await ai.models.generateContent({
             model: "gemini-2.5-flash",
             contents: { parts: [...fileParts, { text: prompt }] },
             config: { systemInstruction: BUSINESS_FORMATION_CHAT_UPDATE_SYSTEM_INSTRUCTION }
        });
        const text = response.text || "";
        const parts = text.split('--UPDATES--');
        const chatResponse = parts[0].trim();
        let updatedReport: BusinessFormationReport | undefined;
        if (parts.length > 1 && parts[1].trim() !== 'null') {
             try { updatedReport = { ...report, ...JSON.parse(parts[1].trim()) }; } catch (e) {}
        }
        return { chatResponse, updatedReport };
    } catch (error) {
        throw handleGeminiError(error, 'continueBusinessFormationChat');
    }
};

export const generateArgumentText = async (nodes: ArgumentNode[]): Promise<string> => {
    try {
        const prompt = `Generate argument text from nodes: ${JSON.stringify(nodes)}`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { systemInstruction: ARGUMENT_GENERATION_SYSTEM_INSTRUCTION }
        });
        return response.text || '';
    } catch (error) {
        throw handleGeminiError(error, 'generateArgumentText');
    }
};

export const chatAboutArgumentNode = async (node: ArgumentNode, history: ChatMessage[], message: string): Promise<string> => {
     try {
         const prompt = `Node: ${JSON.stringify(node)}. Message: ${message}`;
         const response = await ai.models.generateContent({
             model: "gemini-2.5-flash",
             contents: prompt,
             config: { systemInstruction: ARGUMENT_NODE_CHAT_SYSTEM_INSTRUCTION }
         });
         return response.text || '';
     } catch (error) {
         throw handleGeminiError(error, 'chatAboutArgumentNode');
     }
};

export const analyzeLandProcedure = async (type: string, address: string, files: UploadedFile[]): Promise<LandProcedureReport> => {
    try {
        const fileParts = await Promise.all(files.map(fileToPart));
        const prompt = `Analyze Land Procedure. Type: ${type}. Address: ${address}`;
        const response = await generateContentWithRetry("gemini-2.5-flash", {
            contents: { parts: [...fileParts, { text: prompt }] },
            config: {
                systemInstruction: LAND_PROCEDURE_SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: LAND_PROCEDURE_REPORT_SCHEMA
            }
        });
        
        if (!response.text) throw new Error("No response from AI");
        return JSON.parse(response.text);
    } catch (error) {
        throw handleGeminiError(error, 'analyzeLandProcedure');
    }
};

export const analyzeDivorceCase = async (context: string, files: UploadedFile[]): Promise<DivorceReport> => {
    try {
        const fileParts = await Promise.all(files.map(fileToPart));
        const prompt = `Analyze Divorce Case. Context: ${context}`;
        const response = await generateContentWithRetry("gemini-2.5-flash", {
            contents: { parts: [...fileParts, { text: prompt }] },
            config: {
                systemInstruction: DIVORCE_SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: DIVORCE_REPORT_SCHEMA
            }
        });
        
        if (!response.text) throw new Error("No response from AI");
        return JSON.parse(response.text);
    } catch (error) {
        throw handleGeminiError(error, 'analyzeDivorceCase');
    }
};

export const continueLandChat = async (report: LandProcedureReport, history: ChatMessage[], message: string, files: UploadedFile[]): Promise<{chatResponse: string, updatedReport?: LandProcedureReport}> => {
    try {
        const fileParts = await Promise.all(files.map(fileToPart));
        const prompt = `Report: ${JSON.stringify(report)}. Message: ${message}`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [...fileParts, { text: prompt }] },
            config: { systemInstruction: LAND_PROCEDURE_CHAT_UPDATE_SYSTEM_INSTRUCTION }
        });
        const text = response.text || "";
        const parts = text.split('--UPDATES--');
        const chatResponse = parts[0].trim();
        let updatedReport: LandProcedureReport | undefined;
        if (parts.length > 1 && parts[1].trim() !== 'null') {
             try { updatedReport = { ...report, ...JSON.parse(parts[1].trim()) }; } catch (e) {}
        }
        return { chatResponse, updatedReport };
    } catch (error) {
        throw handleGeminiError(error, 'continueLandChat');
    }
};

export const continueDivorceChat = async (report: DivorceReport, history: ChatMessage[], message: string, files: UploadedFile[]): Promise<{chatResponse: string, updatedReport?: DivorceReport}> => {
     try {
        const fileParts = await Promise.all(files.map(fileToPart));
        const prompt = `Report: ${JSON.stringify(report)}. Message: ${message}`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [...fileParts, { text: prompt }] },
            config: { systemInstruction: DIVORCE_CHAT_UPDATE_SYSTEM_INSTRUCTION }
        });
        const text = response.text || "";
        const parts = text.split('--UPDATES--');
        const chatResponse = parts[0].trim();
        let updatedReport: DivorceReport | undefined;
        if (parts.length > 1 && parts[1].trim() !== 'null') {
             try { updatedReport = { ...report, ...JSON.parse(parts[1].trim()) }; } catch (e) {}
        }
        return { chatResponse, updatedReport };
    } catch (error) {
        throw handleGeminiError(error, 'continueDivorceChat');
    }
};

export const explainLaw = async (lawText: string): Promise<string> => {
    try {
        const prompt = `Explain this law simply: ${lawText}`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });
        return response.text || '';
    } catch (error) {
        throw handleGeminiError(error, 'explainLaw');
    }
};

export const continueContextualChat = async (report: AnalysisReport, history: ChatMessage[], message: string, sectionTitle: string): Promise<string> => {
    try {
        const prompt = `
        Context: ${JSON.stringify(report)}
        Section: ${sectionTitle}
        Message: ${message}
        `;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { systemInstruction: CONTEXTUAL_CHAT_SYSTEM_INSTRUCTION }
        });
        return response.text || '';
    } catch (error) {
        throw handleGeminiError(error, 'continueContextualChat');
    }
};

export const predictOpponentArguments = async (report: AnalysisReport, files: UploadedFile[]): Promise<string[]> => {
     try {
         const fileParts = await Promise.all(files.map(fileToPart));
         const prompt = `Predict opponent arguments based on report: ${JSON.stringify(report)}`;
         const response = await ai.models.generateContent({
             model: "gemini-2.5-flash",
             contents: { parts: [...fileParts, { text: prompt }] },
             config: {
                 systemInstruction: PREDICT_OPPONENT_ARGS_SYSTEM_INSTRUCTION,
                 responseMimeType: "application/json",
                 responseSchema: PREDICT_OPPONENT_ARGS_SCHEMA
             }
         });
         const result = JSON.parse(response.text || '{}');
         return result.predictedArguments || [];
     } catch (error) {
         throw handleGeminiError(error, 'predictOpponentArguments');
     }
};

export const analyzeOpponentArguments = async (report: AnalysisReport, files: UploadedFile[], opponentArgs: string): Promise<OpponentArgument[]> => {
    try {
        const fileParts = await Promise.all(files.map(fileToPart));
        const prompt = `Analyze opponent arguments: ${opponentArgs}. Report: ${JSON.stringify(report)}`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [...fileParts, { text: prompt }] },
             config: {
                 systemInstruction: OPPONENT_ANALYSIS_SYSTEM_INSTRUCTION,
                 responseMimeType: "application/json",
                 responseSchema: OPPONENT_ANALYSIS_SCHEMA
             }
        });
        return JSON.parse(response.text || '[]');
    } catch (error) {
        throw handleGeminiError(error, 'analyzeOpponentArguments');
    }
};

export const runDevilAdvocateAnalysis = async (report: AnalysisReport): Promise<{ weakness: string, counterStrategy: string }[]> => {
     try {
         const prompt = `Run Devil's Advocate Analysis on: ${JSON.stringify(report)}`;
         const response = await ai.models.generateContent({
             model: "gemini-2.5-flash",
             contents: prompt,
             config: {
                 systemInstruction: DEVIL_ADVOCATE_SYSTEM_INSTRUCTION,
                 responseMimeType: "application/json"
             }
         });
         const res = JSON.parse(response.text || '{}');
         return res.critiquePoints || [];
     } catch (error) {
         throw handleGeminiError(error, 'runDevilAdvocateAnalysis');
     }
};