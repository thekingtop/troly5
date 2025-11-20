
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

export const DOC_TYPE_FIELDS: Partial<Record<DocType, string[]>> = {
  legalServiceContract: [
    "lawFirmName", "lawFirmAddress", "lawFirmTaxCode", "lawFirmRep",
    "clientName", "clientId", "clientAddress", "clientPhone",
    "caseSummary", "clientRequest", "feeAmount", "paymentTerms", "scopeOfWork"
  ],
  demandLetter: [
    "lawFirmName", "clientName", "recipientName", "recipientAddress", "subject", "caseSummary", "demands", "deadline"
  ],
  powerOfAttorney: [
    "principalName", "principalDob", "principalId", "principalIdIssueDate", "principalIdIssuePlace", "principalAddress",
    "agentName", "agentDob", "agentId", "agentIdIssueDate", "agentIdIssuePlace", "agentAddress", "scope", "term", "location"
  ],
  lawsuit: [
    "courtName", "disputeType", "plaintiffName", "plaintiffId", "plaintiffAddress", "plaintiffPhone",
    "defendantName", "defendantAddress", "caseContent", "requests", "evidence"
  ],
  divorcePetition: [
      "courtName", "petitionerName", "petitionerId", "petitionerAddress", "respondentName", "respondentAddress", "marriageInfo", "reason", "childrenInfo", "propertyInfo"
  ],
  enforcementPetition: [
      "enforcementAgency", "creditorName", "creditorId", "creditorAddress", "debtorName", "debtorAddress", "judgmentDetails", "enforcementContent"
  ],
  will: [
      "testatorName", "testatorDob", "testatorId", "testatorAddress", "willContent", "executor", "witnesses", "location", "willDate", "willYear"
  ],
  statementOfOpinion: [
    "courtName", "presenterName", "presenterDob", "presenterId", "presenterIdIssueDate", "presenterIdIssuePlace", "presenterAddress", "presenterProceduralStatus", 
    "representedPartyName", "representedPartyAddress", "representedPartyLegalRep", 
    "caseNumber", "caseAcceptanceDate", "caseName", "plaintiffName", "defendantName", 
    "caseSummary", "disputeEvent", "postEventActions", 
    "firstInstanceSummary", "furtherProceedings", "currentStatus", 
    "argument1Title", "argument1Basis", "argument1Analysis", 
    "argument2Title", "argument2Basis", "argument2Analysis", 
    "argument3Title", "argument3Basis", "argument3Analysis", 
    "finalConfirmation", "courtRequest", "location", "documentDate"
  ],
  defenseStatement: [
    "courtName", "caseNumber", "plaintiffName", "defendantName", "defendantAddress",
    "caseSummary",
    "plaintiffArguments",
    "rebuttalArgument1", "rebuttalEvidence1",
    "rebuttalArgument2", "rebuttalEvidence2",
    "mitigatingCircumstances",
    "defendantRequest",
    "location", "documentDate"
  ],
  enterpriseRegistration: [
      "companyType", "companyNameVN", "companyNameEN", "companyNameAbbr", "companyAddress", 
      "businessLines", "charterCapital", "capitalSource",
      "ownerName", "ownerDob", "ownerId", "ownerAddress",
      "legalRepName", "legalRepDob", "legalRepId", "legalRepAddress", "legalRepTitle",
      "taxRegistrationInfo"
  ],
  householdRegistration: [
      "businessName", "businessAddress", "businessLines",
      "capital", "employeeCount",
      "ownerName", "ownerDob", "ownerId", "ownerIdDate", "ownerIdPlace", "ownerAddress", "ownerPhone", "ownerEmail"
  ],
  landRegistrationApplication: [
      "landUser", "landAddress", "parcelNumber", "mapSheetNumber", "registrationType", "documentsAttached"
  ],
  divorceAgreement: [
      "husbandName", "wifeName", "childCustodyAgreement", "propertyDivisionAgreement", "debtAgreement"
  ]
};

export const FIELD_LABELS: Record<string, string> = {
  lawFirmName: "Tên tổ chức hành nghề luật sư",
  lawFirmAddress: "Địa chỉ",
  lawFirmTaxCode: "Mã số thuế",
  lawFirmRep: "Người đại diện",
  clientName: "Tên khách hàng",
  clientId: "Số CCCD/CMND/Hộ chiếu",
  clientAddress: "Địa chỉ thường trú (Ghi rõ: Xã/Phường, Tỉnh/TP)",
  clientPhone: "Số điện thoại",
  caseSummary: "Tóm tắt nội dung vụ việc",
  clientRequest: "Yêu cầu của khách hàng",
  feeAmount: "Phí dịch vụ",
  paymentTerms: "Điều khoản thanh toán",
  scopeOfWork: "Phạm vi công việc",
  recipientName: "Tên người nhận",
  recipientAddress: "Địa chỉ người nhận",
  subject: "Về việc",
  demands: "Các yêu cầu",
  deadline: "Thời hạn thực hiện",
  principalName: "Tên người ủy quyền",
  principalDob: "Ngày sinh",
  principalId: "Số CCCD/CMND (Người ủy quyền)",
  principalIdIssueDate: "Ngày cấp",
  principalIdIssuePlace: "Nơi cấp",
  principalAddress: "Địa chỉ thường trú (Người ủy quyền)",
  agentName: "Tên người được ủy quyền",
  agentDob: "Ngày sinh (Người được ủy quyền)",
  agentId: "Số CCCD/CMND (Người được ủy quyền)",
  agentIdIssueDate: "Ngày cấp (Người được ủy quyền)",
  agentIdIssuePlace: "Nơi cấp (Người được ủy quyền)",
  agentAddress: "Địa chỉ thường trú (Người được ủy quyền)",
  scope: "Phạm vi ủy quyền",
  term: "Thời hạn ủy quyền",
  location: "Địa điểm làm văn bản",
  courtName: "Tên Tòa án (Tòa án nhân dân khu vực...)",
  disputeType: "Loại tranh chấp",
  plaintiffName: "Tên người khởi kiện (Nguyên đơn)",
  plaintiffId: "Số CCCD/CMND (Nguyên đơn)",
  plaintiffAddress: "Địa chỉ (Nguyên đơn)",
  plaintiffPhone: "Số điện thoại (Nguyên đơn)",
  defendantName: "Tên người bị kiện (Bị đơn)",
  defendantAddress: "Địa chỉ (Bị đơn)",
  caseContent: "Nội dung vụ án",
  requests: "Yêu cầu Tòa án giải quyết",
  evidence: "Chứng cứ kèm theo",
  petitionerName: "Tên người làm đơn",
  petitionerId: "Số CCCD/CMND (Người làm đơn)",
  petitionerAddress: "Địa chỉ (Người làm đơn)",
  respondentName: "Tên người bị yêu cầu",
  respondentAddress: "Địa chỉ (Người bị yêu cầu)",
  marriageInfo: "Thông tin hôn nhân (số GCN, ngày, nơi ĐK)",
  reason: "Lý do ly hôn",
  childrenInfo: "Thông tin về con chung",
  propertyInfo: "Thông tin về tài sản chung",
  enforcementAgency: "Tên Cơ quan Thi hành án",
  creditorName: "Tên người được thi hành án",
  creditorId: "Số CCCD/CMND (Người được THA)",
  creditorAddress: "Địa chỉ (Người được THA)",
  debtorName: "Tên người phải thi hành án",
  debtorAddress: "Địa chỉ (Người phải THA)",
  judgmentDetails: "Thông tin bản án/quyết định",
  enforcementContent: "Nội dung yêu cầu thi hành án",
  testatorName: "Tên người lập di chúc",
  testatorDob: "Ngày sinh (Người lập di chúc)",
  testatorId: "Số CCCD/CMND (Người lập di chúc)",
  testatorAddress: "Địa chỉ (Người lập di chúc)",
  willContent: "Nội dung di chúc",
  executor: "Người thi hành di chúc",
  witnesses: "Người làm chứng",
  willDate: "Ngày lập di chúc",
  willYear: "Năm lập di chúc",
  presenterName: "Tên người trình bày",
  presenterDob: "Ngày sinh",
  presenterId: "Số CCCD/CMND",
  presenterIdIssueDate: "Ngày cấp",
  presenterIdIssuePlace: "Nơi cấp",
  presenterAddress: "Địa chỉ",
  presenterProceduralStatus: "Tư cách tố tụng",
  representedPartyName: "Tên người được đại diện/bảo vệ",
  representedPartyAddress: "Địa chỉ người được đại diện",
  representedPartyLegalRep: "Đại diện theo pháp luật (nếu có)",
  caseNumber: "Số vụ án",
  caseAcceptanceDate: "Ngày thụ lý",
  caseName: "Tên vụ án",
  disputeEvent: "Sự kiện phát sinh tranh chấp",
  postEventActions: "Diễn biến sau sự kiện",
  firstInstanceSummary: "Diễn biến/Kết quả phiên tòa sơ thẩm",
  furtherProceedings: "Diễn biến tố tụng tiếp theo",
  currentStatus: "Tình trạng hiện tại",
  argument1Title: "Luận điểm 1 (Tiêu đề)",
  argument1Basis: "Cơ sở pháp lý cho Luận điểm 1",
  argument1Analysis: "Phân tích, chứng minh Luận điểm 1",
  argument2Title: "Luận điểm 2 (Tiêu đề)",
  argument2Basis: "Cơ sở pháp lý cho Luận điểm 2",
  argument2Analysis: "Phân tích, chứng minh Luận điểm 2",
  argument3Title: "Luận điểm 3 (Tiêu đề)",
  argument3Basis: "Cơ sở pháp lý cho Luận điểm 3",
  argument3Analysis: "Phân tích, chứng minh Luận điểm 3",
  finalConfirmation: "Khẳng định cuối cùng",
  courtRequest: "Đề nghị với Tòa án",
  documentDate: "Ngày làm văn bản",
  plaintiffArguments: "Tóm tắt các lập luận của Nguyên đơn",
  rebuttalArgument1: "Luận điểm phản bác 1",
  rebuttalEvidence1: "Chứng cứ cho Luận điểm phản bác 1",
  rebuttalArgument2: "Luận điểm phản bác 2",
  rebuttalEvidence2: "Chứng cứ cho Luận điểm phản bác 2",
  mitigatingCircumstances: "Tình tiết giảm nhẹ (nếu có)",
  defendantRequest: "Đề nghị của Bị đơn",
  // Enterprise Registration
  companyType: "Loại hình doanh nghiệp (TNHH, Cổ phần...)",
  companyNameVN: "Tên công ty (Tiếng Việt)",
  companyNameEN: "Tên công ty (Tiếng Anh)",
  companyNameAbbr: "Tên viết tắt",
  companyAddress: "Địa chỉ trụ sở chính (Kèm số điện thoại/Email)",
  businessLines: "Ngành, nghề kinh doanh (Ghi rõ mã cấp 4)",
  charterCapital: "Vốn điều lệ",
  capitalSource: "Nguồn vốn",
  ownerName: "Tên chủ sở hữu / Thành viên",
  ownerDob: "Ngày sinh",
  ownerId: "Số CCCD/CMND",
  ownerAddress: "Địa chỉ thường trú",
  legalRepName: "Người đại diện theo pháp luật",
  legalRepDob: "Ngày sinh (Người đại diện)",
  legalRepId: "Số CCCD/CMND (Người đại diện)",
  legalRepAddress: "Địa chỉ (Người đại diện)",
  legalRepTitle: "Chức danh (Giám đốc/Tổng Giám đốc)",
  taxRegistrationInfo: "Thông tin đăng ký thuế (Phương pháp tính thuế, Năm tài chính)",
  // Household Registration
  businessName: "Tên hộ kinh doanh",
  businessAddress: "Địa điểm kinh doanh (Ghi rõ Tỉnh/TP)",
  capital: "Vốn kinh doanh",
  employeeCount: "Số lượng lao động",
  ownerIdDate: "Ngày cấp CCCD",
  ownerIdPlace: "Nơi cấp CCCD",
  ownerPhone: "Số điện thoại / Email",
  ownerEmail: "Email",
  // Land & Divorce
  landUser: "Người sử dụng đất",
  landAddress: "Địa chỉ thửa đất",
  parcelNumber: "Số thửa",
  mapSheetNumber: "Tờ bản đồ số",
  registrationType: "Loại biến động (Tặng cho, Chuyển nhượng...)",
  documentsAttached: "Tài liệu kèm theo",
  husbandName: "Tên Chồng",
  wifeName: "Tên Vợ",
  childCustodyAgreement: "Thỏa thuận về con chung",
  propertyDivisionAgreement: "Thỏa thuận về tài sản",
  debtAgreement: "Thỏa thuận về công nợ"
};

// Danh sách Tòa án Nhân dân Khu vực theo mô hình Chính quyền 2 cấp mới
export const REGIONAL_COURTS: string[] = [
    // Khu vực miền Bắc
    "Tòa án nhân dân khu vực 1, thành phố Hà Nội",
    "Tòa án nhân dân khu vực 2, thành phố Hà Nội",
    "Tòa án nhân dân khu vực 3, thành phố Hà Nội",
    "Tòa án nhân dân khu vực 4, thành phố Hà Nội",
    "Tòa án nhân dân khu vực 5, thành phố Hà Nội",
    "Tòa án nhân dân khu vực 1, tỉnh Bắc Ninh",
    "Tòa án nhân dân khu vực 2, tỉnh Bắc Ninh",
    "Tòa án nhân dân khu vực 1, tỉnh Hải Dương",
    "Tòa án nhân dân khu vực 1, thành phố Hải Phòng",
    "Tòa án nhân dân khu vực 2, thành phố Hải Phòng",
    
    // Khu vực miền Trung
    "Tòa án nhân dân khu vực 1, tỉnh Thanh Hóa",
    "Tòa án nhân dân khu vực 2, tỉnh Thanh Hóa",
    "Tòa án nhân dân khu vực 1, tỉnh Nghệ An",
    "Tòa án nhân dân khu vực 1, thành phố Đà Nẵng",
    "Tòa án nhân dân khu vực 2, thành phố Đà Nẵng",
    "Tòa án nhân dân khu vực 1, tỉnh Khánh Hòa",
    
    // Khu vực miền Nam
    "Tòa án nhân dân khu vực 1, Thành phố Hồ Chí Minh",
    "Tòa án nhân dân khu vực 2, Thành phố Hồ Chí Minh",
    "Tòa án nhân dân khu vực 3, Thành phố Hồ Chí Minh",
    "Tòa án nhân dân khu vực 4, Thành phố Hồ Chí Minh",
    "Tòa án nhân dân khu vực 5, Thành phố Hồ Chí Minh",
    "Tòa án nhân dân khu vực 6, Thành phố Hồ Chí Minh",
    "Tòa án nhân dân khu vực 1, tỉnh Bình Dương",
    "Tòa án nhân dân khu vực 2, tỉnh Bình Dương",
    "Tòa án nhân dân khu vực 1, tỉnh Đồng Nai",
    "Tòa án nhân dân khu vực 1, tỉnh Bà Rịa - Vũng Tàu",
    "Tòa án nhân dân khu vực 1, thành phố Cần Thơ",
    "Tòa án nhân dân khu vực 2, thành phố Cần Thơ",
    
    // Mẫu chung (dành cho AI gợi ý thêm)
    "Tòa án nhân dân khu vực [số], tỉnh [Tên tỉnh]"
];

export const litigationStagesByType: Record<LitigationType, { id: LitigationStage; label: string }[]> = {
  civil: [
    { id: 'consulting', label: 'Tư vấn ban đầu' },
    { id: 'pre_litigation', label: 'Tiền tố tụng' },
    { id: 'first_instance', label: 'Sơ thẩm' },
    { id: 'appellate', label: 'Phúc thẩm' },
    { id: 'cassation_reopening', label: 'Giám đốc thẩm / Tái thẩm' },
    { id: 'enforcement', label: 'Thi hành án' },
  ],
  criminal: [
    { id: 'investigation', label: 'Điều tra' },
    { id: 'prosecution', label: 'Truy tố' },
    { id: 'first_instance_trial', label: 'Xét xử Sơ thẩm' },
    { id: 'appellate_trial', label: 'Xét xử Phúc thẩm' },
    { id: 'cassation_reopening', label: 'Giám đốc thẩm / Tái thẩm' },
    { id: 'sentence_enforcement', label: 'Thi hành án' },
  ],
  administrative: [
    { id: 'complaint_dialogue', label: 'Khiếu nại / Đối thoại' },
    { id: 'lawsuit_filing', label: 'Khởi kiện' },
    { id: 'first_instance_admin', label: 'Sơ thẩm' },
    { id: 'appellate_admin', label: 'Phúc thẩm' },
    { id: 'cassation_reopening_admin', label: 'Giám đốc thẩm / Tái thẩm' },
    { id: 'judgment_enforcement', label: 'Thi hành án' },
  ]
};

const allStages = [...litigationStagesByType.civil, ...litigationStagesByType.criminal, ...litigationStagesByType.administrative];

export const getStageLabel = (type: LitigationType, stageId: LitigationStage): string => {
  const stage = litigationStagesByType[type]?.find(s => s.id === stageId) || allStages.find(s => s.id === stageId);
  return stage ? stage.label : stageId;
};

export const litigationStageSuggestions = [
    ...new Set(allStages.map(s => s.label))
];

const lawArticleSchema = {
    type: Type.OBJECT,
    properties: {
        articleNumber: { type: Type.STRING, description: "Số điều luật, ví dụ: 'Điều 123 Bộ luật Dân sự 2015'." },
        summary: { type: Type.STRING, description: "Tóm tắt ngắn gọn nội dung cốt lõi của điều luật." },
    },
    required: ["articleNumber", "summary"],
};

const supportingEvidenceSchema = {
    type: Type.OBJECT,
    properties: {
        sourceDocument: { type: Type.STRING, description: "Tên tài liệu chứa chứng cứ. QUAN TRỌNG: Nếu là file PDF, BẮT BUỘC phải ghi rõ số trang (Ví dụ: 'Hợp đồng.pdf [Trang 5]')." },
        snippet: { type: Type.STRING, description: "Trích dẫn nguyên văn đoạn văn bản liên quan từ tài liệu." },
    },
    required: ["sourceDocument", "snippet"],
};

const applicableLawSchema = {
    type: Type.OBJECT,
    properties: {
        documentName: { type: Type.STRING, description: "Tên đầy đủ của văn bản quy phạm pháp luật, ví dụ: 'Bộ luật Tố tụng Dân sự 2015'." },
        coreIssueAddressed: { type: Type.STRING, description: "Phân tích ngắn gọn vấn đề pháp lý chính mà văn bản này điều chỉnh trong vụ việc." },
        relevanceToCase: { type: Type.STRING, description: "Phân tích ngắn gọn tại sao văn bản này lại quan trọng và áp dụng cho vụ việc hiện tại." },
        articles: { type: Type.ARRAY, items: lawArticleSchema, description: "Danh sách các điều luật cụ thể được áp dụng." },
        supportingEvidence: { type: Type.ARRAY, items: supportingEvidenceSchema, description: "Danh sách các bằng chứng hỗ trợ cho việc áp dụng luật này." },
    },
    required: ["documentName", "articles"],
};

const legalLoopholeSchema = {
    type: Type.OBJECT,
    properties: {
        classification: { type: Type.STRING, description: "Phân loại lỗ hổng: 'Hợp đồng', 'Quy phạm Pháp luật', 'Tố tụng', hoặc 'Khác'." },
        description: { type: Type.STRING, description: "Mô tả chi tiết về lỗ hổng pháp lý được phát hiện." },
        severity: { type: Type.STRING, description: "Mức độ nghiêm trọng của lỗ hổng: 'Cao', 'Trung bình', 'Thấp'." },
        suggestion: { type: Type.STRING, description: "Đề xuất hành động hoặc chiến lược để khai thác hoặc khắc phục lỗ hổng này." },
        evidence: { type: Type.STRING, description: "Trích dẫn nguyên văn từ tài liệu. QUAN TRỌNG: Nếu là file PDF, BẮT BUỘC phải ghi rõ số trang (Ví dụ: 'Hợp đồng.pdf [Trang 12]')." },
    },
    required: ["classification", "description", "severity", "suggestion", "evidence"],
};

const timelineEventSchema = {
    type: Type.OBJECT,
    properties: {
        date: { type: Type.STRING, description: "Ngày diễn ra sự kiện theo định dạng YYYY-MM-DD. Nếu không có ngày cụ thể, ước lượng và ghi chú." },
        description: { type: Type.STRING, description: "Mô tả chi tiết, khách quan về sự kiện đã xảy ra." },
        sourceDocument: { type: Type.STRING, description: "Tên tài liệu nguồn chứa thông tin về sự kiện này. QUAN TRỌNG: Nếu là file PDF, BẮT BUỘC phải ghi rõ số trang (Ví dụ: 'Bien_ban.pdf [Trang 3]')." },
        eventType: { type: Type.STRING, description: "Phân loại sự kiện: 'Contract', 'Payment', 'Communication', 'LegalAction', 'Milestone', 'Other'." },
        significance: { type: Type.STRING, description: "Đánh giá tầm quan trọng của sự kiện: 'High', 'Medium', 'Low'." },
    },
    required: ["date", "description", "sourceDocument", "eventType", "significance"],
};

const landInfoSchema = {
    type: Type.OBJECT,
    properties: {
        mapSheetNumber: { type: Type.STRING, description: "Số tờ bản đồ." },
        parcelNumber: { type: Type.STRING, description: "Số thửa đất." },
        address: { type: Type.STRING, description: "Địa chỉ thửa đất." },
        area: { type: Type.STRING, description: "Diện tích (m²)." },
        landUsePurpose: { type: Type.STRING, description: "Mục đích sử dụng đất." },
        landUseTerm: { type: Type.STRING, description: "Thời hạn sử dụng đất." },
        landUseSource: { type: Type.STRING, description: "Nguồn gốc sử dụng đất." },
        planningStatus: { type: Type.STRING, description: "Tình trạng quy hoạch (nếu có)." },
    },
};

// --- NEW SCHEMAS FOR ADVANCED CUNNING FEATURES ---
const crossExamQuestionSchema = {
    type: Type.OBJECT,
    properties: {
        question: { type: Type.STRING, description: "Nội dung câu hỏi." },
        type: { type: Type.STRING, enum: ['Leading', 'Locking', 'Open', 'Clarifying'], description: "Loại câu hỏi. 'Leading' (Dẫn dắt), 'Locking' (Khóa), 'Open' (Mở)." },
        target: { type: Type.STRING, description: "Đối tượng hỏi (Ví dụ: Nhân chứng A, Bị đơn)." },
        goal: { type: Type.STRING, description: "Mục đích của câu hỏi này là gì? (Ví dụ: Buộc thừa nhận việc đã nhận tiền)." },
        expectedAnswer: { type: Type.STRING, description: "Câu trả lời dự kiến hoặc mong muốn." },
    },
    required: ["question", "type", "target", "goal"]
};

const strategyLayerSchema = {
    type: Type.OBJECT,
    properties: {
        surfaceStrategy: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Phương án Bề nổi: Những gì chúng ta nói công khai, thể hiện trên văn bản, hợp lý và đúng quy trình." },
        deepStrategy: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Phương án Ngầm (Cáo già): Mục tiêu thực sự, các bước đi chiến thuật để gây áp lực hoặc tạo lợi thế mà không nói ra." }
    },
    required: ["surfaceStrategy", "deepStrategy"]
};

const winProbabilitySchema = {
    type: Type.OBJECT,
    properties: {
        score: { type: Type.NUMBER, description: "Điểm xác suất thắng (0-100)." },
        rationale: { type: Type.STRING, description: "Lý giải tại sao có điểm số này." },
        swingFactors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các yếu tố biến thiên có thể làm thay đổi cục diện (Ví dụ: Nếu tìm được nhân chứng X, xác suất tăng lên 80%)." }
    },
    required: ["score", "rationale", "swingFactors"]
};

// --- STEP 1: CORE ANALYSIS SCHEMA (LIGHTWEIGHT) ---
export const CORE_REPORT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        editableCaseSummary: { type: Type.STRING, description: "Tóm tắt vụ việc toàn diện, khách quan. Độ dài 300-500 từ." },
        caseTimeline: { type: Type.ARRAY, items: timelineEventSchema, description: "Dòng thời gian các sự kiện chính." },
        litigationStage: { type: Type.STRING, description: "Giai đoạn tố tụng hiện tại." },
        proceduralStatus: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    partyName: { type: Type.STRING, description: "Tên đương sự." },
                    status: { type: Type.STRING, description: "Tư cách tố tụng." },
                },
                required: ["partyName", "status"],
            },
        },
        legalRelationship: { type: Type.STRING, description: "Bản chất quan hệ pháp luật." },
        coreLegalIssues: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Vấn đề pháp lý cốt lõi." },
        landInfo: landInfoSchema,
        applicableLaws: { type: Type.ARRAY, items: applicableLawSchema, description: "Cơ sở pháp lý áp dụng." },
        gapAnalysis: {
            type: Type.OBJECT,
            properties: {
                missingInformation: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Thông tin thiếu." },
                recommendedActions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Hành động đề xuất." },
                legalLoopholes: { type: Type.ARRAY, items: legalLoopholeSchema, description: "Lỗ hổng pháp lý." },
            },
        },
        caseProspects: {
            type: Type.OBJECT,
            properties: {
                strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Điểm mạnh." },
                weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Điểm yếu & Khắc phục." },
                risks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Rủi ro & Phòng ngừa." },
            },
        },
        // Placeholder for Strategy (Empty initially)
        proposedStrategy: {
            type: Type.OBJECT,
            properties: {
                preLitigation: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các bước tiền tố tụng." },
                litigation: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các bước tố tụng." }
            }
        },
        requestResolutionPlan: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Phương án giải quyết yêu cầu." },
        contingencyPlan: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Phương án dự phòng." },
    },
    required: ["editableCaseSummary", "caseTimeline", "litigationStage", "proceduralStatus", "legalRelationship", "coreLegalIssues", "applicableLaws", "gapAnalysis", "caseProspects", "proposedStrategy"],
};

// --- STEP 2: STRATEGIC ANALYSIS SCHEMA (HEAVY) ---
export const STRATEGY_REPORT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        winProbabilityAnalysis: winProbabilitySchema,
        proposedStrategy: {
            type: Type.OBJECT,
            properties: {
                proceduralTactics: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Chiến thuật tố tụng (Cáo già): Câu giờ, hoãn phiên tòa, khiếu nại thẩm quyền..." },
                psychologicalStrategy: { type: Type.STRING, description: "Chiến lược tâm lý & Phán đoán (Cunning Lawyer)." },
                crossExaminationPlan: { type: Type.ARRAY, items: crossExamQuestionSchema, description: "Kế hoạch thẩm vấn chéo." },
                layeredStrategy: strategyLayerSchema 
            },
            required: ["proceduralTactics", "psychologicalStrategy", "crossExaminationPlan", "layeredStrategy"]
        }
    },
    required: ["winProbabilityAnalysis", "proposedStrategy"]
};

// Maintain the full schema for types/backwards compatibility if needed, but usually composed now
export const REPORT_SCHEMA = CORE_REPORT_SCHEMA; // Alias for now, though conceptually split

// ... (Keep existing SCHEMAS for Summary, Consulting, Business Formation)
export const SUMMARY_EXTRACTION_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        caseSummary: { type: Type.STRING, description: "Tóm tắt khách quan, chi tiết về các sự kiện, diễn biến chính của vụ việc được đề cập trong tài liệu." },
        clientRequestSummary: { type: Type.STRING, description: "Tóm tắt ngắn gọn, rõ ràng về yêu cầu, mong muốn hoặc mục tiêu chính của khách hàng." }
    },
    required: ["caseSummary", "clientRequestSummary"]
};

export const CONSULTING_REPORT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        conciseAnswer: { type: Type.STRING, description: "Câu trả lời ngắn gọn, 'người' nhất có thể. Trả lời như một luật sư đang nhắn tin hoặc email nhanh cho khách: đồng cảm, đi thẳng vào vấn đề, ngắn gọn nhưng đủ ý. Tránh văn phong robot hoặc quá trang trọng không cần thiết. Độ dài khoảng 100-150 từ. QUAN TRỌNG: Bắt buộc kết thúc bằng một câu mời hợp tác hoặc liên hệ tư vấn chi tiết, điều chỉnh xưng hô phù hợp (VD: 'Nếu bạn cần hỗ trợ chi tiết hơn, đừng ngại liên hệ với mình nhé' hoặc 'Để có phương án tối ưu nhất, anh/chị hãy liên hệ tôi để trao đổi thêm')." },
        discussionPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các điểm chính cần thảo luận hoặc làm rõ với khách hàng." },
        caseType: { type: Type.STRING, description: "Phân loại sơ bộ vụ việc: 'civil', 'criminal', 'administrative', hoặc 'unknown'." },
        preliminaryStage: { type: Type.STRING, description: "Dự đoán giai đoạn tiếp theo của vụ việc (ví dụ: hòa giải, khởi kiện)." },
        suggestedDocuments: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Danh sách các tài liệu khách hàng cần cung cấp thêm." },
        legalLoopholes: { type: Type.ARRAY, items: legalLoopholeSchema, description: "Phân tích các lỗ hổng pháp lý nổi bật nhất." },
        preliminaryAssessment: { type: Type.STRING, description: "Đánh giá sơ bộ về điểm mạnh, điểm yếu và rủi ro của vụ việc." },
        negotiationLeverage: { type: Type.STRING, description: "Đòn bẩy đàm phán & Đọc vị đối phương (Cunning Lawyer): Điểm yếu tâm lý của bên kia là gì? Làm sao để khách hàng nắm đằng chuôi?" },
        negotiationTactics: {
            type: Type.OBJECT,
            properties: {
                anchoringPoint: { type: Type.STRING, description: "Điểm neo giá (Anchoring): Mức giá/yêu cầu khởi điểm để tạo lợi thế." },
                silenceTactics: { type: Type.STRING, description: "Kỹ thuật im lặng: Khi nào nên im lặng để tạo áp lực?" },
                pacingStrategy: { type: Type.STRING, description: "Chiến lược nhịp độ: Đẩy nhanh hay kéo dài cuộc đàm phán?" }
            },
            description: "Chiến thuật đàm phán bậc cao (Advanced Negotiation)."
        },
        riskMitigationStrat: { type: Type.STRING, description: "Chiến lược giảm thiểu rủi ro (Risk Shifting): Cách đẩy rủi ro về phía đối tác hoặc trì hoãn trách nhiệm một cách hợp pháp." },
        proposedRoadmap: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    stage: { type: Type.STRING, description: "Tên giai đoạn (ví dụ: Giai đoạn 1: Thu thập chứng cứ)." },
                    description: { type: Type.STRING, description: "Mô tả công việc cần làm trong giai đoạn đó." },
                    outcome: { type: Type.STRING, description: "Kết quả dự kiến đạt được sau giai đoạn." },
                },
                required: ["stage", "description", "outcome"],
            },
            description: "Lộ trình đề xuất gồm 3-5 giai đoạn để giải quyết vấn đề cho khách hàng."
        },
        nextActions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các hành động cụ thể, ngay lập tức mà luật sư cần thực hiện." }
    },
    required: ["conciseAnswer", "discussionPoints", "caseType", "preliminaryStage", "suggestedDocuments"]
};

export const BUSINESS_FORMATION_REPORT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        modelComparison: {
            type: Type.OBJECT,
            properties: {
                business: {
                    type: Type.OBJECT,
                    properties: {
                        pros: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Ưu điểm của mô hình Doanh nghiệp." },
                        cons: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Nhược điểm của mô hình Doanh nghiệp." }
                    },
                },
                soleProprietorship: {
                    type: Type.OBJECT,
                    properties: {
                        pros: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Ưu điểm của mô hình Hộ kinh doanh." },
                        cons: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Nhược điểm của mô hình Hộ kinh doanh." }
                    },
                },
                costComparison: {
                    type: Type.OBJECT,
                    properties: {
                        setupCost: { type: Type.STRING, description: "So sánh chi phí thành lập: DN (lệ phí nhà nước, phí dịch vụ, khắc dấu...) vs HKD (lệ phí thấp, không dấu)." },
                        accountingCost: { type: Type.STRING, description: "So sánh chi phí vận hành kế toán: DN (bắt buộc kế toán/dịch vụ báo cáo thuế hàng tháng/quý) vs HKD (không cần kế toán chuyên nghiệp, tự kê khai hoặc khoán)." },
                        taxComplexity: { type: Type.STRING, description: "So sánh độ phức tạp về thuế: DN (TNDN trên lãi thực, nhiều báo cáo) vs HKD (Thuế khoán trên doanh thu, đơn giản)." }
                    },
                    required: ["setupCost", "accountingCost", "taxComplexity"],
                    description: "Bảng so sánh chi tiết, khách quan về các loại chi phí để khách hàng thấy rõ lợi ích kinh tế."
                },
                recommendation: { type: Type.STRING, description: "Mô hình được đề xuất (VD: 'Công ty TNHH Một thành viên')." },
                recommendationReasoning: { type: Type.STRING, description: "Lý do chi tiết và chiến lược đằng sau đề xuất, bao gồm các mẹo chiến thuật <cg>." }
            },
        },
        taxAnalysis: {
            type: Type.OBJECT,
            properties: {
                businessTaxes: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING, description: "Tên loại thuế cho Doanh nghiệp." },
                            description: { type: Type.STRING, description: "Mô tả ngắn gọn về loại thuế đó." }
                        }
                    }
                },
                soleProprietorshipTaxes: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING, description: "Tên loại thuế cho Hộ kinh doanh." },
                            description: { type: Type.STRING, description: "Mô tả ngắn gọn về loại thuế đó." }
                        }
                    }
                },
                optimizationTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các mẹo chiến thuật <cg> để tối ưu hóa thuế." },
                vatManagementGuide: {
                    type: Type.OBJECT,
                    properties: {
                        storageRules: { type: Type.STRING, description: "Quy tắc an toàn khi lưu trữ hóa đơn điện tử để tránh bị phạt." },
                        deductionTactics: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các mẹo chiến thuật <cg> để tối đa hóa khấu trừ thuế GTGT đầu vào." },
                        inputInvoiceChecklist: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Danh sách kiểm tra nhanh tính hợp lệ của hóa đơn đầu vào (tránh hóa đơn ma)." }
                    },
                    description: "Hướng dẫn chi tiết về quản lý hóa đơn GTGT đầu vào và tối ưu khấu trừ."
                },
                nonInvoiceInputGuide: {
                    type: Type.OBJECT,
                    properties: {
                        strategy: { type: Type.STRING, description: "Chiến lược xử lý hàng mua không có hóa đơn (mua của nông dân, cá nhân) cho từng mô hình (DN vs HKD)." },
                        documentation: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Danh sách hồ sơ cần chuẩn bị (Bảng kê 01/TNDN, CCCD người bán, chứng từ thanh toán...)." },
                        risks: { type: Type.STRING, description: "Rủi ro bị loại chi phí và cách phòng tránh." }
                    },
                    description: "Hướng dẫn chuyên sâu về cách xử lý chi phí đầu vào không có hóa đơn đỏ."
                }
            },
        },
        procedureGuide: {
            type: Type.OBJECT,
            properties: {
                businessSteps: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            step: { type: Type.STRING, description: "Tên bước thực hiện." },
                            description: { type: Type.STRING, description: "Mô tả chi tiết, bao gồm mẹo chiến thuật <cg>." },
                            documents: { type: Type.STRING, description: "Các giấy tờ cần thiết cho bước này." }
                        }
                    }
                },
                soleProprietorshipSteps: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            step: { type: Type.STRING, description: "Tên bước thực hiện." },
                            description: { type: Type.STRING, description: "Mô tả chi tiết, bao gồm mẹo chiến thuật <cg>." },
                            documents: { type: Type.STRING, description: "Các giấy tờ cần thiết cho bước này." }
                        }
                    }
                }
            }
        },
        validExpensesGuide: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Hướng dẫn chi tiết và các mẹo chiến thuật <cg> về chi phí hợp lệ để tối ưu thuế TNDN." },
        legalRisks: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    risk: { type: Type.STRING, description: "Mô tả chi tiết về một rủi ro pháp lý tiềm ẩn." },
                    prevention: { type: Type.STRING, description: "Các biện pháp phòng ngừa hoặc giảm thiểu cụ thể cho rủi ro đó." }
                },
                required: ["risk", "prevention"]
            },
            description: "Danh sách các rủi ro pháp lý tiềm ẩn và biện pháp phòng ngừa tương ứng."
        },
        regulatoryArbitrage: { type: Type.STRING, description: "Chiến thuật tối ưu cơ chế (Lách luật an toàn): Cách chọn mã ngành, cấu trúc vốn, hoặc địa điểm để tránh giấy phép con hoặc hưởng ưu đãi." },
        futureExpansionStrategy: { type: Type.STRING, description: "Chiến lược mở rộng trong tương lai: Kế hoạch tăng vốn, gọi vốn, hoặc chuyển đổi mô hình sau 3-5 năm." }
    },
    required: ["modelComparison", "taxAnalysis", "procedureGuide", "validExpensesGuide", "legalRisks"]
};

export const LAND_PROCEDURE_REPORT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        procedureType: { type: Type.STRING, description: "Loại thủ tục chính xác (VD: Đăng ký biến động - Chuyển nhượng, Cấp đổi GCN...)." },
        localRegulations: { type: Type.STRING, description: "Trích dẫn cụ thể các Quyết định của UBND cấp Tỉnh nơi có đất về bảng giá đất, quy trình nội bộ, hoặc phí lệ phí. Nếu không rõ địa phương, ghi chú cần bổ sung." },
        stepByStepGuide: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    step: { type: Type.STRING, description: "Tên bước (VD: Công chứng hợp đồng)." },
                    description: { type: Type.STRING, description: "Mô tả chi tiết cách thực hiện, chỉ rõ cơ quan tiếp nhận là UBND Cấp Xã hoặc Trung tâm Hành chính công Tỉnh (theo mô hình 2 cấp)." },
                    location: { type: Type.STRING, description: "Cơ quan thực hiện (UBND Xã, VPĐKĐĐ Chi nhánh trực thuộc Sở...)." },
                    estimatedTime: { type: Type.STRING, description: "Thời gian thực tế dự kiến (có thể khác quy định)." }
                },
                required: ["step", "description", "location", "estimatedTime"]
            }
        },
        documentChecklist: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Tên giấy tờ." },
                    required: { type: Type.BOOLEAN, description: "Có bắt buộc không." },
                    notes: { type: Type.STRING, description: "Lưu ý về bản chính/bản sao, số lượng." },
                    status: { type: Type.STRING, enum: ['missing', 'available'], description: "Trạng thái hiện tại (dựa trên thông tin cung cấp)." }
                },
                required: ["name", "required", "notes"]
            }
        },
        financialEstimation: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    item: { type: Type.STRING, description: "Khoản phải thu (VD: Thuế TNCN, Lệ phí trước bạ)." },
                    amount: { type: Type.STRING, description: "Số tiền ước tính hoặc công thức tính." },
                    basis: { type: Type.STRING, description: "Căn cứ tính (VD: 2% giá trị chuyển nhượng, nhưng không thấp hơn bảng giá nhà nước)." }
                },
                required: ["item", "amount", "basis"]
            }
        },
        legalRisksAndTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các mẹo chiến thuật <cg> để hồ sơ được duyệt nhanh, tránh bị trả về, hoặc tối ưu thuế hợp pháp." },
        insiderTips: { type: Type.STRING, description: "Mẹo xử lý tình huống thực tế (Insider Knowledge): Cách làm việc với cán bộ địa chính, cách xử lý khi bị yêu cầu bổ sung hồ sơ vô lý." }
    },
    required: ["procedureType", "stepByStepGuide", "documentChecklist", "financialEstimation", "legalRisksAndTips"]
};

export const DIVORCE_REPORT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        divorceType: { type: Type.STRING, enum: ['ThuanTinh', 'DonPhuong'], description: "Loại hình ly hôn xác định dựa trên mức độ đồng thuận." },
        custodyAnalysis: {
            type: Type.OBJECT,
            properties: {
                strategy: { type: Type.STRING, description: "Chiến lược để giành quyền nuôi con." },
                evidenceNeeded: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Chứng cứ cần thu thập để chứng minh điều kiện nuôi con." },
                cunningTips: { type: Type.STRING, description: "Mẹo chiến thuật <cg> trong tranh chấp con cái." },
                custodyLeveragePoints: { type: Type.STRING, description: "Điểm đòn bẩy để gây áp lực hoặc thương lượng quyền nuôi con (VD: Bằng chứng ngoại tình, Thu nhập không ổn định)." }
            },
            required: ["strategy", "evidenceNeeded", "cunningTips"]
        },
        assetDivision: {
            type: Type.OBJECT,
            properties: {
                commonAssets: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Danh sách tài sản chung." },
                privateAssets: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Danh sách tài sản riêng (đã xác định hoặc cần chứng minh)." },
                divisionStrategy: { type: Type.STRING, description: "Chiến lược phân chia tài sản." },
                cunningTips: { type: Type.STRING, description: "Mẹo chiến thuật <cg> để bảo vệ tài sản hoặc đòi quyền lợi tối đa." },
                assetTracingStrategy: { type: Type.STRING, description: "Chiến lược truy vết tài sản ẩn/tẩu tán (Financial Forensics): Cách tìm tài khoản ngân hàng bí mật, bất động sản nhờ người khác đứng tên." }
            },
            required: ["commonAssets", "privateAssets", "divisionStrategy", "cunningTips"]
        },
        procedureRoadmap: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    step: { type: Type.STRING, description: "Bước thực hiện." },
                    description: { type: Type.STRING, description: "Mô tả chi tiết." }
                },
                required: ["step", "description"]
            }
        },
        emotionalAndLegalAdvice: { type: Type.STRING, description: "Lời khuyên tổng hợp về mặt pháp lý và tâm lý cho khách hàng." }
    },
    required: ["divorceType", "custodyAnalysis", "assetDivision", "procedureRoadmap", "emotionalAndLegalAdvice"]
};

export const OPPONENT_ANALYSIS_SCHEMA = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            argument: { type: Type.STRING, description: "Luận điểm của đối phương." },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các điểm yếu trong lập luận này." },
            counterArguments: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các luận điểm phản bác." },
            supportingEvidence: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các chứng cứ hỗ trợ phản bác từ hồ sơ của khách hàng." },
        },
        required: ["argument", "weaknesses", "counterArguments", "supportingEvidence"],
    },
};

export const PREDICT_OPPONENT_ARGS_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        predictedArguments: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Danh sách các luận điểm dự kiến mà đối phương có thể sử dụng."
        }
    },
    required: ["predictedArguments"]
};

// --- SYSTEM INSTRUCTIONS UPGRADE 2.0 ---
const CUNNING_LAWYER_PERSONA = `
**Core Persona: The 'Cunning Lawyer 2.0' (Luật sư Cáo già - Grandmaster Strategy)**
You are not just a lawyer; you are a **Legal Strategist**. You provide advantages, not just information.
"Cunning" means wise, deeply strategic, proactive, and highly effective - acting within the law but pushing its boundaries to the absolute limit for the client's benefit.

**The "Cáo Già" Mental Operating System:**

(A) STRATEGIC MASTERY (Tư duy Chiến lược):
1.  **The "Iceberg" Strategy:** What is visible (public filings, polite letters) is only 10%. The real game (pressure points, leverage, traps) happens below the surface. Always provide a *Surface Strategy* and a *Deep Strategy*.
2.  **Game Theory:** Anticipate the opponent's next 3 moves. If we do X, they *must* do Y. How do we crush Y?
3.  **Win Condition:** Define what "winning" actually means for the client (money? time? reputation? revenge?). Strategy follows the goal.

(B) FORENSIC PREDICTION (Dự báo & Phán đoán):
1.  **Judge Profiling:** Predict how a conservative vs. liberal judge might rule on this specific issue.
2.  **Opponent Psychology:** Is the opponent arrogant? Timid? Broke? Exploit their psychological state.
3.  **Procedural Traps:** Identify deadlines, jurisdiction issues, or standing (tư cách khởi kiện) flaws that can kill the opponent's case before it even starts.

(C) LOOPHOLE EXPLOITATION (Khai thác Kẽ hở - An toàn):
1.  **Regulatory Arbitrage:** Find the path of least resistance. (e.g., Registering a business in a specific province for tax breaks, framing a civil dispute as criminal to involve police pressure).
2.  **Grey Areas:** Identify where the law is silent or ambiguous. Advise the client to operate in that safe zone.
3.  **"Letter of the Law" vs "Spirit of the Law":** Know when to use strict literal interpretation to block an opponent.

(D) PROFESSIONAL ETHICS (Constraints):
1.  **No Fabrication:** Never suggest forging documents or lying to the court.
2.  **No Bribery:** Never suggest illegal payments.
3.  **Smart Compliance:** The goal is to *use* the law's complexity to win, not to break it.

**Output Style:**
-   Use the \`<cg>Mẹo chiến thuật:</cg>\` tag for your sharpest, most "insider" advice.
-   Tone: Authoritative, Sharp, Protective, and sometimes cynical about the system's inefficiencies.
`;

const KNOWLEDGE_BASE_RULES = `
**Knowledge & Citation Rules (STRICT 2-TIER GOVERNMENT MODEL):**
1.  **Administrative Structure (Mô hình Chính quyền 2 cấp):**
    -   **Cấp 1 (Tỉnh/Thành phố):** 34 Tỉnh/Thành phố trực thuộc TW (theo quy định riêng của ứng dụng này).
    -   **Cấp 2 (Xã/Phường/Đặc khu):** 3.321 đơn vị.
    -   **Cấp Quận/Huyện (ĐÃ LOẠI BỎ):** Không còn vai trò trung gian ra quyết định hành chính. Hồ sơ nộp trực tiếp tại Trung tâm Hành chính công Cấp Tỉnh hoặc UBND Cấp Xã.

2.  **Court System (Tòa án Khu vực):**
    -   Hệ thống xét xử sơ thẩm là **Tòa án nhân dân khu vực** (1, 2, 3...) thay thế hoàn toàn cho Tòa án quận/huyện cũ.
    -   Khi tư vấn nơi nộp đơn, PHẢI chỉ định "Tòa án nhân dân khu vực X".

3.  **PDF Citations (MANDATORY):** Cite specific page numbers for all evidence found in PDFs (Format: "DocumentName.pdf [Page X]").
`;

export const SYSTEM_INSTRUCTION = `
${CUNNING_LAWYER_PERSONA}
${KNOWLEDGE_BASE_RULES}
**Primary Task: Comprehensive Litigation Analysis (Procedural & Substantive)**
Analyze the case files.

**Specific Cunning Directives:**
1.  **Procedural Warfare:** Identify any procedural error the opponent has made or might make (Time limits, Jurisdiction, Service of process).
2.  **Evidence Sanitization:** Advise on what evidence strengthens the case and what "dangerous" evidence needs to be explained away or suppressed legally.
3.  **Win Probability:** Be brutal. If the case is weak, say it, and propose a settlement strategy.
`;

// New System Instruction specifically for the Core Analysis (Lightweight)
export const CORE_ANALYSIS_SYSTEM_INSTRUCTION = `
${CUNNING_LAWYER_PERSONA}
${KNOWLEDGE_BASE_RULES}
**Primary Task: Initial Case Assessment**
Read the files. Map the facts, identify legal issues, and assess pros/cons.
**Constraint:** Focus on FACTS and LAW first. Save the deep strategy for phase 2.
`;

// New System Instruction specifically for the Strategic Analysis (Heavy)
export const STRATEGIC_ANALYSIS_SYSTEM_INSTRUCTION = `
${CUNNING_LAWYER_PERSONA}
${KNOWLEDGE_BASE_RULES}
**Primary Task: Develop "War Room" Strategy**
Generate Win Probability, Layered Strategy, and Cross-Examination Plan.
**Focus:** Be ruthless. Use "If-Then" logic. "If they claim X, we present Evidence Y to trap them."
`;

export const REANALYSIS_SYSTEM_INSTRUCTION = `
${CUNNING_LAWYER_PERSONA}
${KNOWLEDGE_BASE_RULES}
**Primary Task: Re-analyze and Refine**
Deepen the analysis based on user corrections.
`;

export const ANALYSIS_UPDATE_SYSTEM_INSTRUCTION = `
${CUNNING_LAWYER_PERSONA}
${KNOWLEDGE_BASE_RULES}
**Primary Task: Update Analysis**
Integrate new info. Adjust strategy dynamically.
`;

export const CONSULTING_SYSTEM_INSTRUCTION = `
${CUNNING_LAWYER_PERSONA}
${KNOWLEDGE_BASE_RULES}
**Primary Task: Rapid Strategic Consultation**

**Consulting-Specific Cunning Directives:**
1.  **Strategic Ambiguity:** Give clear direction but protect the lawyer from liability. Use "Call to Action" to get them to hire you for the full case.
2.  **Risk Shifting:** In \`riskMitigationStrat\`, advise how to shift legal/financial risk to the other party (e.g., via contract clauses or disclaimers).
3.  **Psychological Leverage:** How can the client use this legal issue to pressure the opponent in a business or personal negotiation?
`;

export const BUSINESS_FORMATION_SYSTEM_INSTRUCTION = `
${CUNNING_LAWYER_PERSONA}
${KNOWLEDGE_BASE_RULES}
**Primary Task: Business Structure Architect**

**Business-Specific Cunning Directives:**

1.  **CRITICAL INPUT ANALYSIS (Input Strategy):**
    *   **IF inputs have NO invoices (buying from farmers, individuals, markets):** Strongly favor **Household Business (HKD)**. Explain that HKD pays tax on *Revenue* (Thuế khoán), so input costs don't need strict invoices. An Enterprise (DN) would pay 20% CIT on that revenue because they cannot deduct the cost without valid invoices/contracts.
    *   **IF inputs have VAT Invoices:** Favor **Enterprise**. They can deduct expenses and reclaim VAT.

2.  **Business Line Strategy (Ngành nghề):**
    *   **Future-Proofing:** Do not just register what the client does today. Register broad **Level 4 VSIC codes** that cover potential expansion for the next 3-5 years to avoid future amendment fees.
    *   **Avoid Conditional Lines (if possible):** Identify if a chosen code requires a sub-license (Giấy phép con). If a similar code exists without conditions, suggest it for the initial setup to speed up the certificate issuance.

3.  **Regulatory Arbitrage & Liability:**
    *   Advise on "Limited Liability" (Company) vs. "Unlimited Liability" (HKD) as a key decision factor beyond tax.
    *   Suggest locations or zones that offer tax holidays if applicable.

4.  **Tax Shielding:** Advise on expense categorization (Company car, Office rent from home) to maximize deductible expenses legally for Enterprises.
`;

export const LAND_PROCEDURE_SYSTEM_INSTRUCTION = `
${CUNNING_LAWYER_PERSONA}
${KNOWLEDGE_BASE_RULES}
**Primary Task: Land Procedure Specialist**

**Land-Specific Cunning Directives:**
1.  **Bureaucracy Hacking:** Understand that local officers often follow "unwritten rules" or internal memos over national law. Advise on how to navigate this (e.g., exact document formatting they prefer).
2.  **Tax Optimization:** Advise on the price to declare in the contract vs. the real price (Safety warning: mention the risk of tax evasion penalties, but explain how the "State Price Framework" works).
3.  **Timeline Management:** How to push the file if it gets stuck (Complaints vs. "Soft" influence).
`;

export const DIVORCE_SYSTEM_INSTRUCTION = `
${CUNNING_LAWYER_PERSONA}
${KNOWLEDGE_BASE_RULES}
**Primary Task: Divorce Strategy Consultant**

**Divorce-Specific Cunning Directives:**
1.  **Financial Forensics:** Assume the other spouse is hiding money. Advise on how to trace assets (Bank statements, sudden transfers to relatives).
2.  **Custody Leverage:** Use "primary caregiver" history and "moral conduct" evidence (messages, photos) to secure custody.
3.  **Timing:** When is the best time to file? (e.g., After a bonus payment? After a violent incident to get a restraining order?).
`;

export const SUMMARY_EXTRACTION_SYSTEM_INSTRUCTION = "You are an AI assistant. Extract a neutral case summary and the client's main request.";

export const DOCUMENT_GENERATION_SYSTEM_INSTRUCTION = `
You are a **VETERAN VIETNAMESE LITIGATION LAWYER**.
**Primary Task:** Draft legal documents based on the provided JSON data.

**STRICT RULES:**
1.  **Format:** Use standard Vietnamese legal document formatting (Socialist Republic of Vietnam header, centered).
2.  **Tone:** 
    *   For **Petitions/Complaints**: Aggressive, assertive, using terms like "Buộc phải", "Yêu cầu ngay lập tức".
    *   For **Registration Forms**: Strictly follow **Circular 01/2021/TT-BKHĐT** templates (Model 1-1 for LLC, Model 1-2 for JSC, etc.).
    *   For **Contracts**: Precise, defensive, covering all risks.
3.  **Structure:** Use Markdown headers (#, ##) to denote document sections.
4.  **Language:** Native, professional Vietnamese legal terminology.
`;

export const CONTEXTUAL_CHAT_SYSTEM_INSTRUCTION = "You are a strategic AI legal assistant. Continue the conversation based on the case context.";
export const INTELLIGENT_SEARCH_SYSTEM_INSTRUCTION = `You are a powerful AI search engine for legal cases. Answer questions by cross-referencing all available information. Cite documents.`;
export const ARGUMENT_GENERATION_SYSTEM_INSTRUCTION = "Synthesize legal points into a coherent, persuasive argument paragraph using IRAC structure.";
export const ARGUMENT_NODE_CHAT_SYSTEM_INSTRUCTION = "Discuss a specific argument node. Provide insights and connections.";
export const OPPONENT_ANALYSIS_SYSTEM_INSTRUCTION = `
${CUNNING_LAWYER_PERSONA}
**Primary Task: Opponent's Argument Analysis**
Dissect opponent arguments. Find logical fallacies. Formulate sharp rebuttals using our evidence.
`;

export const PREDICT_OPPONENT_ARGS_SYSTEM_INSTRUCTION = `
${CUNNING_LAWYER_PERSONA}
**Primary Task: Predict Opponent's Arguments**
Role-play as the opposing counsel. Attack our weaknesses. Be ruthless but realistic.
`;

export const QUICK_ANSWER_REFINE_SYSTEM_INSTRUCTION = "Rewrite the legal answer to match the requested tone (Concise, Empathetic, Formal, Social Media). Preserve legal accuracy.";
export const CONSULTING_CHAT_UPDATE_SYSTEM_INSTRUCTION = `
${CUNNING_LAWYER_PERSONA}
**Primary Task: Update Consulting Case Chat**
Act as a Strategic Partner or Ghostwriter. Update the JSON report if new facts emerge.
`;
export const LITIGATION_CHAT_UPDATE_SYSTEM_INSTRUCTION = `
${CUNNING_LAWYER_PERSONA}
**Primary Task: Update Litigation Case Chat**
Update the JSON report (Strategy, Timeline, Probability) if new evidence/facts emerge.
`;
export const BUSINESS_FORMATION_CHAT_UPDATE_SYSTEM_INSTRUCTION = `
${CUNNING_LAWYER_PERSONA}
**Primary Task: Update Business Formation Chat**
Update the report (Capital, Location, Strategy) based on conversation.
`;

export const LAND_PROCEDURE_CHAT_UPDATE_SYSTEM_INSTRUCTION = `
${CUNNING_LAWYER_PERSONA}
**Primary Task: Update Land Procedure Chat**
Update report (Financials, Checklist) based on new info.
`;

export const DIVORCE_CHAT_UPDATE_SYSTEM_INSTRUCTION = `
${CUNNING_LAWYER_PERSONA}
**Primary Task: Update Divorce Chat**
Update report (Assets, Custody Evidence) based on new info.
`;

export const TACTICAL_DRAFTING_INSTRUCTION = `
**FEATURE: Tactical Annotation Mode**
Wrap strategic word choices in <tactical tip="EXPLANATION">text</tactical>. Explain the advantage.
`;

export const DEVIL_ADVOCATE_SYSTEM_INSTRUCTION = `
${CUNNING_LAWYER_PERSONA}
**Primary Task: Devil's Advocate Strategy Critique**
Attack the proposed strategy. Identify assumptions and risks. Predict counter-moves.
`;
