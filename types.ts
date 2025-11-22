
export type FileCategory = 'Contract' | 'Correspondence' | 'Minutes' | 'Evidence' | 'Image' | 'Uncategorized';

export interface UploadedFile {
  id: string;
  file: File;
  preview: string | null;
  category: FileCategory;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export interface SerializableFile {
  name: string;
  type: string;
  content: string; // base64
  category: FileCategory;
}

export type AppWorkflowType = 'litigation' | 'consulting' | 'businessFormation' | 'landProcedure' | 'divorceConsultation';

export type LitigationType = 'civil' | 'criminal' | 'administrative' | null;

export type LitigationStage = 'first_instance' | 'appellate' | 'cassation' | 'enforcement' | 'consulting';

export interface SavedCase {
  id: string;
  name: string;
  workflowType: AppWorkflowType;
  caseContent: string;
  clientRequest: string;
  query: string;
  files: SerializableFile[];
  createdAt: string;
  updatedAt: string;
  litigationType: LitigationType;
  litigationStage: LitigationStage;
  analysisReport: AnalysisReport | null;
  jurisdiction?: string;
  consultingReport?: ConsultingReport | null;
  businessFormationReport?: BusinessFormationReport | null;
  landProcedureReport?: LandProcedureReport | null;
  divorceReport?: DivorceReport | null;
  landChecklistState?: number[];
  roadmapState?: string[];
  divorceAssets?: AssetItem[];
  divorcePanicMode?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface CaseTimelineEvent {
  date: string;
  description: string;
  eventType: 'Contract' | 'Payment' | 'Communication' | 'LegalAction' | 'Milestone' | 'Other';
  sourceDocument?: string;
  significance: 'High' | 'Medium' | 'Low';
}

export interface ProceduralStatus {
  partyName: string;
  status: string;
}

export interface SymbolAnalysis {
  symbol: string;
  period: string;
  meaning: string;
  currentEquivalent: string;
}

export interface SupportingEvidence {
  snippet: string;
  sourceDocument: string;
}

export interface LawArticle {
  articleNumber: string;
  summary: string;
}

export interface ApplicableLaw {
  documentName: string;
  articles: LawArticle[];
  coreIssueAddressed?: string;
  relevanceToCase?: string;
  supportingEvidence?: SupportingEvidence[];
}

export interface LegalLoophole {
  description: string;
  suggestion: string;
  severity: 'Cao' | 'Trung bình' | 'Thấp';
  classification: 'Hợp đồng' | 'Quy phạm Pháp luật' | 'Tố tụng' | 'Khác';
  evidence?: string;
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

export interface CrossExamQuestion {
  target: string;
  type: 'Leading' | 'Open' | 'Locking';
  question: string;
  goal: string;
}

export interface ProposedStrategy {
  preLitigation: string[];
  litigation: string[];
  psychologicalStrategy?: string[]; // Or string, simplified to any to accommodate various AI outputs
  proceduralTactics?: string[];
  layeredStrategy?: {
      surfaceStrategy: string[];
      deepStrategy: string[];
  };
  crossExaminationPlan?: CrossExamQuestion[];
}

export interface WinProbability {
  score: number;
  rationale: string;
  swingFactors: string[];
}

export interface ExecutionTask {
  taskName: string;
  description: string;
  actor: 'Client' | 'Lawyer' | 'Both';
}

export interface ExecutionTrip {
  location: string;
  tasks: ExecutionTask[];
  documentsToBring: string[];
  notes?: string;
}

export interface ExecutionRoadmap {
  trips: ExecutionTrip[];
}

export interface OpponentArgument {
  argument: string;
  weaknesses: string[];
  counterArguments: string[];
  supportingEvidence: string[];
}

export type ArgumentNodeType = 'fact' | 'evidence' | 'claim' | 'legal_basis' | 'counter_argument' | 'custom';

export interface ArgumentNode {
  id: string;
  type: ArgumentNodeType;
  label: string;
  content: string;
  position: { x: number; y: number };
  chatHistory?: ChatMessage[];
}

export interface ArgumentEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface ArgumentGraph {
  nodes: ArgumentNode[];
  edges: ArgumentEdge[];
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
    symbolsAnalysis?: SymbolAnalysis[];
  };
  applicableLaws: ApplicableLaw[];
  gapAnalysis: GapAnalysis;
  caseProspects: CaseProspects;
  proposedStrategy: ProposedStrategy;
  winProbabilityAnalysis?: WinProbability;
  requestResolutionPlan?: string[];
  customNotes?: string;
  quickSummary?: string;
  userAddedLaws?: ApplicableLaw[];
  contingencyPlan?: string[];
  executionRoadmap?: ExecutionRoadmap;
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

export interface ConsultingReport {
    conciseAnswer: string;
    negotiationLeverage?: string;
    preliminaryAssessment: string;
    legalLoopholes: LegalLoophole[];
    proposedRoadmap: { stage: string; description: string }[];
    caseType?: LitigationType | 'unknown';
    globalChatHistory?: ChatMessage[];
    taxAnalysis?: any; // Optional now
    modelComparison?: any;
    procedureGuide?: any;
    validExpensesGuide?: any;
    legalRisks?: any;
}

export interface BusinessFormationReport {
    modelComparison: {
        recommendation: string;
        recommendationReasoning: string;
        business: { pros: string[]; cons: string[] };
        soleProprietorship: { pros: string[]; cons: string[] };
        costComparison?: {
            setupCost: string;
            accountingCost: string;
            taxComplexity: string;
        };
    };
    taxAnalysis: {
        businessTaxes: { name: string; description: string }[];
        soleProprietorshipTaxes: { name: string; description: string }[];
        optimizationTips: string;
        vatManagementGuide?: {
            storageRules: string;
            inputInvoiceChecklist: string[];
            deductionTactics: string;
        };
        nonInvoiceInputGuide?: {
            strategy: string;
            documentation: string[];
            risks: string;
        };
    };
    regulatoryArbitrage?: string;
    procedureGuide: {
        businessSteps: { step: string; description: string }[];
        soleProprietorshipSteps: { step: string; description: string }[];
    };
    validExpensesGuide: string;
    legalRisks: { risk: string; prevention: string }[];
    globalChatHistory?: ChatMessage[];
}

export interface LandProcedureReport {
    executionRoadmap?: ExecutionRoadmap;
    stepByStepGuide: { step: string; description: string; estimatedTime: string; location: string }[];
    documentChecklist: { name: string; required: boolean; notes: string; status: 'available' | 'missing' }[];
    financialEstimation: { item: string; amount: string; basis: string }[];
    insiderTips?: string;
    globalChatHistory?: ChatMessage[];
}

export interface DivorceReport {
    divorceType: 'ThuanTinh' | 'DonPhuong';
    custodyAnalysis: {
        strategy: string;
        evidenceNeeded: string[];
        custodyLeveragePoints?: string;
        cunningTips?: string;
    };
    assetDivision: {
        commonAssets: string[];
        privateAssets: string[];
        divisionStrategy: string;
        assetTracingStrategy?: string;
        cunningTips?: string;
    };
    procedureRoadmap: { step: string; description: string }[];
    emotionalAndLegalAdvice: string;
    practicalObstacles?: { obstacle: string; realityCheck: string; counterMeasure: string }[];
    executionRoadmap?: ExecutionRoadmap;
    globalChatHistory?: ChatMessage[];
}

export interface ParagraphGenerationOptions {
    tone: 'assertive' | 'persuasive' | 'formal' | 'conciliatory' | 'warning';
    terminology: 'legal' | 'plain';
    detail: 'concise' | 'detailed';
    outputFormat: 'text' | 'markdown';
}

export type DraftingMode = 'standard' | 'tactical';

export type DocType = '' | 'legalServiceContract' | 'demandLetter' | 'powerOfAttorney' | 'meetingMinutes' | 'lawsuit' | 'evidenceList' | 'civilMatterPetition' | 'statement' | 'appeal' | 'civilContract' | 'businessRegistration' | 'divorcePetition' | 'will' | 'enforcementPetition' | 'complaint' | 'reviewPetition' | 'inheritanceWaiver' | 'statementOfOpinion' | 'defenseStatement' | 'enterpriseRegistration' | 'householdRegistration' | 'landRegistrationApplication' | 'divorceAgreement' | 'noContactOrder';

export type FormData = Record<string, string>;

export interface AssetItem {
    id: string;
    name: string;
    value: number;
    status: 'common' | 'private';
    allocation: 'husband' | 'wife' | 'sell_split';
}
