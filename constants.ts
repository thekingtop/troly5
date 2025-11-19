
import { Type } from "@google/genai";
import type { FileCategory, DocType, LitigationType, LitigationStage, ArgumentNodeType, DraftingMode } from "./types";

export const fileCategoryLabels: Record<FileCategory, string> = {
    Uncategorized: 'Chưa phân loại',
    Contract: 'Hợp đồng / Thỏa thuận',
    Correspondence: 'Email / Tin nhắn',
    Minutes: 'Biên bản làm việc',
    Image: 'Hình ảnh / Sơ đồ',
    Evidence: 'Chứng cứ khác',
};

export const nodeTypeMeta: Record<ArgumentNodeType, { color: string, label: string }> = {
    legalIssue: { color: 'bg-red-100 border-red-400', label: 'Vấn đề pháp lý' },
    strength: { color: 'bg-green-100 border-green-400', label: 'Điểm mạnh' },
    weakness: { color: 'bg-amber-100 border-amber-400', label: 'Điểm yếu' },
    risk: { color: 'bg-orange-100 border-orange-400', label: 'Rủi ro' },
    timelineEvent: { color: 'bg-sky-100 border-sky-400', label: 'Sự kiện' },
    applicableLaw: { color: 'bg-indigo-100 border-indigo-400', label: 'Cơ sở pháp lý' },
    loophole: { color: 'bg-purple-100 border-purple-400', label: 'Lỗ hổng pháp lý' },
    custom: { color: 'bg-slate-100 border-slate-400', label: 'Ghi chú' },
};

export const DRAFTING_MODE_LABELS: Record<DraftingMode, string> = {
    assertive: 'Lập luận Tấn công / Chủ động',
    rebuttal: 'Phản bác Sắc bén (cho Kháng cáo)',
    persuasive: 'Lập luận Thuyết phục / Hòa giải',
    formal: 'Trang trọng / Trung lập',
};

// ... (Fields and labels remain unchanged, abbreviated for brevity)
export const DOC_TYPE_FIELDS: Partial<Record<DocType, string[]>> = {
  legalServiceContract: ["lawFirmName", "lawFirmAddress", "lawFirmTaxCode", "lawFirmRep", "clientName", "clientId", "clientAddress", "clientPhone", "caseSummary", "clientRequest", "feeAmount", "paymentTerms", "scopeOfWork"],
  demandLetter: ["lawFirmName", "clientName", "recipientName", "recipientAddress", "subject", "caseSummary", "demands", "deadline"],
  powerOfAttorney: ["principalName", "principalDob", "principalId", "principalIdIssueDate", "principalIdIssuePlace", "principalAddress", "agentName", "agentDob", "agentId", "agentIdIssueDate", "agentIdIssuePlace", "agentAddress", "scope", "term", "location"],
  lawsuit: ["courtName", "disputeType", "plaintiffName", "plaintiffId", "plaintiffAddress", "plaintiffPhone", "defendantName", "defendantAddress", "caseContent", "requests", "evidence"],
  divorcePetition: ["courtName", "petitionerName", "petitionerId", "petitionerAddress", "respondentName", "respondentAddress", "marriageInfo", "reason", "childrenInfo", "propertyInfo"],
  enforcementPetition: ["enforcementAgency", "creditorName", "creditorId", "creditorAddress", "debtorName", "debtorAddress", "judgmentDetails", "enforcementContent"],
  will: ["testatorName", "testatorDob", "testatorId", "testatorAddress", "willContent", "executor", "witnesses", "location", "willDate", "willYear"],
  statementOfOpinion: ["courtName", "presenterName", "presenterDob", "presenterId", "presenterIdIssueDate", "presenterIdIssuePlace", "presenterAddress", "presenterProceduralStatus", "representedPartyName", "representedPartyAddress", "representedPartyLegalRep", "caseNumber", "caseAcceptanceDate", "caseName", "plaintiffName", "defendantName", "caseSummary", "disputeEvent", "postEventActions", "firstInstanceSummary", "furtherProceedings", "currentStatus", "argument1Title", "argument1Basis", "argument1Analysis", "argument2Title", "argument2Basis", "argument2Analysis", "argument3Title", "argument3Basis", "argument3Analysis", "finalConfirmation", "courtRequest", "location", "documentDate"],
  defenseStatement: ["courtName", "caseNumber", "plaintiffName", "defendantName", "defendantAddress", "caseSummary", "plaintiffArguments", "rebuttalArgument1", "rebuttalEvidence1", "rebuttalArgument2", "rebuttalEvidence2", "mitigatingCircumstances", "defendantRequest", "location", "documentDate"],
  enterpriseRegistration: ["companyNameVN", "companyNameEN", "companyAddress", "businessLines", "charterCapital", "ownerName", "ownerDob", "ownerId", "ownerAddress", "legalRepName", "legalRepDob", "legalRepId", "legalRepAddress", "legalRepTitle"],
  householdRegistration: ["businessName", "businessAddress", "businessLines", "capital", "ownerName", "ownerDob", "ownerId", "ownerAddress", "ownerPhone"],
  landRegistrationApplication: ["landUser", "landAddress", "parcelNumber", "mapSheetNumber", "registrationType", "documentsAttached"],
  divorceAgreement: ["husbandName", "wifeName", "childCustodyAgreement", "propertyDivisionAgreement", "debtAgreement"]
};

export const FIELD_LABELS: Record<string, string> = {
  lawFirmName: "Tên tổ chức hành nghề luật sư", lawFirmAddress: "Địa chỉ", lawFirmTaxCode: "Mã số thuế", lawFirmRep: "Người đại diện", clientName: "Tên khách hàng", clientId: "Số CCCD/CMND/Hộ chiếu", clientAddress: "Địa chỉ thường trú", clientPhone: "Số điện thoại", caseSummary: "Tóm tắt nội dung vụ việc", clientRequest: "Yêu cầu của khách hàng", feeAmount: "Phí dịch vụ", paymentTerms: "Điều khoản thanh toán", scopeOfWork: "Phạm vi công việc", recipientName: "Tên người nhận", recipientAddress: "Địa chỉ người nhận", subject: "Về việc", demands: "Các yêu cầu", deadline: "Thời hạn thực hiện", principalName: "Tên người ủy quyền", principalDob: "Ngày sinh", principalId: "Số CCCD/CMND (Người ủy quyền)", principalIdIssueDate: "Ngày cấp", principalIdIssuePlace: "Nơi cấp", principalAddress: "Địa chỉ thường trú (Người ủy quyền)", agentName: "Tên người được ủy quyền", agentDob: "Ngày sinh (Người được ủy quyền)", agentId: "Số CCCD/CMND (Người được ủy quyền)", agentIdIssueDate: "Ngày cấp (Người được ủy quyền)", agentIdIssuePlace: "Nơi cấp (Người được ủy quyền)", agentAddress: "Địa chỉ thường trú (Người được ủy quyền)", scope: "Phạm vi ủy quyền", term: "Thời hạn ủy quyền", location: "Địa điểm", courtName: "Tên Tòa án", disputeType: "Loại tranh chấp", plaintiffName: "Tên người khởi kiện (Nguyên đơn)", plaintiffId: "Số CCCD/CMND (Nguyên đơn)", plaintiffAddress: "Địa chỉ (Nguyên đơn)", plaintiffPhone: "Số điện thoại (Nguyên đơn)", defendantName: "Tên người bị kiện (Bị đơn)", defendantAddress: "Địa chỉ (Bị đơn)", caseContent: "Nội dung vụ án", requests: "Yêu cầu Tòa án giải quyết", evidence: "Chứng cứ kèm theo", petitionerName: "Tên người làm đơn", petitionerId: "Số CCCD/CMND (Người làm đơn)", petitionerAddress: "Địa chỉ (Người làm đơn)", respondentName: "Tên người bị yêu cầu", respondentAddress: "Địa chỉ (Người bị yêu cầu)", marriageInfo: "Thông tin hôn nhân (số GCN, ngày, nơi ĐK)", reason: "Lý do ly hôn", childrenInfo: "Thông tin về con chung", propertyInfo: "Thông tin về tài sản chung", enforcementAgency: "Tên Cơ quan Thi hành án", creditorName: "Tên người được thi hành án", creditorId: "Số CCCD/CMND (Người được THA)", creditorAddress: "Địa chỉ (Người được THA)", debtorName: "Tên người phải thi hành án", debtorAddress: "Địa chỉ (Người phải THA)", judgmentDetails: "Thông tin bản án/quyết định", enforcementContent: "Nội dung yêu cầu thi hành án", testatorName: "Tên người lập di chúc", testatorDob: "Ngày sinh (Người lập di chúc)", testatorId: "Số CCCD/CMND (Người lập di chúc)", testatorAddress: "Địa chỉ (Người lập di chúc)", willContent: "Nội dung di chúc", executor: "Người thi hành di chúc", witnesses: "Người làm chứng", willDate: "Ngày lập di chúc", willYear: "Năm lập di chúc", presenterName: "Tên người trình bày", presenterDob: "Ngày sinh", presenterId: "Số CCCD/CMND", presenterIdIssueDate: "Ngày cấp", presenterIdIssuePlace: "Nơi cấp", presenterAddress: "Địa chỉ", presenterProceduralStatus: "Tư cách tố tụng", representedPartyName: "Tên người được đại diện/bảo vệ", representedPartyAddress: "Địa chỉ người được đại diện", representedPartyLegalRep: "Đại diện theo pháp luật (nếu có)", caseNumber: "Số vụ án", caseAcceptanceDate: "Ngày thụ lý", caseName: "Tên vụ án", disputeEvent: "Sự kiện phát sinh tranh chấp", postEventActions: "Diễn biến sau sự kiện", firstInstanceSummary: "Diễn biến/Kết quả phiên tòa sơ thẩm", furtherProceedings: "Diễn biến tố tụng tiếp theo", currentStatus: "Tình trạng hiện tại", argument1Title: "Luận điểm 1 (Tiêu đề)", argument1Basis: "Cơ sở pháp lý cho Luận điểm 1", argument1Analysis: "Phân tích, chứng minh Luận điểm 1", argument2Title: "Luận điểm 2 (Tiêu đề)", argument2Basis: "Cơ sở pháp lý cho Luận điểm 2", argument2Analysis: "Phân tích, chứng minh Luận điểm 2", argument3Title: "Luận điểm 3 (Tiêu đề)", argument3Basis: "Cơ sở pháp lý cho Luận điểm 3", argument3Analysis: "Phân tích, chứng minh Luận điểm 3", finalConfirmation: "Khẳng định cuối cùng", courtRequest: "Đề nghị với Tòa án", documentDate: "Ngày làm văn bản", plaintiffArguments: "Tóm tắt các lập luận của Nguyên đơn", rebuttalArgument1: "Luận điểm phản bác 1", rebuttalEvidence1: "Chứng cứ cho Luận điểm phản bác 1", rebuttalArgument2: "Luận điểm phản bác 2", rebuttalEvidence2: "Chứng cứ cho Luận điểm phản bác 2", mitigatingCircumstances: "Tình tiết giảm nhẹ (nếu có)", defendantRequest: "Đề nghị của Bị đơn", companyNameVN: "Tên công ty (tiếng Việt)", companyNameEN: "Tên công ty (tiếng Anh)", companyAddress: "Địa chỉ trụ sở chính", businessLines: "Ngành, nghề kinh doanh", charterCapital: "Vốn điều lệ", ownerName: "Tên chủ sở hữu / thành viên", ownerDob: "Ngày sinh (Chủ sở hữu)", ownerId: "Số CCCD/CMND (Chủ sở hữu)", ownerAddress: "Địa chỉ thường trú (Chủ sở hữu)", legalRepName: "Tên người đại diện theo pháp luật", legalRepDob: "Ngày sinh (Người đại diện)", legalRepId: "Số CCCD/CMND (Người đại diện)", legalRepAddress: "Địa chỉ thường trú (Người đại diện)", legalRepTitle: "Chức danh (Người đại diện)", businessName: "Tên hộ kinh doanh", businessAddress: "Địa chỉ kinh doanh", capital: "Vốn kinh doanh", ownerPhone: "Số điện thoại (Chủ hộ)", landUser: "Người sử dụng đất", landAddress: "Địa chỉ thửa đất", parcelNumber: "Số thửa", mapSheetNumber: "Tờ bản đồ số", registrationType: "Loại biến động", documentsAttached: "Tài liệu kèm theo", husbandName: "Tên Chồng", wifeName: "Tên Vợ", childCustodyAgreement: "Thỏa thuận về con chung", propertyDivisionAgreement: "Thỏa thuận về tài sản", debtAgreement: "Thỏa thuận về công nợ"
};

export const REGIONAL_COURTS: string[] = [
    "Tòa án nhân dân khu vực Ba Đình, thành phố Hà Nội", "Tòa án nhân dân khu vực Hoàn Kiếm, thành phố Hà Nội", "Tòa án nhân dân khu vực Hai Bà Trưng, thành phố Hà Nội", "Tòa án nhân dân khu vực Đống Đa, thành phố Hà Nội", "Tòa án nhân dân khu vực Tây Hồ, thành phố Hà Nội", "Tòa án nhân dân khu vực Cầu Giấy, thành phố Hà Nội", "Tòa án nhân dân khu vực Thanh Xuân, thành phố Hà Nội", "Tòa án nhân dân khu vực Hoàng Mai, thành phố Hà Nội", "Tòa án nhân dân khu vực Long Biên, thành phố Hà Nội", "Tòa án nhân dân khu vực Hà Đông, thành phố Hà Nội", "Tòa án nhân dân khu vực Bắc Từ Liêm, thành phố Hà Nội", "Tòa án nhân dân khu vực Nam Từ Liêm, thành phố Hà Nội", "Tòa án nhân dân khu vực Sóc Sơn, thành phố Hà Nội", "Tòa án nhân dân khu vực Đông Anh, thành phố Hà Nội", "Tòa án nhân dân khu vực Gia Lâm, thành phố Hà Nội", "Tòa án nhân dân khu vực Thanh Trì, thành phố Hà Nội", "Tòa án nhân dân khu vực Mê Linh, thành phố Hà Nội", "Tòa án nhân dân khu vực Sơn Tây - Ba Vì, thành phố Hà Nội", "Tòa án nhân dân khu vực Hoài Đức - Đan Phượng, thành phố Hà Nội", "Tòa án nhân dân khu vực Thanh Oai - Chương Mỹ - Mỹ Đức, thành phố Hà Nội", "Tòa án nhân dân khu vực Thạch Thất - Quốc Oai, thành phố Hà Nội", "Tòa án nhân dân khu vực Thường Tín - Phú Xuyên - Ứng Hòa, thành phố Hà Nội",
    "Tòa án nhân dân khu vực Quận 1, Thành phố Hồ Chí Minh", "Tòa án nhân dân khu vực Quận 3, Thành phố Hồ Chí Minh", "Tòa án nhân dân khu vực Quận 4, Thành phố Hồ Chí Minh", "Tòa án nhân dân khu vực Quận 5, Thành phố Hồ Chí Minh", "Tòa án nhân dân khu vực Quận 6, Thành phố Hồ Chí Minh", "Tòa án nhân dân khu vực Quận 7, Thành phố Hồ Chí Minh", "Tòa án nhân dân khu vực Quận 8, Thành phố Hồ Chí Minh", "Tòa án nhân dân khu vực Quận 10, Thành phố Hồ Chí Minh", "Tòa án nhân dân khu vực Quận 11, Thành phố Hồ Chí Minh", "Tòa án nhân dân khu vực Quận 12, Thành phố Hồ Chí Minh", "Tòa án nhân dân khu vực Gò Vấp, Thành phố Hồ Chí Minh", "Tòa án nhân dân khu vực Tân Bình, Thành phố Hồ Chí Minh", "Tòa án nhân dân khu vực Tân Phú, Thành phố Hồ Chí Minh", "Tòa án nhân dân khu vực Bình Thạnh, Thành phố Hồ Chí Minh", "Tòa án nhân dân khu vực Phú Nhuận, Thành phố Hồ Chí Minh", "Tòa án nhân dân khu vực Bình Tân, Thành phố Hồ Chí Minh", "Tòa án nhân dân khu vực Thủ Đức, Thành phố Hồ Chí Minh", "Tòa án nhân dân khu vực Củ Chi, Thành phố Hồ Chí Minh", "Tòa án nhân dân khu vực Hóc Môn, Thành phố Hồ Chí Minh", "Tòa án nhân dân khu vực Bình Chánh, Thành phố Hồ Chí Minh", "Tòa án nhân dân khu vực Nhà Bè, Thành phố Hồ Chí Minh", "Tòa án nhân dân khu vực Cần Giờ, Thành phố Hồ Chí Minh",
    "Tòa án nhân dân khu vực Long Xuyên, tỉnh An Giang", "Tòa án nhân dân khu vực Châu Đốc, tỉnh An Giang", "Tòa án nhân dân khu vực Tân Châu, tỉnh An Giang", "Tòa án nhân dân khu vực Chợ Mới, tỉnh An Giang", "Tòa án nhân dân khu vực Phú Tân, tỉnh An Giang", "Tòa án nhân dân khu vực Tịnh Biên - Tri Tôn, tỉnh An Giang", "Tòa án nhân dân khu vực An Phú - Châu Phú - Châu Thành, tỉnh An Giang",
];

export const litigationStagesByType: Record<LitigationType, { id: LitigationStage; label: string }[]> = {
  civil: [
    { id: 'consulting', label: 'Tư vấn ban đầu' }, { id: 'pre_litigation', label: 'Tiền tố tụng' }, { id: 'first_instance', label: 'Sơ thẩm' }, { id: 'appellate', label: 'Phúc thẩm' }, { id: 'cassation_reopening', label: 'Giám đốc thẩm / Tái thẩm' }, { id: 'enforcement', label: 'Thi hành án' },
  ],
  criminal: [
    { id: 'investigation', label: 'Điều tra' }, { id: 'prosecution', label: 'Truy tố' }, { id: 'first_instance_trial', label: 'Xét xử Sơ thẩm' }, { id: 'appellate_trial', label: 'Xét xử Phúc thẩm' }, { id: 'cassation_reopening', label: 'Giám đốc thẩm / Tái thẩm' }, { id: 'sentence_enforcement', label: 'Thi hành án' },
  ],
  administrative: [
    { id: 'complaint_dialogue', label: 'Khiếu nại / Đối thoại' }, { id: 'lawsuit_filing', label: 'Khởi kiện' }, { id: 'first_instance_admin', label: 'Sơ thẩm' }, { id: 'appellate_admin', label: 'Phúc thẩm' }, { id: 'cassation_reopening_admin', label: 'Giám đốc thẩm / Tái thẩm' }, { id: 'judgment_enforcement', label: 'Thi hành án' },
  ]
};

const allStages = [...litigationStagesByType.civil, ...litigationStagesByType.criminal, ...litigationStagesByType.administrative];

export const getStageLabel = (type: LitigationType, stageId: LitigationStage): string => {
  const stage = litigationStagesByType[type]?.find(s => s.id === stageId) || allStages.find(s => s.id === stageId);
  return stage ? stage.label : stageId;
};

export const litigationStageSuggestions = [...new Set(allStages.map(s => s.label))];

// --- Schemas (No changes needed except enforcing string format descriptions) ---

const lawArticleSchema = { type: Type.OBJECT, properties: { articleNumber: { type: Type.STRING }, summary: { type: Type.STRING } }, required: ["articleNumber", "summary"] };
const supportingEvidenceSchema = { type: Type.OBJECT, properties: { sourceDocument: { type: Type.STRING }, snippet: { type: Type.STRING } }, required: ["sourceDocument", "snippet"] };
const applicableLawSchema = { type: Type.OBJECT, properties: { documentName: { type: Type.STRING }, coreIssueAddressed: { type: Type.STRING }, relevanceToCase: { type: Type.STRING }, articles: { type: Type.ARRAY, items: lawArticleSchema }, supportingEvidence: { type: Type.ARRAY, items: supportingEvidenceSchema } }, required: ["documentName", "articles"] };
const legalLoopholeSchema = { type: Type.OBJECT, properties: { classification: { type: Type.STRING }, description: { type: Type.STRING }, severity: { type: Type.STRING }, suggestion: { type: Type.STRING }, evidence: { type: Type.STRING } }, required: ["classification", "description", "severity", "suggestion", "evidence"] };
const timelineEventSchema = { type: Type.OBJECT, properties: { date: { type: Type.STRING }, description: { type: Type.STRING }, sourceDocument: { type: Type.STRING }, eventType: { type: Type.STRING }, significance: { type: Type.STRING } }, required: ["date", "description", "sourceDocument", "eventType", "significance"] };
const landInfoSchema = { type: Type.OBJECT, properties: { mapSheetNumber: { type: Type.STRING }, parcelNumber: { type: Type.STRING }, address: { type: Type.STRING }, area: { type: Type.STRING }, landUsePurpose: { type: Type.STRING }, landUseTerm: { type: Type.STRING }, landUseSource: { type: Type.STRING }, planningStatus: { type: Type.STRING } } };
const crossExamQuestionSchema = { type: Type.OBJECT, properties: { question: { type: Type.STRING }, type: { type: Type.STRING, enum: ['Leading', 'Locking', 'Open', 'Clarifying'] }, target: { type: Type.STRING }, goal: { type: Type.STRING }, expectedAnswer: { type: Type.STRING } }, required: ["question", "type", "target", "goal"] };
const strategyLayerSchema = { type: Type.OBJECT, properties: { surfaceStrategy: { type: Type.ARRAY, items: { type: Type.STRING } }, deepStrategy: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["surfaceStrategy", "deepStrategy"] };
const winProbabilitySchema = { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, rationale: { type: Type.STRING }, swingFactors: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["score", "rationale", "swingFactors"] };

export const REPORT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        editableCaseSummary: { type: Type.STRING, description: "Tóm tắt vụ việc bằng TIẾNG VIỆT. Chi tiết, khách quan, độ dài 300-500 từ." },
        caseTimeline: { type: Type.ARRAY, items: timelineEventSchema },
        litigationStage: { type: Type.STRING },
        proceduralStatus: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { partyName: { type: Type.STRING }, status: { type: Type.STRING } }, required: ["partyName", "status"] } },
        legalRelationship: { type: Type.STRING },
        coreLegalIssues: { type: Type.ARRAY, items: { type: Type.STRING } },
        landInfo: landInfoSchema,
        applicableLaws: { type: Type.ARRAY, items: applicableLawSchema },
        gapAnalysis: { type: Type.OBJECT, properties: { missingInformation: { type: Type.ARRAY, items: { type: Type.STRING } }, recommendedActions: { type: Type.ARRAY, items: { type: Type.STRING } }, legalLoopholes: { type: Type.ARRAY, items: legalLoopholeSchema } } },
        caseProspects: { type: Type.OBJECT, properties: { strengths: { type: Type.ARRAY, items: { type: Type.STRING } }, weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }, risks: { type: Type.ARRAY, items: { type: Type.STRING } } } },
        winProbabilityAnalysis: winProbabilitySchema,
        proposedStrategy: { type: Type.OBJECT, properties: { preLitigation: { type: Type.ARRAY, items: { type: Type.STRING } }, litigation: { type: Type.ARRAY, items: { type: Type.STRING } }, proceduralTactics: { type: Type.ARRAY, items: { type: Type.STRING } }, psychologicalStrategy: { type: Type.STRING }, crossExaminationPlan: { type: Type.ARRAY, items: crossExamQuestionSchema }, layeredStrategy: strategyLayerSchema } },
        requestResolutionPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
        contingencyPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
        quickSummary: { type: Type.STRING, description: "Tóm tắt siêu ngắn (50 từ) bằng tiếng Việt." }
    },
    required: ["editableCaseSummary", "caseTimeline", "litigationStage", "proceduralStatus", "legalRelationship", "coreLegalIssues", "applicableLaws", "gapAnalysis", "caseProspects", "proposedStrategy", "winProbabilityAnalysis"],
};

export const SUMMARY_EXTRACTION_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        caseSummary: { type: Type.STRING, description: "Tóm tắt diễn biến vụ việc bằng TIẾNG VIỆT." },
        clientRequestSummary: { type: Type.STRING, description: "Tóm tắt yêu cầu của khách hàng bằng TIẾNG VIỆT." }
    },
    required: ["caseSummary", "clientRequestSummary"]
};

// ... (Other schemas remain unchanged)
export const CONSULTING_REPORT_SCHEMA = { type: Type.OBJECT, properties: { conciseAnswer: { type: Type.STRING }, discussionPoints: { type: Type.ARRAY, items: { type: Type.STRING } }, caseType: { type: Type.STRING }, preliminaryStage: { type: Type.STRING }, suggestedDocuments: { type: Type.ARRAY, items: { type: Type.STRING } }, legalLoopholes: { type: Type.ARRAY, items: legalLoopholeSchema }, preliminaryAssessment: { type: Type.STRING }, negotiationLeverage: { type: Type.STRING }, negotiationTactics: { type: Type.OBJECT, properties: { anchoringPoint: { type: Type.STRING }, silenceTactics: { type: Type.STRING }, pacingStrategy: { type: Type.STRING } } }, proposedRoadmap: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { stage: { type: Type.STRING }, description: { type: Type.STRING }, outcome: { type: Type.STRING } }, required: ["stage", "description", "outcome"] } }, nextActions: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["conciseAnswer", "discussionPoints", "caseType", "preliminaryStage", "suggestedDocuments"] };
export const BUSINESS_FORMATION_REPORT_SCHEMA = { type: Type.OBJECT, properties: { modelComparison: { type: Type.OBJECT, properties: { business: { type: Type.OBJECT, properties: { pros: { type: Type.ARRAY, items: { type: Type.STRING } }, cons: { type: Type.ARRAY, items: { type: Type.STRING } } } }, soleProprietorship: { type: Type.OBJECT, properties: { pros: { type: Type.ARRAY, items: { type: Type.STRING } }, cons: { type: Type.ARRAY, items: { type: Type.STRING } } } }, costComparison: { type: Type.OBJECT, properties: { setupCost: { type: Type.STRING }, accountingCost: { type: Type.STRING }, taxComplexity: { type: Type.STRING } }, required: ["setupCost", "accountingCost", "taxComplexity"] }, recommendation: { type: Type.STRING }, recommendationReasoning: { type: Type.STRING } } }, taxAnalysis: { type: Type.OBJECT, properties: { businessTaxes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING } } } }, soleProprietorshipTaxes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING } } } }, optimizationTips: { type: Type.ARRAY, items: { type: Type.STRING } }, vatManagementGuide: { type: Type.OBJECT, properties: { storageRules: { type: Type.STRING }, deductionTactics: { type: Type.ARRAY, items: { type: Type.STRING } }, inputInvoiceChecklist: { type: Type.ARRAY, items: { type: Type.STRING } } } }, nonInvoiceInputGuide: { type: Type.OBJECT, properties: { strategy: { type: Type.STRING }, documentation: { type: Type.ARRAY, items: { type: Type.STRING } }, risks: { type: Type.STRING } } } } }, procedureGuide: { type: Type.OBJECT, properties: { businessSteps: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { step: { type: Type.STRING }, description: { type: Type.STRING }, documents: { type: Type.STRING } } } }, soleProprietorshipSteps: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { step: { type: Type.STRING }, description: { type: Type.STRING }, documents: { type: Type.STRING } } } } } }, validExpensesGuide: { type: Type.ARRAY, items: { type: Type.STRING } }, legalRisks: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { risk: { type: Type.STRING }, prevention: { type: Type.STRING } }, required: ["risk", "prevention"] } }, regulatoryArbitrage: { type: Type.STRING } }, required: ["modelComparison", "taxAnalysis", "procedureGuide", "validExpensesGuide", "legalRisks"] };
export const LAND_PROCEDURE_REPORT_SCHEMA = { type: Type.OBJECT, properties: { procedureType: { type: Type.STRING }, localRegulations: { type: Type.STRING }, stepByStepGuide: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { step: { type: Type.STRING }, description: { type: Type.STRING }, location: { type: Type.STRING }, estimatedTime: { type: Type.STRING } }, required: ["step", "description", "location", "estimatedTime"] } }, documentChecklist: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, required: { type: Type.BOOLEAN }, notes: { type: Type.STRING }, status: { type: Type.STRING, enum: ['missing', 'available'] } }, required: ["name", "required", "notes"] } }, financialEstimation: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { item: { type: Type.STRING }, amount: { type: Type.STRING }, basis: { type: Type.STRING } }, required: ["item", "amount", "basis"] } }, legalRisksAndTips: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["procedureType", "stepByStepGuide", "documentChecklist", "financialEstimation", "legalRisksAndTips"] };
export const DIVORCE_REPORT_SCHEMA = { type: Type.OBJECT, properties: { divorceType: { type: Type.STRING, enum: ['ThuanTinh', 'DonPhuong'] }, custodyAnalysis: { type: Type.OBJECT, properties: { strategy: { type: Type.STRING }, evidenceNeeded: { type: Type.ARRAY, items: { type: Type.STRING } }, cunningTips: { type: Type.STRING } }, required: ["strategy", "evidenceNeeded", "cunningTips"] }, assetDivision: { type: Type.OBJECT, properties: { commonAssets: { type: Type.ARRAY, items: { type: Type.STRING } }, privateAssets: { type: Type.ARRAY, items: { type: Type.STRING } }, divisionStrategy: { type: Type.STRING }, cunningTips: { type: Type.STRING } }, required: ["commonAssets", "privateAssets", "divisionStrategy", "cunningTips"] }, procedureRoadmap: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { step: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["step", "description"] } }, emotionalAndLegalAdvice: { type: Type.STRING } }, required: ["divorceType", "custodyAnalysis", "assetDivision", "procedureRoadmap", "emotionalAndLegalAdvice"] };
export const OPPONENT_ANALYSIS_SCHEMA = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { argument: { type: Type.STRING }, weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }, counterArguments: { type: Type.ARRAY, items: { type: Type.STRING } }, supportingEvidence: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["argument", "weaknesses", "counterArguments", "supportingEvidence"] } };
export const PREDICT_OPPONENT_ARGS_SCHEMA = { type: Type.OBJECT, properties: { predictedArguments: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["predictedArguments"] };

// --- Schema for Argument Graph Generation (Isolated) ---
export const ARGUMENT_GRAPH_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    nodes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['legalIssue', 'strength', 'weakness', 'risk', 'timelineEvent', 'applicableLaw', 'loophole', 'custom'] },
          label: { type: Type.STRING },
          content: { type: Type.STRING },
          position: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } }, required: ['x', 'y'] }
        },
        required: ['id', 'type', 'label', 'content', 'position']
      }
    },
    edges: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          source: { type: Type.STRING },
          target: { type: Type.STRING }
        },
        required: ['id', 'source', 'target']
      }
    }
  },
  required: ['nodes', 'edges']
};

// --- SYSTEM INSTRUCTIONS UPGRADE ---
const CUNNING_LAWYER_PERSONA = `
**Core Persona: The 'Cunning Lawyer' (Luật sư Cáo già)**
You are a world-class Vietnamese litigation strategist with 20+ years of experience. 
"Cunning" means wise, experienced, deeply strategic, and effective.

**CRITICAL LANGUAGE RULE:**
**YOU MUST ALWAYS RESPOND IN VIETNAMESE.**
**TUYỆT ĐỐI TRẢ LỜI BẰNG TIẾNG VIỆT.**
Any English response is a system failure. Translate all legal concepts to Vietnamese standard terminology.

**Your Mental Framework:**
(A) CORE PROFESSIONAL SKILLS:
1.  **Forensic Reading:** Verify, Classify, Argue, Attack.
2.  **Advanced Argumentation:** IRAC/CREAC structure.
3.  **Cross-Examination:** Leading & Locking questions.
4.  **Oral Advocacy:** Structured & reactive.

(B) LEGAL THINKING:
1.  **Probability-Based:** Calculate Win/Loss odds.
2.  **Strategic Goal:** Act to achieve the goal, don't just react.
3.  **"Hidden - Revealed" Strategy:** Surface Strategy (polite) vs Deep Strategy (pressure/trap).

(C) OUTPUT STYLE:
-   Use \`<cg>Mẹo chiến thuật:</cg>\` for tips.
-   Tone: Professional, sharp, decisive ("Buộc phải", "Chắc chắn").
`;

const KNOWLEDGE_BASE_RULES = `
**Knowledge & Citation Rules:**
1.  **Court System:** Use 355 regional courts.
2.  **Administrative Structure:** 2-Tier (Province -> Commune). 17 Ministries.
    -   **Authority:** Files go to Provincial Public Admin Centers or Communal PC. NO District intermediaries.
3.  **Case Precedents (Án lệ):** Cite Vietnamese precedents.
4.  **PDF Citations:** Format: "DocumentName.pdf [Page X]".
`;

export const SYSTEM_INSTRUCTION = `
${CUNNING_LAWYER_PERSONA}
${KNOWLEDGE_BASE_RULES}
**Primary Task: Comprehensive Litigation Analysis**
Analyze the case files and return a JSON report.
**Language: VIETNAMESE ONLY.**
`;

export const SUMMARY_EXTRACTION_SYSTEM_INSTRUCTION = `
${CUNNING_LAWYER_PERSONA}
**Task:** Extract case summary and client request.
**Output:** JSON.
**LANGUAGE: VIETNAMESE ONLY. DO NOT USE ENGLISH.**
`;

export const ARGUMENT_GRAPH_GENERATION_SYSTEM_INSTRUCTION = `
${CUNNING_LAWYER_PERSONA}
**Task:** Create a visual Argument Graph (Nodes & Edges) based on the case analysis.
**Nodes:** Legal Issues, Strengths, Weaknesses, Evidence, Laws.
**Layout:** Organize logically (Issues at top, Evidence below).
**Language: VIETNAMESE ONLY.**
`;

// ... (Other instructions remain, ensuring they inherit CUNNING_LAWYER_PERSONA which forces Vietnamese)
export const REANALYSIS_SYSTEM_INSTRUCTION = `${CUNNING_LAWYER_PERSONA} ${KNOWLEDGE_BASE_RULES} Task: Re-analyze. VIETNAMESE ONLY.`;
export const ANALYSIS_UPDATE_SYSTEM_INSTRUCTION = `${CUNNING_LAWYER_PERSONA} ${KNOWLEDGE_BASE_RULES} Task: Update Analysis. VIETNAMESE ONLY.`;
export const CONSULTING_SYSTEM_INSTRUCTION = `${CUNNING_LAWYER_PERSONA} ${KNOWLEDGE_BASE_RULES} Task: Consulting. VIETNAMESE ONLY.`;
export const BUSINESS_FORMATION_SYSTEM_INSTRUCTION = `${CUNNING_LAWYER_PERSONA} ${KNOWLEDGE_BASE_RULES} Task: Business Formation. VIETNAMESE ONLY.`;
export const LAND_PROCEDURE_SYSTEM_INSTRUCTION = `${CUNNING_LAWYER_PERSONA} ${KNOWLEDGE_BASE_RULES} Task: Land Procedure. VIETNAMESE ONLY.`;
export const DIVORCE_SYSTEM_INSTRUCTION = `${CUNNING_LAWYER_PERSONA} ${KNOWLEDGE_BASE_RULES} Task: Divorce Strategy. VIETNAMESE ONLY.`;

export const DOCUMENT_GENERATION_SYSTEM_INSTRUCTION = `
You are a **VETERAN VIETNAMESE LITIGATION LAWYER**.
Drafting Rules:
1.  **Human-Like:** No robotic phrases. Use power verbs ("Yêu cầu", "Buộc phải").
2.  **Sharp Argumentation:** Use the "Trap" method.
3.  **Format:** Markdown. Centered National Motto.
4.  **Language:** VIETNAMESE ONLY.
`;

export const OPPONENT_ANALYSIS_SYSTEM_INSTRUCTION = `${CUNNING_LAWYER_PERSONA} Task: Analyze Opponent. VIETNAMESE ONLY.`;
export const PREDICT_OPPONENT_ARGS_SYSTEM_INSTRUCTION = `${CUNNING_LAWYER_PERSONA} Task: Predict Opponent. VIETNAMESE ONLY.`;
export const DEVIL_ADVOCATE_SYSTEM_INSTRUCTION = `${CUNNING_LAWYER_PERSONA} Task: Devil's Advocate. VIETNAMESE ONLY.`;
export const ARGUMENT_GENERATION_SYSTEM_INSTRUCTION = "Synthesize legal points into a persuasive argument (IRAC). VIETNAMESE ONLY.";
export const ARGUMENT_NODE_CHAT_SYSTEM_INSTRUCTION = "Discuss a specific argument node. VIETNAMESE ONLY.";
export const INTELLIGENT_SEARCH_SYSTEM_INSTRUCTION = `You are a powerful AI search engine for legal cases. Answer in VIETNAMESE.`;
export const CONTEXTUAL_CHAT_SYSTEM_INSTRUCTION = "You are a strategic AI legal assistant. Answer in VIETNAMESE.";
export const QUICK_ANSWER_REFINE_SYSTEM_INSTRUCTION = "Rewrite the legal answer in VIETNAMESE to match the requested tone.";
export const CONSULTING_CHAT_UPDATE_SYSTEM_INSTRUCTION = `${CUNNING_LAWYER_PERSONA} Task: Update Consulting. VIETNAMESE ONLY.`;
export const LITIGATION_CHAT_UPDATE_SYSTEM_INSTRUCTION = `${CUNNING_LAWYER_PERSONA} Task: Update Litigation. VIETNAMESE ONLY.`;
export const BUSINESS_FORMATION_CHAT_UPDATE_SYSTEM_INSTRUCTION = `${CUNNING_LAWYER_PERSONA} Task: Update Biz Formation. VIETNAMESE ONLY.`;
export const LAND_PROCEDURE_CHAT_UPDATE_SYSTEM_INSTRUCTION = `${CUNNING_LAWYER_PERSONA} Task: Update Land. VIETNAMESE ONLY.`;
export const DIVORCE_CHAT_UPDATE_SYSTEM_INSTRUCTION = `${CUNNING_LAWYER_PERSONA} Task: Update Divorce. VIETNAMESE ONLY.`;

export const TACTICAL_DRAFTING_INSTRUCTION = `
**FEATURE: Tactical Annotation Mode**
Wrap strategic word choices in <tactical tip="EXPLANATION IN VIETNAMESE">text</tactical>.
`;
