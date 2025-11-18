
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

export interface ProposedStrategy {
    preLitigation: string[];
    litigation: string[];
    psychologicalStrategy?: string; // NEW: Chiến lược tâm lý & Phán đoán
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
  requestResolutionPlan?: string[];
  customNotes?: string;
  quickSummary?: string;
  userAddedLaws?: ApplicableLaw[]; // Field for user-added legal bases
  contingencyPlan?: string[]; // phương án xử lý nếu thua kiện
  prospectsChat?: ChatMessage[]; // For Case Prospects chat
  gapAnalysisChat?: ChatMessage[]; // For Gap Analysis chat
  strategyChat?: ChatMessage[]; // For Proposed Strategy chat
  resolutionPlanChat?: ChatMessage[]; // For Request Resolution Plan chat
  intelligentSearchChat?: ChatMessage[]; // For Intelligent Q&A
  argumentGraph?: ArgumentGraph; // Data for the Argument Map
  opponentAnalysis?: OpponentArgument[]; // For Opponent Argument Analysis
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
    negotiationLeverage?: string; // NEW: Đòn bẩy đàm phán & Đọc vị đối phương
}

// --- New Business Formation Report Structure ---
export interface BusinessFormationReport {
    modelComparison: {
        business: { pros: string[], cons: string[] },
        soleProprietorship: { pros: string[], cons: string[] },
        recommendation: string;
        recommendationReasoning: string;
    };
    taxAnalysis: {
        businessTaxes: { name: string, description: string }[];
        soleProprietorshipTaxes: { name: string, description: string }[];
        optimizationTips: string[];
    };
    procedureGuide: {
        businessSteps: { step: string, description: string, documents: string }[];
        soleProprietorshipSteps: { step: string, description: string, documents: string }[];
    };
    validExpensesGuide: string[];
    legalRisks: string[];
    regulatoryArbitrage?: string; // NEW: Chiến thuật lách luật/tối ưu cơ chế
    globalChatHistory?: ChatMessage[];
}

// --- NEW: Land Procedure Report Structure ---
export interface LandProcedureReport {
    procedureType: string; // e.g., "Transfer", "Inheritance"
    localRegulations: string; // Citation of specific provincial decisions
    stepByStepGuide: { step: string; description: string; location: string; estimatedTime: string }[];
    documentChecklist: { name: string; required: boolean; notes: string; status: 'missing' | 'available' }[];
    financialEstimation: {
        item: string;
        amount: string; // Estimate or formula
        basis: string; // Legal basis for calculation (e.g., 2% TNCN)
    }[];
    legalRisksAndTips: string[]; // Cunning lawyer tips for land
    globalChatHistory?: ChatMessage[];
}

// --- NEW: Divorce Report Structure ---
export interface DivorceReport {
    divorceType: 'ThuanTinh' | 'DonPhuong'; // Amicable or Unilateral
    custodyAnalysis: {
        strategy: string;
        evidenceNeeded: string[];
        cunningTips: string; // How to win custody
    };
    assetDivision: {
        commonAssets: string[];
        privateAssets: string[];
        divisionStrategy: string; // How to maximize asset retention
        cunningTips: string;
    };
    procedureRoadmap: { step: string; description: string }[];
    emotionalAndLegalAdvice: string;
    globalChatHistory?: ChatMessage[];
}


// --- Types for Case Management ---

export type LitigationType = 'civil' | 'criminal' | 'administrative';
export type LitigationStage = string; // Now a generic string to accommodate dynamic stages

export interface SerializableFile {
    name: string;
    type: string;
    content: string; // base64 encoded string
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
    landProcedureReport?: LandProcedureReport | null; // NEW
    divorceReport?: DivorceReport | null; // NEW
    jurisdiction?: string;
}
