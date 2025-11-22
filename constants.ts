
import { Type } from "@google/genai";

// Enums and Constants
export const REGIONAL_COURTS = [
    "Tòa án nhân dân thành phố Hà Nội",
    "Tòa án nhân dân thành phố Hồ Chí Minh",
    "Tòa án nhân dân thành phố Đà Nẵng",
    "Tòa án nhân dân Quận 1",
    "Tòa án nhân dân Quận Ba Đình",
    "Tòa án nhân dân Quận Hoàn Kiếm",
    "Tòa án nhân dân Quận Đống Đa",
    // Add more as needed
];

export const fileCategoryLabels: Record<string, string> = {
  Contract: 'Hợp đồng',
  Correspondence: 'Thư từ/Email',
  Minutes: 'Biên bản',
  Evidence: 'Chứng cứ',
  Image: 'Hình ảnh',
  Uncategorized: 'Chưa phân loại',
};

export const DRAFTING_MODE_LABELS = {
    standard: 'Tiêu chuẩn',
    tactical: 'Chiến thuật (Cáo già)'
};

export const litigationStagesByType = {
    civil: ['first_instance', 'appellate', 'enforcement'],
    criminal: ['investigation', 'prosecution', 'trial'],
    administrative: ['first_instance', 'appellate']
};

export const litigationStageSuggestions = {
    first_instance: "Sơ thẩm",
    appellate: "Phúc thẩm"
};

export const getStageLabel = (type: any, stage: any) => {
    const labels: Record<string, string> = {
        first_instance: 'Sơ thẩm',
        appellate: 'Phúc thẩm',
        cassation: 'Giám đốc thẩm',
        enforcement: 'Thi hành án',
        investigation: 'Điều tra',
        prosecution: 'Truy tố',
        trial: 'Xét xử'
    };
    return labels[stage] || stage;
};

export const DOC_TYPE_FIELDS: Record<string, string[]> = {
    legalServiceContract: ['clientName', 'lawyerName', 'scopeOfWork', 'fees'],
    demandLetter: ['recipientName', 'senderName', 'demandContent', 'deadline'],
    powerOfAttorney: ['grantor', 'attorney', 'scope', 'duration'],
    meetingMinutes: ['date', 'location', 'attendees', 'content', 'conclusion'],
    lawsuit: ['plaintiff', 'defendant', 'courtName', 'claims', 'facts'],
    evidenceList: ['caseName', 'evidenceItems'],
    civilMatterPetition: ['requester', 'matterType', 'details'],
    statement: ['author', 'content'],
    appeal: ['appellant', 'judgmentNumber', 'reasons'],
    civilContract: ['partyA', 'partyB', 'terms'],
    businessRegistration: ['companyName', 'address', 'capital', 'ownerName'],
    divorcePetition: ['petitioner', 'respondent', 'marriageDetails', 'children', 'assets'],
    will: ['testator', 'beneficiaries', 'assets', 'conditions'],
    enforcementPetition: ['creditor', 'debtor', 'judgmentNumber', 'request'],
    complaint: ['complainant', 'authority', 'content'],
    reviewPetition: ['petitioner', 'judgmentNumber', 'grounds'],
    inheritanceWaiver: ['heir', 'deceased', 'estate'],
    statementOfOpinion: ['author', 'caseRef', 'opinion'],
    defenseStatement: ['defendant', 'plaintiffClaims', 'counterArguments'],
    enterpriseRegistration: ['companyName', 'address', 'capital', 'ownerName', 'businessLines'],
    householdRegistration: ['householdName', 'address', 'ownerName', 'businessLines', 'capital'],
    landRegistrationApplication: ['landOwner', 'parcelInfo', 'changeDetails'],
    divorceAgreement: ['husband', 'wife', 'custodyAgreement', 'assetAgreement'],
    noContactOrder: ['requesterName', 'abuserAddress', 'reason', 'incidentDetails']
};

export const FIELD_LABELS: Record<string, string> = {
    clientName: 'Tên khách hàng',
    lawyerName: 'Tên luật sư',
    scopeOfWork: 'Phạm vi công việc',
    fees: 'Phí dịch vụ',
    recipientName: 'Tên người nhận',
    senderName: 'Tên người gửi',
    demandContent: 'Nội dung yêu cầu',
    deadline: 'Thời hạn',
    grantor: 'Bên ủy quyền',
    attorney: 'Bên được ủy quyền',
    scope: 'Phạm vi ủy quyền',
    duration: 'Thời hạn ủy quyền',
    plaintiff: 'Nguyên đơn',
    defendant: 'Bị đơn',
    courtName: 'Tên Tòa án',
    claims: 'Yêu cầu khởi kiện',
    facts: 'Tóm tắt sự việc',
    content: 'Nội dung chi tiết',
    // Add more as needed
};

export const INVISIBLE_FILES_CHECKLIST = [
    "Sao kê ngân hàng 3 năm gần nhất",
    "Tin nhắn/Email trao đổi về tài sản",
    "Hình ảnh/Video về lối sống, tài sản",
    "Hợp đồng bảo hiểm nhân thọ",
    "Giấy tờ vay nợ viết tay",
    "Sổ tiết kiệm (ảnh chụp lén hoặc bản sao)",
    "Đăng ký xe, giấy tờ nhà đất (bản photo)"
];

export const PANIC_MODE_INSTRUCTIONS = [
    "Gọi 113 ngay lập tức nếu đang nguy hiểm.",
    "Tìm nơi trú ẩn an toàn (nhà người thân, trung tâm bảo trợ).",
    "Ghi âm/Quay phim lại hành vi bạo hành (nếu an toàn).",
    "Giữ nguyên hiện trường và thương tích để giám định.",
    "Viết đơn trình báo Công an phường sở tại ngay.",
    "Liên hệ luật sư để nộp đơn cấm tiếp xúc khẩn cấp."
];

export const LAND_DUE_DILIGENCE_CHECKLIST = [
    "Kiểm tra quy hoạch tại UBND Quận/Huyện",
    "Kiểm tra tình trạng tranh chấp tại UBND Xã/Phường",
    "So khớp diện tích thực tế và sổ đỏ",
    "Kiểm tra thông tin ngăn chặn tại Văn phòng Đăng ký Đất đai",
    "Xác minh chủ sở hữu thực tế (có vợ/chồng không?)",
    "Kiểm tra nghĩa vụ tài chính (thuế đất) đã đóng đủ chưa",
    "Đo đạc lại ranh giới thửa đất"
];

export const LAND_SYMBOL_HISTORY: Record<string, any> = {
    "T": { period: "Luật Đất đai 1993", meaning: "Đất ở (Thổ cư)", currentEquivalent: "ONT / ODT" },
    "A": { period: "Luật Đất đai 1993", meaning: "Đất nông nghiệp (Ao)", currentEquivalent: "LUC / CLN" },
    "V": { period: "Luật Đất đai 1993", meaning: "Đất vườn", currentEquivalent: "CLN / BHK" },
    "L": { period: "Luật Đất đai 1987", meaning: "Đất lúa", currentEquivalent: "LUC" },
    "Q": { period: "Cũ", meaning: "Đất quy hoạch", currentEquivalent: "Dựa trên bản đồ hiện trạng" },
    "ONT": { period: "Luật Đất đai 2013/2024", meaning: "Đất ở tại nông thôn", currentEquivalent: "ONT" },
    "ODT": { period: "Luật Đất đai 2013/2024", meaning: "Đất ở tại đô thị", currentEquivalent: "ODT" },
    "CLN": { period: "Luật Đất đai 2013/2024", meaning: "Đất trồng cây lâu năm", currentEquivalent: "CLN" },
    "BHK": { period: "Luật Đất đai 2013/2024", meaning: "Đất trồng cây hàng năm khác", currentEquivalent: "BHK" },
    "LUC": { period: "Luật Đất đai 2013/2024", meaning: "Đất chuyên trồng lúa nước", currentEquivalent: "LUC" }
};

export const nodeTypeMeta: Record<string, { color: string, label: string }> = {
    fact: { color: "bg-blue-100 border-blue-300", label: "Sự kiện" },
    evidence: { color: "bg-green-100 border-green-300", label: "Chứng cứ" },
    claim: { color: "bg-purple-100 border-purple-300", label: "Yêu cầu" },
    legal_basis: { color: "bg-yellow-100 border-yellow-300", label: "Cơ sở lý" },
    counter_argument: { color: "bg-red-100 border-red-300", label: "Phản bác" },
    custom: { color: "bg-gray-100 border-gray-300", label: "Ghi chú" },
};

// Schemas
export const timelineEventSchema = {
    type: Type.OBJECT,
    properties: {
        date: { type: Type.STRING },
        description: { type: Type.STRING },
        eventType: { type: Type.STRING, enum: ['Contract', 'Payment', 'Communication', 'LegalAction', 'Milestone', 'Other'] },
        sourceDocument: { type: Type.STRING },
        significance: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] }
    },
    required: ['date', 'description', 'eventType']
};

export const landInfoSchema = {
    type: Type.OBJECT,
    properties: {
        mapSheetNumber: { type: Type.STRING },
        parcelNumber: { type: Type.STRING },
        address: { type: Type.STRING },
        area: { type: Type.STRING },
        landUsePurpose: { type: Type.STRING },
        landUseTerm: { type: Type.STRING },
        landUseSource: { type: Type.STRING },
        planningStatus: { type: Type.STRING },
        symbolsAnalysis: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    symbol: { type: Type.STRING },
                    period: { type: Type.STRING },
                    meaning: { type: Type.STRING },
                    currentEquivalent: { type: Type.STRING }
                }
            }
        }
    }
};

export const applicableLawSchema = {
    type: Type.OBJECT,
    properties: {
        documentName: { type: Type.STRING },
        articles: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    articleNumber: { type: Type.STRING },
                    summary: { type: Type.STRING }
                }
            }
        },
        coreIssueAddressed: { type: Type.STRING },
        relevanceToCase: { type: Type.STRING },
        supportingEvidence: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    snippet: { type: Type.STRING },
                    sourceDocument: { type: Type.STRING }
                }
            }
        }
    }
};

export const legalLoopholeSchema = {
    type: Type.OBJECT,
    properties: {
        description: { type: Type.STRING },
        suggestion: { type: Type.STRING },
        severity: { type: Type.STRING, enum: ['Cao', 'Trung bình', 'Thấp'] },
        classification: { type: Type.STRING, enum: ['Hợp đồng', 'Quy phạm Pháp luật', 'Tố tụng', 'Khác'] },
        evidence: { type: Type.STRING }
    }
};

// NEW: Schema for Smart Execution Roadmap
export const executionRoadmapSchema = {
    type: Type.OBJECT,
    properties: {
        trips: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    location: { type: Type.STRING, description: "Where to go (e.g., Notary Office, Court, Client's House)" },
                    documentsToBring: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of original documents required for this trip" },
                    notes: { type: Type.STRING, description: "Important logistics notes (e.g., 'Go early in the morning', 'Both husband and wife must be present')" },
                    tasks: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                taskName: { type: Type.STRING },
                                description: { type: Type.STRING },
                                actor: { type: Type.STRING, enum: ['Client', 'Lawyer', 'Both'], description: "Who performs this task?" }
                            }
                        }
                    }
                }
            }
        }
    }
};

export const CORE_REPORT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        editableCaseSummary: { type: Type.STRING },
        caseTimeline: { type: Type.ARRAY, items: timelineEventSchema },
        litigationStage: { type: Type.STRING },
        proceduralStatus: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { partyName: { type: Type.STRING }, status: { type: Type.STRING } } } },
        legalRelationship: { type: Type.STRING },
        coreLegalIssues: { type: Type.ARRAY, items: { type: Type.STRING } },
        landInfo: landInfoSchema,
        applicableLaws: { type: Type.ARRAY, items: applicableLawSchema },
        gapAnalysis: {
            type: Type.OBJECT,
            properties: {
                missingInformation: { type: Type.ARRAY, items: { type: Type.STRING } },
                recommendedActions: { type: Type.ARRAY, items: { type: Type.STRING } },
                legalLoopholes: { type: Type.ARRAY, items: legalLoopholeSchema }
            }
        },
        caseProspects: {
            type: Type.OBJECT,
            properties: {
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                risks: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        },
        proposedStrategy: {
            type: Type.OBJECT,
            properties: {
                preLitigation: { type: Type.ARRAY, items: { type: Type.STRING } },
                litigation: { type: Type.ARRAY, items: { type: Type.STRING } },
                psychologicalStrategy: { type: Type.ARRAY, items: { type: Type.STRING } },
                proceduralTactics: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        },
        requestResolutionPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
        contingencyPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
        executionRoadmap: executionRoadmapSchema // Integrated here
    }
};

export const STRATEGY_REPORT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        winProbabilityAnalysis: {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.NUMBER },
                rationale: { type: Type.STRING },
                swingFactors: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        },
        proposedStrategy: {
            type: Type.OBJECT,
            properties: {
                layeredStrategy: {
                    type: Type.OBJECT,
                    properties: {
                        surfaceStrategy: { type: Type.ARRAY, items: { type: Type.STRING } },
                        deepStrategy: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                },
                crossExaminationPlan: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            target: { type: Type.STRING },
                            type: { type: Type.STRING },
                            question: { type: Type.STRING },
                            goal: { type: Type.STRING }
                        }
                    }
                }
            }
        }
    }
};

export const CONSULTING_REPORT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        conciseAnswer: { type: Type.STRING },
        negotiationLeverage: { type: Type.STRING },
        preliminaryAssessment: { type: Type.STRING },
        legalLoopholes: { type: Type.ARRAY, items: legalLoopholeSchema },
        proposedRoadmap: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { stage: { type: Type.STRING }, description: { type: Type.STRING } } } },
        caseType: { type: Type.STRING },
    }
};

export const BUSINESS_FORMATION_REPORT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        modelComparison: {
            type: Type.OBJECT,
            properties: {
                recommendation: { type: Type.STRING },
                recommendationReasoning: { type: Type.STRING },
                business: { type: Type.OBJECT, properties: { pros: { type: Type.ARRAY, items: { type: Type.STRING } }, cons: { type: Type.ARRAY, items: { type: Type.STRING } } } },
                soleProprietorship: { type: Type.OBJECT, properties: { pros: { type: Type.ARRAY, items: { type: Type.STRING } }, cons: { type: Type.ARRAY, items: { type: Type.STRING } } } },
                costComparison: { type: Type.OBJECT, properties: { setupCost: { type: Type.STRING }, accountingCost: { type: Type.STRING }, taxComplexity: { type: Type.STRING } } }
            }
        },
        taxAnalysis: {
            type: Type.OBJECT,
            properties: {
                businessTaxes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING } } } },
                soleProprietorshipTaxes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING } } } },
                optimizationTips: { type: Type.STRING },
                vatManagementGuide: { type: Type.OBJECT, properties: { storageRules: { type: Type.STRING }, inputInvoiceChecklist: { type: Type.ARRAY, items: { type: Type.STRING } }, deductionTactics: { type: Type.STRING } } },
                nonInvoiceInputGuide: { type: Type.OBJECT, properties: { strategy: { type: Type.STRING }, documentation: { type: Type.ARRAY, items: { type: Type.STRING } }, risks: { type: Type.STRING } } }
            }
        },
        regulatoryArbitrage: { type: Type.STRING },
        procedureGuide: { type: Type.OBJECT, properties: { businessSteps: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { step: { type: Type.STRING }, description: { type: Type.STRING } } } }, soleProprietorshipSteps: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { step: { type: Type.STRING }, description: { type: Type.STRING } } } } } },
        validExpensesGuide: { type: Type.STRING },
        legalRisks: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { risk: { type: Type.STRING }, prevention: { type: Type.STRING } } } }
    }
};

export const LAND_PROCEDURE_REPORT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        executionRoadmap: executionRoadmapSchema,
        stepByStepGuide: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { step: { type: Type.STRING }, description: { type: Type.STRING }, estimatedTime: { type: Type.STRING }, location: { type: Type.STRING } } } },
        documentChecklist: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, required: { type: Type.BOOLEAN }, notes: { type: Type.STRING }, status: { type: Type.STRING } } } },
        financialEstimation: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { item: { type: Type.STRING }, amount: { type: Type.STRING }, basis: { type: Type.STRING } } } },
        insiderTips: { type: Type.STRING }
    }
};

export const DIVORCE_REPORT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        divorceType: { type: Type.STRING, enum: ['ThuanTinh', 'DonPhuong'] },
        custodyAnalysis: { type: Type.OBJECT, properties: { strategy: { type: Type.STRING }, evidenceNeeded: { type: Type.ARRAY, items: { type: Type.STRING } }, custodyLeveragePoints: { type: Type.STRING }, cunningTips: { type: Type.STRING } } },
        assetDivision: { type: Type.OBJECT, properties: { commonAssets: { type: Type.ARRAY, items: { type: Type.STRING } }, privateAssets: { type: Type.ARRAY, items: { type: Type.STRING } }, divisionStrategy: { type: Type.STRING }, assetTracingStrategy: { type: Type.STRING }, cunningTips: { type: Type.STRING } } },
        procedureRoadmap: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { step: { type: Type.STRING }, description: { type: Type.STRING } } } },
        emotionalAndLegalAdvice: { type: Type.STRING },
        practicalObstacles: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { obstacle: { type: Type.STRING }, realityCheck: { type: Type.STRING }, counterMeasure: { type: Type.STRING } } } },
        executionRoadmap: executionRoadmapSchema
    }
};

export const SUMMARY_EXTRACTION_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        caseSummary: { type: Type.STRING },
        clientRequestSummary: { type: Type.STRING }
    }
};

export const OPPONENT_ANALYSIS_SCHEMA = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            argument: { type: Type.STRING },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            counterArguments: { type: Type.ARRAY, items: { type: Type.STRING } },
            supportingEvidence: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
    }
};

export const PREDICT_OPPONENT_ARGS_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        predictedArguments: { type: Type.ARRAY, items: { type: Type.STRING } }
    }
};

// System Instructions
export const SYSTEM_INSTRUCTION = "You are a highly experienced Vietnamese lawyer. Analyze the provided case files and query.";
export const REPORT_SCHEMA = CORE_REPORT_SCHEMA;

export const DIRECT_RESPONSE_PROTOCOL = "PROTOCOL: RESPOND DIRECTLY. NO PLEASANTRIES. NO 'Here is the answer'. GO STRAIGHT TO THE POINT. USE PROFESSIONAL, CONCISE LEGAL TONE (LIKE A SENIOR PARTNER TO AN ASSOCIATE).";

export const CORE_ANALYSIS_SYSTEM_INSTRUCTION = `
Analyze this case as a senior lawyer in Vietnam. 
Identify legal relationships, key issues, gaps, prospects, and initial strategy.
IMPORTANT: Generate a 'Smart Execution Roadmap' (executionRoadmap). 
- Group tasks by 'Trip' or 'Location' (e.g., Trip 1: Notary Office, Trip 2: Court) to minimize travel time. 
- For each trip, list ALL documents the client must bring (originals/copies).
- Assign specific actors (Client vs Lawyer) for each task.
- If the case involves land, verify map symbols against the specific historical Land Law period (1993 vs 2013 vs 2024).
`;

export const STRATEGIC_ANALYSIS_SYSTEM_INSTRUCTION = "Act as a strategic legal advisor 'War Room' style. Develop deep strategies, including hidden tactics, win probability analysis, and cross-examination plans.";
export const SUMMARY_EXTRACTION_SYSTEM_INSTRUCTION = "Extract the case summary and client request from the provided documents. Be concise and accurate.";
export const CONSULTING_SYSTEM_INSTRUCTION = "Act as a legal consultant. Provide a concise answer, identify negotiation leverage, loopholes, and a roadmap.";
export const BUSINESS_FORMATION_SYSTEM_INSTRUCTION = "Act as a business legal expert. Analyze the business idea, compare entity types (Enterprise vs. Household), and provide tax optimization advice.";

export const LAND_PROCEDURE_SYSTEM_INSTRUCTION = `
Act as a land law expert in Vietnam. 
Provide a step-by-step procedure guide, document checklist, and financial estimation.
CRITICAL: Generate an 'Execution Roadmap' (executionRoadmap) that groups tasks into logical 'Trips'.
- Example: "Trip 1: To Notary Office (Sign contract, pay fees)", "Trip 2: To Public Admin Center (Submit tax decl, change registration)".
- Explicitly state WHO goes (Client, Lawyer, or Both).
- Explicitly state WHAT DOCUMENTS to bring for each trip to avoid return trips.
`;

export const DIVORCE_SYSTEM_INSTRUCTION = `
Act as a divorce lawyer in Vietnam. 
Analyze custody, asset division, and provide a procedure roadmap.
CRITICAL: Generate an 'Execution Roadmap' (executionRoadmap) focusing on efficiency and safety.
- Group tasks by location (e.g., Ward Police, Court, Mediation Center).
- If 'Panic Mode' or Domestic Violence is detected, prioritize safety steps (e.g., "Trip 1: Police Station to file report").
- Clearly assign tasks: What the client does alone vs. what the lawyer handles.
- List required documents for each specific trip.
`;

export const DOCUMENT_GENERATION_SYSTEM_INSTRUCTION = "Generate a legal document based on the provided type and information. Use formal Vietnamese legal terminology.";
export const TACTICAL_DRAFTING_INSTRUCTION = "Draft this paragraph with specific tactical intent (assertive, defensive, etc.) as requested. Annotate key word choices.";
export const OPPONENT_ANALYSIS_SYSTEM_INSTRUCTION = "Analyze the opponent's arguments. Find weaknesses, counter-arguments, and supporting evidence.";
export const PREDICT_OPPONENT_ARGS_SYSTEM_INSTRUCTION = "Predict potential arguments the opponent might use based on the case facts.";
export const DEVIL_ADVOCATE_SYSTEM_INSTRUCTION = "Play the Devil's Advocate. Critique the current case strategy and identify weaknesses.";
export const ARGUMENT_GENERATION_SYSTEM_INSTRUCTION = "Generate a coherent legal argument based on the selected nodes from the argument map.";
export const ARGUMENT_NODE_CHAT_SYSTEM_INSTRUCTION = `Chat about a specific node in the argument map. Provide insights or expand on the node's content. ${DIRECT_RESPONSE_PROTOCOL}`;
export const INTELLIGENT_SEARCH_SYSTEM_INSTRUCTION = "Answer the user's question based on the full context of the case report and files.";
export const CONTEXTUAL_CHAT_SYSTEM_INSTRUCTION = `Engage in a chat about a specific section of the analysis report. Provide detailed explanations and further advice. ${DIRECT_RESPONSE_PROTOCOL}`;
export const QUICK_ANSWER_REFINE_SYSTEM_INSTRUCTION = "Refine the consulting answer based on the selected mode (concise, empathetic, formal, etc.).";
export const CONSULTING_CHAT_UPDATE_SYSTEM_INSTRUCTION = `Continue the consulting chat. Update the report if new information is provided. ${DIRECT_RESPONSE_PROTOCOL}`;
export const LITIGATION_CHAT_UPDATE_SYSTEM_INSTRUCTION = `Continue the litigation chat. Update the report if new information is provided. ${DIRECT_RESPONSE_PROTOCOL}`;
export const BUSINESS_FORMATION_CHAT_UPDATE_SYSTEM_INSTRUCTION = `Continue the business formation chat. Update the report if new information is provided. ${DIRECT_RESPONSE_PROTOCOL}`;
export const LAND_PROCEDURE_CHAT_UPDATE_SYSTEM_INSTRUCTION = `Continue the land procedure chat. Update the report if new information is provided. ${DIRECT_RESPONSE_PROTOCOL}`;
export const DIVORCE_CHAT_UPDATE_SYSTEM_INSTRUCTION = `Continue the divorce chat. Update the report if new information is provided. ${DIRECT_RESPONSE_PROTOCOL}`;
export const CUNNING_LAWYER_PERSONA = "You are a cunning, strategic lawyer.";
export const KNOWLEDGE_BASE_RULES = "Base your analysis on Vietnamese laws and legal precedents.";
