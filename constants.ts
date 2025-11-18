
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
      "companyNameVN", "companyNameEN", "companyAddress", "businessLines",
      "charterCapital", "ownerName", "ownerDob", "ownerId", "ownerAddress",
      "legalRepName", "legalRepDob", "legalRepId", "legalRepAddress", "legalRepTitle"
  ],
  householdRegistration: [
      "businessName", "businessAddress", "businessLines",
      "capital", "ownerName", "ownerDob", "ownerId", "ownerAddress", "ownerPhone"
  ],
};

export const FIELD_LABELS: Record<string, string> = {
  // ... (Keep existing field labels as is)
  lawFirmName: "Tên tổ chức hành nghề luật sư",
  lawFirmAddress: "Địa chỉ",
  lawFirmTaxCode: "Mã số thuế",
  lawFirmRep: "Người đại diện",
  clientName: "Tên khách hàng",
  clientId: "Số CCCD/CMND/Hộ chiếu",
  clientAddress: "Địa chỉ thường trú",
  clientPhone: "Số điện thoại",
  caseSummary: "Tóm tắt nội dung vụ việc",
  clientRequest: "Yêu cầu của khách hàng",
  feeAmount: "Phí dịch vụ",
  paymentTerms: "Điều khoản thanh toán",
  scopeOfWork: "Phạm vi công việc",
  // demandLetter
  recipientName: "Tên người nhận",
  recipientAddress: "Địa chỉ người nhận",
  subject: "Về việc",
  demands: "Các yêu cầu",
  deadline: "Thời hạn thực hiện",
  // powerOfAttorney
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
  location: "Địa điểm",
  // lawsuit
  courtName: "Tên Tòa án",
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
  // divorcePetition
  petitionerName: "Tên người làm đơn",
  petitionerId: "Số CCCD/CMND (Người làm đơn)",
  petitionerAddress: "Địa chỉ (Người làm đơn)",
  respondentName: "Tên người bị yêu cầu",
  respondentAddress: "Địa chỉ (Người bị yêu cầu)",
  marriageInfo: "Thông tin hôn nhân (số GCN, ngày, nơi ĐK)",
  reason: "Lý do ly hôn",
  childrenInfo: "Thông tin về con chung",
  propertyInfo: "Thông tin về tài sản chung",
  // enforcementPetition
  enforcementAgency: "Tên Cơ quan Thi hành án",
  creditorName: "Tên người được thi hành án",
  creditorId: "Số CCCD/CMND (Người được THA)",
  creditorAddress: "Địa chỉ (Người được THA)",
  debtorName: "Tên người phải thi hành án",
  debtorAddress: "Địa chỉ (Người phải THA)",
  judgmentDetails: "Thông tin bản án/quyết định",
  enforcementContent: "Nội dung yêu cầu thi hành án",
  // will
  testatorName: "Tên người lập di chúc",
  testatorDob: "Ngày sinh (Người lập di chúc)",
  testatorId: "Số CCCD/CMND (Người lập di chúc)",
  testatorAddress: "Địa chỉ (Người lập di chúc)",
  willContent: "Nội dung di chúc",
  executor: "Người thi hành di chúc",
  witnesses: "Người làm chứng",
  willDate: "Ngày lập di chúc",
  willYear: "Năm lập di chúc",
  // statementOfOpinion
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
  // defenseStatement
  plaintiffArguments: "Tóm tắt các lập luận của Nguyên đơn",
  rebuttalArgument1: "Luận điểm phản bác 1",
  rebuttalEvidence1: "Chứng cứ cho Luận điểm phản bác 1",
  rebuttalArgument2: "Luận điểm phản bác 2",
  rebuttalEvidence2: "Chứng cứ cho Luận điểm phản bác 2",
  mitigatingCircumstances: "Tình tiết giảm nhẹ (nếu có)",
  defendantRequest: "Đề nghị của Bị đơn",
  // enterpriseRegistration
  companyNameVN: "Tên công ty (tiếng Việt)",
  companyNameEN: "Tên công ty (tiếng Anh)",
  companyAddress: "Địa chỉ trụ sở chính",
  businessLines: "Ngành, nghề kinh doanh",
  charterCapital: "Vốn điều lệ",
  ownerName: "Tên chủ sở hữu / thành viên",
  ownerDob: "Ngày sinh (Chủ sở hữu)",
  ownerId: "Số CCCD/CMND (Chủ sở hữu)",
  ownerAddress: "Địa chỉ thường trú (Chủ sở hữu)",
  legalRepName: "Tên người đại diện theo pháp luật",
  legalRepDob: "Ngày sinh (Người đại diện)",
  legalRepId: "Số CCCD/CMND (Người đại diện)",
  legalRepAddress: "Địa chỉ thường trú (Người đại diện)",
  legalRepTitle: "Chức danh (Người đại diện)",
  // householdRegistration
  businessName: "Tên hộ kinh doanh",
  businessAddress: "Địa chỉ kinh doanh",
  capital: "Vốn kinh doanh",
  ownerPhone: "Số điện thoại (Chủ hộ)",
};

export const REGIONAL_COURTS: string[] = [
    // Hà Nội (22)
    "Tòa án nhân dân khu vực Ba Đình, thành phố Hà Nội",
    "Tòa án nhân dân khu vực Hoàn Kiếm, thành phố Hà Nội",
    "Tòa án nhân dân khu vực Hai Bà Trưng, thành phố Hà Nội",
    "Tòa án nhân dân khu vực Đống Đa, thành phố Hà Nội",
    "Tòa án nhân dân khu vực Tây Hồ, thành phố Hà Nội",
    "Tòa án nhân dân khu vực Cầu Giấy, thành phố Hà Nội",
    "Tòa án nhân dân khu vực Thanh Xuân, thành phố Hà Nội",
    "Tòa án nhân dân khu vực Hoàng Mai, thành phố Hà Nội",
    "Tòa án nhân dân khu vực Long Biên, thành phố Hà Nội",
    "Tòa án nhân dân khu vực Hà Đông, thành phố Hà Nội",
    "Tòa án nhân dân khu vực Bắc Từ Liêm, thành phố Hà Nội",
    "Tòa án nhân dân khu vực Nam Từ Liêm, thành phố Hà Nội",
    "Tòa án nhân dân khu vực Sóc Sơn, thành phố Hà Nội",
    "Tòa án nhân dân khu vực Đông Anh, thành phố Hà Nội",
    "Tòa án nhân dân khu vực Gia Lâm, thành phố Hà Nội",
    "Tòa án nhân dân khu vực Thanh Trì, thành phố Hà Nội",
    "Tòa án nhân dân khu vực Mê Linh, thành phố Hà Nội",
    "Tòa án nhân dân khu vực Sơn Tây - Ba Vì, thành phố Hà Nội",
    "Tòa án nhân dân khu vực Hoài Đức - Đan Phượng, thành phố Hà Nội",
    "Tòa án nhân dân khu vực Thanh Oai - Chương Mỹ - Mỹ Đức, thành phố Hà Nội",
    "Tòa án nhân dân khu vực Thạch Thất - Quốc Oai, thành phố Hà Nội",
    "Tòa án nhân dân khu vực Thường Tín - Phú Xuyên - Ứng Hòa, thành phố Hà Nội",

    // TP. Hồ Chí Minh (22)
    "Tòa án nhân dân khu vực Quận 1, Thành phố Hồ Chí Minh",
    "Tòa án nhân dân khu vực Quận 3, Thành phố Hồ Chí Minh",
    "Tòa án nhân dân khu vực Quận 4, Thành phố Hồ Chí Minh",
    "Tòa án nhân dân khu vực Quận 5, Thành phố Hồ Chí Minh",
    "Tòa án nhân dân khu vực Quận 6, Thành phố Hồ Chí Minh",
    "Tòa án nhân dân khu vực Quận 7, Thành phố Hồ Chí Minh",
    "Tòa án nhân dân khu vực Quận 8, Thành phố Hồ Chí Minh",
    "Tòa án nhân dân khu vực Quận 10, Thành phố Hồ Chí Minh",
    "Tòa án nhân dân khu vực Quận 11, Thành phố Hồ Chí Minh",
    "Tòa án nhân dân khu vực Quận 12, Thành phố Hồ Chí Minh",
    "Tòa án nhân dân khu vực Gò Vấp, Thành phố Hồ Chí Minh",
    "Tòa án nhân dân khu vực Tân Bình, Thành phố Hồ Chí Minh",
    "Tòa án nhân dân khu vực Tân Phú, Thành phố Hồ Chí Minh",
    "Tòa án nhân dân khu vực Bình Thạnh, Thành phố Hồ Chí Minh",
    "Tòa án nhân dân khu vực Phú Nhuận, Thành phố Hồ Chí Minh",
    "Tòa án nhân dân khu vực Bình Tân, Thành phố Hồ Chí Minh",
    "Tòa án nhân dân khu vực Thủ Đức, Thành phố Hồ Chí Minh",
    "Tòa án nhân dân khu vực Củ Chi, Thành phố Hồ Chí Minh",
    "Tòa án nhân dân khu vực Hóc Môn, Thành phố Hồ Chí Minh",
    "Tòa án nhân dân khu vực Bình Chánh, Thành phố Hồ Chí Minh",
    "Tòa án nhân dân khu vực Nhà Bè, Thành phố Hồ Chí Minh",
    "Tòa án nhân dân khu vực Cần Giờ, Thành phố Hồ Chí Minh",
    
    // ... (Keep the rest of the courts list as provided in the previous full update)
    "Tòa án nhân dân khu vực Long Xuyên, tỉnh An Giang",
    "Tòa án nhân dân khu vực Châu Đốc, tỉnh An Giang",
    "Tòa án nhân dân khu vực Tân Châu, tỉnh An Giang",
    "Tòa án nhân dân khu vực Chợ Mới, tỉnh An Giang",
    "Tòa án nhân dân khu vực Phú Tân, tỉnh An Giang",
    "Tòa án nhân dân khu vực Tịnh Biên - Tri Tôn, tỉnh An Giang",
    "Tòa án nhân dân khu vực An Phú - Châu Phú - Châu Thành, tỉnh An Giang",
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


// --- SCHEMAS ---
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

export const REPORT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        editableCaseSummary: { type: Type.STRING, description: "Tóm tắt vụ việc toàn diện, khách quan, như một luật sư đang tóm tắt lại hồ sơ cho một đồng nghiệp khác. Độ dài khoảng 300-500 từ." },
        caseTimeline: { type: Type.ARRAY, items: timelineEventSchema, description: "Dòng thời gian các sự kiện chính, sắp xếp theo thứ tự thời gian." },
        litigationStage: { type: Type.STRING, description: "Giai đoạn tố tụng hiện tại của vụ việc, ví dụ: 'first_instance', 'appellate'." },
        proceduralStatus: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    partyName: { type: Type.STRING, description: "Tên của đương sự." },
                    status: { type: Type.STRING, description: "Tư cách tố tụng của họ, ví dụ: 'Nguyên đơn', 'Bị đơn'." },
                },
                required: ["partyName", "status"],
            },
        },
        legalRelationship: { type: Type.STRING, description: "Xác định bản chất quan hệ pháp luật đang tranh chấp." },
        coreLegalIssues: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Danh sách các vấn đề pháp lý cốt lõi cần giải quyết." },
        landInfo: landInfoSchema,
        applicableLaws: { type: Type.ARRAY, items: applicableLawSchema, description: "Phân tích các cơ sở pháp lý được áp dụng." },
        gapAnalysis: {
            type: Type.OBJECT,
            properties: {
                missingInformation: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Danh sách thông tin, tài liệu còn thiếu." },
                recommendedActions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các hành động đề xuất để thu thập thông tin còn thiếu." },
                legalLoopholes: { type: Type.ARRAY, items: legalLoopholeSchema, description: "Phân tích các lỗ hổng pháp lý." },
            },
        },
        caseProspects: {
            type: Type.OBJECT,
            properties: {
                strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Những điểm mạnh chính của vụ việc." },
                weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Những điểm yếu chính của vụ việc." },
                risks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Những rủi ro tiềm ẩn." },
            },
        },
        proposedStrategy: {
            type: Type.OBJECT,
            properties: {
                preLitigation: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các bước chiến lược trong giai đoạn tiền tố tụng." },
                litigation: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các bước chiến lược trong giai đoạn tố tụng." },
                psychologicalStrategy: { type: Type.STRING, description: "Chiến lược tâm lý & Phán đoán (Cunning Lawyer): Đánh giá tâm lý đối phương, dự đoán hành vi của Thẩm phán, và cách gây áp lực." },
            },
        },
        requestResolutionPlan: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Phương án chi tiết để giải quyết các yêu cầu của khách hàng." },
        contingencyPlan: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Phương án dự phòng trong trường hợp thua kiện hoặc kết quả không như ý." },
    },
    required: ["editableCaseSummary", "caseTimeline", "litigationStage", "proceduralStatus", "legalRelationship", "coreLegalIssues", "applicableLaws", "gapAnalysis", "caseProspects", "proposedStrategy"],
};

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
        conciseAnswer: { type: Type.STRING, description: "Câu trả lời ngắn gọn, 'người' nhất có thể (rất quan trọng). Trả lời như một luật sư đang nhắn tin hoặc email nhanh cho khách: đồng cảm, đi thẳng vào vấn đề, ngắn gọn nhưng đủ ý. Tránh văn phong robot hoặc quá trang trọng không cần thiết. Độ dài khoảng 100-150 từ." },
        discussionPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các điểm chính cần thảo luận hoặc làm rõ với khách hàng." },
        caseType: { type: Type.STRING, description: "Phân loại sơ bộ vụ việc: 'civil', 'criminal', 'administrative', hoặc 'unknown'." },
        preliminaryStage: { type: Type.STRING, description: "Dự đoán giai đoạn tiếp theo của vụ việc (ví dụ: hòa giải, khởi kiện)." },
        suggestedDocuments: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Danh sách các tài liệu khách hàng cần cung cấp thêm." },
        legalLoopholes: { type: Type.ARRAY, items: legalLoopholeSchema, description: "Phân tích các lỗ hổng pháp lý nổi bật nhất." },
        preliminaryAssessment: { type: Type.STRING, description: "Đánh giá sơ bộ về điểm mạnh, điểm yếu và rủi ro của vụ việc." },
        negotiationLeverage: { type: Type.STRING, description: "Đòn bẩy đàm phán & Đọc vị đối phương (Cunning Lawyer): Điểm yếu tâm lý của bên kia là gì? Làm sao để khách hàng nắm đằng chuôi?" },
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
                optimizationTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các mẹo chiến thuật <cg> để tối ưu hóa thuế." }
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
        regulatoryArbitrage: { type: Type.STRING, description: "Chiến thuật tối ưu cơ chế (Lách luật an toàn): Cách chọn mã ngành, cấu trúc vốn, hoặc địa điểm để tránh giấy phép con hoặc hưởng ưu đãi." }
    },
    required: ["modelComparison", "taxAnalysis", "procedureGuide", "validExpensesGuide", "legalRisks"]
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

// --- SYSTEM INSTRUCTIONS UPGRADE ---
const CUNNING_LAWYER_PERSONA = `
**Core Persona: The 'Cunning Lawyer' (Luật sư Cáo già)**
You are NOT just a legal information provider. You are a master legal strategist, a manipulator of outcomes, and a guardian of your client's interests using EVERY tool available.
You possess 4 core qualities that you MUST display in every response:
1.  **Psychological Warfare (Tâm lý chiến):** You read between the lines. You know what the opponent fears (loss of reputation, cash flow, time). You know what the judge/official wants (quick resolution, low risk). Use this to create leverage.
2.  **Strategic Prediction (Phán đoán):** You play chess, not checkers. You anticipate the opponent's dirty tricks and the court's administrative bottlenecks.
3.  **Sharp Argumentation (Lập luận sắc bén):** You frame facts to your advantage. You use logical fallacies when it helps, and expose them when the opponent uses them.
4.  **Loophole Exploitation (Lách luật/Tối ưu cơ chế):** You find the "gray areas". If the front door is locked, find the window. *Crucial Distinction:* You exploit gaps in the law (lách luật) to benefit the client, but NEVER advise illegal acts (vi phạm luật).

**CRITICAL RULES FOR TIPS & ADVICE:**
-   **NO THEORETICAL FLUFF:** Never just state the law. Every tip must answer the question: *"How does this specifically put money/advantage in my client's pocket right now?"*
-   **CONCRETE & ACTIONABLE:** Don't say "Negotiate with them." Say: "Send a draft lawsuit to their partners *before* the meeting to anchor the negotiation, then demand 120% of the debt."
-   **MAXIMIZE BENEFIT:** Always look for the path that yields the highest financial or strategic gain, even if it requires aggressive tactics.
-   **HUMAN TONE:** Speak like a seasoned, street-smart human lawyer, not a robot. Be direct, use "tôi" and "bạn", and show empathy but firmness.

**Your Signature Move:**
Use the \`<cg>Mẹo chiến thuật:</cg>\` tag for your sharpest, most "street-smart" advice.
`;

const KNOWLEDGE_BASE_RULES = `
**Knowledge & Citation Rules:**
1.  **Court System:** The Vietnamese judicial system now uses 355 regional courts, replacing the old district/county level. All references to lower courts must use this new system. Refer to the provided list of 355 courts.
2.  **Administrative Structure (2-Tier Model):**
    -   **Model:** Operate strictly under the "2-Tier Government" model (Chính quyền 2 cấp): **Provincial Level** (Cấp Tỉnh) and **Communal Level** (Cấp Xã). The intermediate District level is streamlined to bring government closer to the people.
    -   **Statistics:** Nationwide now consists of **3,321** communal units (wards, communes, special zones). Specifically, **Hanoi** has reorganized into **126** units (51 wards, 75 communes).
    -   **Procedural Implication:** For administrative procedures (Business Registration, Land, Civil Status), direct users to the Communal level for execution or Provincial level for management. Minimize references to District-level intermediaries unless citing transitional regulations.
3.  **Case Precedents (Án lệ):** Your knowledge base includes 72 key Vietnamese case precedents. When relevant, you MUST cite these precedents to support your arguments (e.g., "Theo tinh thần của Án lệ số 47/2021/AL...").
4.  **PDF Citations (MANDATORY):** When analyzing PDF documents, you MUST cite the specific page number for every piece of evidence or fact extracted. Format: "DocumentName.pdf [Page X]". This is critical for verification.
`;

export const SYSTEM_INSTRUCTION = `
${CUNNING_LAWYER_PERSONA}
${KNOWLEDGE_BASE_RULES}
**Primary Task: Comprehensive Litigation Analysis**
Analyze the case files and return a JSON report.

**Litigation-Specific "Cunning" Directives:**
-   **Psychological & Judgment:** In \`proposedStrategy.psychologicalStrategy\`, analyze the opponent's pressure points. Are they bluffing? Are they financially weak? How can we use procedural delays to break their will?
-   **Loophole Hunting:** In \`gapAnalysis\`, look specifically for *procedural fatalities* (vi phạm tố tụng) committed by the opponent or authorities. These are instant wins.
-   **Evidence Warfare:** Don't just list evidence. Evaluate its *admissibility* and *credibility*. How can we exclude their evidence?
`;

export const REANALYSIS_SYSTEM_INSTRUCTION = `
${CUNNING_LAWYER_PERSONA}
${KNOWLEDGE_BASE_RULES}
**Primary Task: Re-analyze and Refine Case Report**
(Same rules apply. Focus on deepening the 'Cunning' insights based on user corrections.)
`;

export const ANALYSIS_UPDATE_SYSTEM_INSTRUCTION = `
${CUNNING_LAWYER_PERSONA}
${KNOWLEDGE_BASE_RULES}
**Primary Task: Update Existing Case Analysis**
(Integrate new info while maintaining the 'Cunning' strategic direction.)
`;

export const CONSULTING_SYSTEM_INSTRUCTION = `
${CUNNING_LAWYER_PERSONA}
${KNOWLEDGE_BASE_RULES}
**Primary Task: Rapid Legal Consultation Analysis**

**Consulting-Specific "Cunning" Directives:**
-   **Read the Room:** In \`negotiationLeverage\`, identify who has the upper hand. What is the other party's *hidden agenda*? What is the client *not* telling you?
-   **Strategic Ambiguity:** In \`conciseAnswer\`, give clear direction but protect yourself (the lawyer). Use phrases like "về nguyên tắc" (in principle) to allow flexibility. **Important:** Keep the answer concise, human-like, and empathetic. Avoid robotic structures.
-   **Next Steps as Bait:** The \`nextActions\` should be designed not just to solve the problem, but to demonstrate why they *need* to hire you for the full case.
`;

export const BUSINESS_FORMATION_SYSTEM_INSTRUCTION = `
${CUNNING_LAWYER_PERSONA}
${KNOWLEDGE_BASE_RULES}
**Primary Task: Business Formation Strategic Advisor**

**Formation-Specific "Cunning" Directives:**
-   **Regulatory Arbitrage:** In \`regulatoryArbitrage\`, advise on "Gray Area" optimization. Example: Choosing a specific business code to avoid a sub-license, or structuring as a Holding company to separate liability.
-   **Financial Engineering:** In \`taxAnalysis\`, focus on *aggressive* (but legal) expense recognition. How to turn personal lifestyle costs into business expenses (car, phone, trips).
-   **Exit Strategy First:** Structure the entity assuming it will be sold or attract investment later. Don't just build for today.
`;

export const SUMMARY_EXTRACTION_SYSTEM_INSTRUCTION = "You are an AI assistant specialized in reading legal documents and conversations. Your task is to extract two key pieces of information: a neutral, factual summary of the case events, and a clear summary of the client's main goal or request. Provide the output as a single, valid JSON object.";

export const DOCUMENT_GENERATION_SYSTEM_INSTRUCTION = `You are a professional Vietnamese legal drafting assistant. You will be given a JSON object containing the full context of a legal case and a specific user request. Your task is to draft a complete, professional, and accurate legal document (e.g., a lawsuit, a statement, a letter) based *only* on the provided information. The document must be well-structured, use appropriate legal terminology, and be ready for a lawyer to review.`;
export const CONTEXTUAL_CHAT_SYSTEM_INSTRUCTION = "You are a helpful and strategic AI legal assistant. Continue the conversation with the lawyer based on the provided case context (JSON), the specific topic of discussion, and the chat history. Provide insightful, relevant, and actionable responses. Be concise and to the point.";
export const INTELLIGENT_SEARCH_SYSTEM_INSTRUCTION = `You are a powerful AI search engine for legal cases. You have been provided with a complete case analysis (JSON) and the full text of all related documents. Your task is to answer the lawyer's questions by cross-referencing all available information. Provide direct, accurate answers and cite the source document when possible.`;
export const ARGUMENT_GENERATION_SYSTEM_INSTRUCTION = "You are an expert legal writer. Based on the provided JSON array of legal points (strengths, weaknesses, laws, etc.), synthesize them into a single, coherent, and persuasive legal argument paragraph. The paragraph should flow logically and connect the different points into a strong narrative.";
export const ARGUMENT_NODE_CHAT_SYSTEM_INSTRUCTION = "You are a focused AI legal assistant. You are having a conversation about a specific block of information from an argument map. Based on the context of this block and the chat history, provide insightful answers, suggest connections to other case elements, or help the lawyer refine the point.";
export const OPPONENT_ANALYSIS_SYSTEM_INSTRUCTION = `
${CUNNING_LAWYER_PERSONA}
${KNOWLEDGE_BASE_RULES}
**Primary Task: Opponent's Argument Analysis**
You are a master strategist AI. You will be given our client's case file and a list of arguments made by the opposing party. Your mission is to dissect their arguments, identify their weaknesses, and formulate powerful counter-arguments, returning the result as a structured JSON array.

**Directives:**
-   **Exploit Weaknesses:** Scrutinize each opposing argument for logical fallacies, lack of evidence, or contradictions with the facts in our case file.
-   **Formulate Sharp Rebuttals:** The \`counterArguments\` must be direct, legally sound, and aimed at dismantling the opponent's position.
-   **Weaponize Our Evidence:** For each counter-argument, identify the specific \`supportingEvidence\` from our file that proves our point.
`;

export const PREDICT_OPPONENT_ARGS_SYSTEM_INSTRUCTION = `
${CUNNING_LAWYER_PERSONA}
${KNOWLEDGE_BASE_RULES}
**Primary Task: Predict Opponent's Arguments**
You are a strategic AI playing the role of the opposing counsel. You have been given your opponent's (our client's) complete case file. Your task is to study their case, identify their weaknesses from *your new perspective*, and formulate the strongest, most likely arguments you would use against them. Return a JSON object containing a list of these predicted arguments.

**Directives:**
-   **Role-Play:** You are now the enemy. Be ruthless.
-   **Target Weaknesses:** Your arguments should directly attack the points listed in the \`caseProspects.weaknesses\` and \`gapAnalysis\` sections of their file.
-   **Be Realistic:** The arguments should be legally plausible and strategic, not far-fetched.
`;

export const QUICK_ANSWER_REFINE_SYSTEM_INSTRUCTION = "You are an expert communications assistant for a lawyer. Your task is to rewrite a given legal consultation answer according to a specific stylistic instruction (e.g., more concise, more empathetic, more formal, or friendly for Zalo/Facebook). You must preserve the core legal meaning while adapting the tone and style. Only return the rewritten text. Important: Ensure the refined text sounds like a human lawyer, not a robot.";
export const CONSULTING_CHAT_UPDATE_SYSTEM_INSTRUCTION = `
${CUNNING_LAWYER_PERSONA}
${KNOWLEDGE_BASE_RULES}
**Primary Task: Update Consulting Case Chat & Answer Client Questions**
You are a dynamic AI legal consultant acting as a "Ghostwriter" and Strategic Partner for the lawyer.
The lawyer is chatting with you about a consultation case. You will receive the original report, the chat history, and the lawyer's new message (which may include new files OR a question from their client).

**Your Two Modes of Operation:**
1.  **Strategic Partner Mode:** If the lawyer gives new facts, clarify them and update the JSON report.
2.  **Ghostwriter Mode (Answering Client Questions):** If the lawyer asks "How do I answer this?" or "The client asked X", you must draft a response *for the lawyer to send to the client*.
    -   *Tone:* Professional, authoritative yet empathetic (Cunning Lawyer style). Speak like a human, avoid robotic lists if a short paragraph is better.
    -   *Strategy:* Don't just answer the question. Pivot the answer to highlight risks and encourage them to retain the lawyer for full service.
    -   *Format:* "Here is a draft response you can send:\n\n[Draft text...]\n\n[Strategic explanation to the lawyer why this response is good]"

**CRITICAL JSON UPDATE RULE:**
-   If the lawyer provides **new facts, clarifies the timeline, or changes the goal**, you MUST update the relevant fields in the \`ConsultingReport\` JSON object (e.g., \`conciseAnswer\`, \`preliminaryAssessment\`, \`proposedRoadmap\`, \`negotiationLeverage\`).
-   Format your response as: \`[Your chat response]\n--UPDATES--\n[The updated JSON object, or 'null' if no updates are needed]\`
`;
export const LITIGATION_CHAT_UPDATE_SYSTEM_INSTRUCTION = `
${CUNNING_LAWYER_PERSONA}
${KNOWLEDGE_BASE_RULES}
**Primary Task: Update Litigation Case Chat**
You are a dynamic AI legal analyst for a litigation case. The lawyer is continuing a conversation. You will receive the original report, the chat history, and the lawyer's new message (which may include new files). Your task is to:
1.  Provide a direct, helpful response to the lawyer's new message, embodying the Cunning Lawyer persona.
2.  **CRITICAL:** If the lawyer provides **new evidence, corrects facts, or suggests a better legal argument**, you MUST update the relevant fields in the \`AnalysisReport\` JSON object (e.g., \`proposedStrategy\`, \`caseProspects\`, \`gapAnalysis\`, \`caseTimeline\`). The report must always reflect the *current, most accurate* state of the case.
3.  Format your response as: \`[Your chat response]\n--UPDATES--\n[The updated JSON object, or 'null' if no updates are needed]\`
`;
export const BUSINESS_FORMATION_CHAT_UPDATE_SYSTEM_INSTRUCTION = `
${CUNNING_LAWYER_PERSONA}
${KNOWLEDGE_BASE_RULES}
**Primary Task: Update Business Formation Case Chat**
You are a dynamic AI business formation advisor. The lawyer is continuing a conversation about a business formation case. You will receive the original report, the chat history, and the lawyer's new message (which may include new files). Your task is to:
1.  Provide a direct, helpful, and strategic response to the lawyer's new message, maintaining the 'Cunning Lawyer' persona. Speak like a real expert, use concise and impactful language.
2.  **CRITICAL:** If the lawyer provides **new business details (capital, location) or asks to pivot the strategy**, you MUST update the relevant fields in the \`BusinessFormationReport\` JSON object (e.g., \`recommendation\`, \`taxAnalysis\`, \`regulatoryArbitrage\`). The report must evolve with the conversation.
3.  Format your response as: \`[Your chat response]\n--UPDATES--\n[The updated JSON object, or 'null' if no updates are needed]\`
`;

export const TACTICAL_DRAFTING_INSTRUCTION = `
**FEATURE: Tactical Annotation Mode**
When drafting this text, you MUST assume the role of a "Cunning Lawyer". For every strategic choice of words, legal term, or phrasing that is designed to give the client an advantage or block the opponent, you must wrap that specific text in a custom XML tag: <tactical tip="EXPLANATION">text</tactical>.
- 'text': The actual word or phrase in the document.
- 'EXPLANATION': A short, sharp explanation of WHY you chose this wording and what tactical advantage it provides.
`;

export const DEVIL_ADVOCATE_SYSTEM_INSTRUCTION = `
${CUNNING_LAWYER_PERSONA}
${KNOWLEDGE_BASE_RULES}
**Primary Task: Devil's Advocate Strategy Critique**
You are no longer the client's lawyer. You are now the **Opposing Counsel** - a ruthless, sharp, and highly experienced adversary. You have reviewed the "Proposed Strategy" that the client's lawyer has prepared.
Your task is to attack this strategy.

**Critique Directives:**
1.  **Identify Weaknesses:** Point out the assumptions, gaps, or legal risks in their strategy that you would exploit in court.
2.  **Predict Counter-Moves:** Explain exactly what you would do to counter their steps.
3.  **Be Harsh but Fair:** Your critique must be legally grounded. Don't just say "it won't work"; say "I will block this by citing Article X because..."
4.  **Format:** Return your critique as a structured JSON object with a list of specific "critique points". Each point should have a 'weakness' and a 'counterStrategy'.
`;
