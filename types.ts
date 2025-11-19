
export type FileCategory = 'Uncategorized' | 'Contract' | 'Correspondence' | 'Minutes' | 'Evidence' | 'Image';

export interface UploadedFile {
    id: string;
    file: File;
    preview: string | null; 
    category: FileCategory;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    error?: string;
}

export type DocType = '' | 'legalServiceContract' | 'demandLetter' | 'powerOfAttorney' | 'meetingMinutes' | 'lawsuit' | 'evidenceList' | 'civilMatterPetition' | 'statement' | 'appeal' | 'civilContract' | 'businessRegistration' | 'divorcePetition' | 'will' | 'enforcementPetition' | 'complaint' | 'reviewPetition' | 'inheritanceWaiver' | 'statementOfOpinion' | 'defenseStatement' | 'enterpriseRegistration' | 'householdRegistration' | 'landRegistrationApplication' | 'divorceAgreement';

// A single, flexible interface for all form data
export interface FormData {
    [key: string]: string | undefined;
}

export interface ParagraphGenerationOptions {
  tone: 'assertive' | 'persuasive' | 'formal' | 'conciliatory' | 'warning';
  terminology: 'legal' | 'plain';
  detail: 'concise' | 'detailed';
  outputFormat: 'text' | 'markdown';
}

// --- New Strategic Drafting Type ---
export type DraftingMode = 'assertive' | 'rebuttal' | 'persuasive' | 'formal';


// --- New Analysis Report Structure ---

export interface LawArticle {
    articleNumber: string;
    summary: string;
}

export interface SupportingEvidence {
    sourceDocument: string;
    snippet: string;
}

export interface ApplicableLaw {
    documentName: string;
    coreIssueAddressed?: string; // Analysis of the main issue the law covers.
    relevanceToCase?: string;    // How this law applies to the current case.
    articles: LawArticle[];
    supportingEvidence?: SupportingEvidence[];
}

export interface LegalLoophole {
    classification: 'Hợp đồng' | 'Quy phạm Pháp luật' | 'Tố tụng' | 'Khác';
    description: string;
    severity: 'Cao' | 'Trung bình' | 'Thấp';
    suggestion: string;
    evidence: string; // The text snippet from the document
}

export interface GapAnalysis {
    missingInformation: string[];
    recommendedActions: string[];
    legalLoopholes: LegalLoophole[];
}

export interface CaseProspects {
    strengths: string[];
    weaknesses: string[];
    risks: string[];
}

// --- ADVANCED LITIGATION TYPES (Cunning Lawyer Upgrade) ---

export interface CrossExamQuestion {
    question: string;
    type: 'Leading' | 'Locking' | 'Open' | 'Clarifying';
    target: string; // Who to ask (Witness, Opponent)
    goal: string; // What fact to prove/disprove
    expectedAnswer: string; // Anticipated response
}

export interface StrategyLayer {
    surfaceStrategy: string[]; // Phương án bề nổi (Public stance)
    deepStrategy: string[];    // Phương án ngầm (Hidden tactical goal)
}

export interface WinProbability {
    score: number; // 0-100
    rationale: string;
    swingFactors: string[]; // Factors that could change the outcome
}

export interface ProposedStrategy {
    preLitigation: string[];
    litigation: string[];
    proceduralTactics?: string[]; 
    psychologicalStrategy?: string; 
    crossExaminationPlan?: CrossExamQuestion[]; // NEW: Kế hoạch thẩm vấn chéo
    layeredStrategy?: StrategyLayer; // NEW: Chiến lược Ẩn - Hiện
}

export interface ProceduralStatus {
  partyName: string;
  status: string; // e.g., 'Nguyên đơn', 'Bị đơn'
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface CaseTimelineEvent {
    date: string; // YYYY-MM-DD
    description: string;
    sourceDocument: string;
    eventType: 'Contract' | 'Payment' | 'Communication' | 'LegalAction' | 'Milestone' | 'Other';
    significance: 'High' | 'Medium' | 'Low';
}

// --- Argument Map Types ---
export type ArgumentNodeType = 
  | 'legalIssue'
  | 'strength'
  | 'weakness'
  | 'risk'
  | 'timelineEvent'
  | 'applicableLaw'
  | 'loophole'
  | 'custom';

export interface ArgumentNode {
  id: string;
  type: ArgumentNodeType;
  label: string; // Short title, e.g., "Legal Issue 1", "Strength 3"
  content: string; // The full text of the item
  position: { x: number; y: number };
  chatHistory?: ChatMessage[];
}

export interface ArgumentEdge {
  id: string;
  source: string; // source node id
  target: string; // target node id
}

export interface ArgumentGraph {
  nodes: ArgumentNode[];
  edges: ArgumentEdge[];
}

export interface OpponentArgument {
    argument: string;
    weaknesses: string[];
    counterArguments: string[];
    supportingEvidence: string[];
}

export interface AnalysisReport {
  editableCaseSummary?: string;
  caseTimeline: CaseTimelineEvent[];
  litigationStage: LitigationStage;
  proceduralStatus: ProceduralStatus[];
  legalRelationship: string;
  coreLegalIssues: string[];
  landInfo?: {
    mapSheetNumber?: string;
    parcelNumber?: string;
    address?: string;
    area?: string;
    landUsePurpose?: string;
    landUseTerm?: string;
    landUseSource?: string;
    planningStatus?: string;
  };
  applicableLaws: ApplicableLaw[];
  gapAnalysis: GapAnalysis;
  caseProspects: CaseProspects;
  proposedStrategy: ProposedStrategy;
  winProbabilityAnalysis?: WinProbability; // NEW: Phân tích xác suất thắng thua
  requestResolutionPlan?: string[];
  customNotes?: string;
  quickSummary?: string;
  userAddedLaws?: ApplicableLaw[]; 
  contingencyPlan?: string[]; 
  prospectsChat?: ChatMessage[]; 
  gapAnalysisChat?: ChatMessage[]; 
  strategyChat?: ChatMessage[]; 
  resolutionPlanChat?: ChatMessage[]; 
  intelligentSearchChat?: ChatMessage[]; 
  argumentGraph?: ArgumentGraph; 
  opponentAnalysis?: OpponentArgument[]; 
  applicableLawsChat?: ChatMessage[];
  contingencyPlanChat?: ChatMessage[];
  globalChatHistory?: ChatMessage[];
}

// --- New Consulting Report Structure ---
export interface ConsultingReport {
    discussionPoints: string[];
    caseType: LitigationType | 'unknown';
    preliminaryStage: string;
    suggestedDocuments: string[];
    legalLoopholes?: LegalLoophole[];
    conciseAnswer?: string;
    globalChatHistory?: ChatMessage[];
    preliminaryAssessment?: string;
    proposedRoadmap?: {
        stage: string;
        description: string;
        outcome: string;
    }[];
    nextActions?: string[];
    negotiationLeverage?: string;
    negotiationTactics?: { // NEW: Đàm phán bậc cao
        anchoringPoint: string; // Điểm neo giá
        silenceTactics: string; // Khi nào nên im lặng
        pacingStrategy: string; // Điều tiết nhịp độ
    };
}

// --- New Business Formation Report Structure ---
export interface BusinessFormationReport {
    modelComparison: {
        business: { pros: string[], cons: string[] },
        soleProprietorship: { pros: string[], cons: string[] },
        costComparison: { 
             setupCost: string; 
             accountingCost: string; 
             taxComplexity: string; 
        };
        recommendation: string;
        recommendationReasoning: string;
    };
    taxAnalysis: {
        businessTaxes: { name: string, description: string }[];
        soleProprietorshipTaxes: { name: string, description: string }[];
        optimizationTips: string[];
        vatManagementGuide?: {
            storageRules: string;
            deductionTactics: string[];
            inputInvoiceChecklist: string[];
        };
        nonInvoiceInputGuide?: {
            strategy: string;
            documentation: string[];
            risks: string;
        };
    };
    procedureGuide: {
        businessSteps: { step: string, description: string, documents: string }[];
        soleProprietorshipSteps: { step: string, description: string, documents: string }[];
    };
    validExpensesGuide: string[];
    legalRisks: string[];
    regulatoryArbitrage?: string; 
    globalChatHistory?: ChatMessage[];
}

// --- NEW: Land Procedure Report Structure ---
export interface LandProcedureReport {
    procedureType: string; 
    localRegulations: string; 
    stepByStepGuide: { step: string; description: string; location: string; estimatedTime: string }[];
    documentChecklist: { name: string; required: boolean; notes: string; status: 'missing' | 'available' }[];
    financialEstimation: {
        item: string;
        amount: string; 
        basis: string; 
    }[];
    legalRisksAndTips: string[]; 
    globalChatHistory?: ChatMessage[];
}

// --- NEW: Divorce Report Structure ---
export interface DivorceReport {
    divorceType: 'ThuanTinh' | 'DonPhuong'; 
    custodyAnalysis: {
        strategy: string;
        evidenceNeeded: string[];
        cunningTips: string; 
    };
    assetDivision: {
        commonAssets: string[];
        privateAssets: string[];
        divisionStrategy: string; 
        cunningTips: string;
    };
    procedureRoadmap: { step: string; description: string }[];
    emotionalAndLegalAdvice: string;
    globalChatHistory?: ChatMessage[];
}


// --- Types for Case Management ---

export type LitigationType = 'civil' | 'criminal' | 'administrative';
export type LitigationStage = string; 

export interface SerializableFile {
    name: string;
    type: string;
    content: string; 
}

export interface SavedCase {
    id: string;
    name: string;
    workflowType: 'consulting' | 'litigation' | 'businessFormation' | 'landProcedure' | 'divorceConsultation';
    caseContent: string;
    clientRequest: string;
    query: string;
    files: SerializableFile[];
    createdAt: string;
    updatedAt: string;
    litigationType: LitigationType | null;
    litigationStage: LitigationStage;
    analysisReport: AnalysisReport | null;
    consultingReport?: ConsultingReport | null;
    businessFormationReport?: BusinessFormationReport | null;
    landProcedureReport?: LandProcedureReport | null; 
    divorceReport?: DivorceReport | null; 
    jurisdiction?: string;
}
