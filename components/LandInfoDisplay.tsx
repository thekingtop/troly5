
import React from 'react';
import type { AnalysisReport } from '../types.ts';

const ReportSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-4 rounded-lg border border-slate-200/80 soft-shadow">
        <h4 className="text-base font-bold text-slate-800 mb-3">{title}</h4>
        <div className="text-sm text-slate-700 space-y-2">{children}</div>
    </div>
);

const InfoRow: React.FC<{ label: string; value: string | undefined }> = ({ label, value }) => {
    if (!value) return null;
    return (
        <div>
            <span className="font-semibold text-slate-600">{label}:</span>
            <span className="ml-2 text-slate-800">{value}</span>
        </div>
    );
};

export const LandInfoDisplay: React.FC<{ report: AnalysisReport }> = ({ report }) => {
    const { landInfo } = report;

    if (!landInfo) {
        return null;
    }

    // STRICT VALIDATION:
    // AI often returns "Không xác định", "Không có thông tin", "Chưa rõ" when specific land info is missing in general civil cases.
    // We must filter these out to prevent the section from appearing incorrectly.
    const hasMeaningfulData = Object.values(landInfo).some(value => {
        if (!value || typeof value !== 'string') return false;
        const text = value.trim().toLowerCase();
        
        const invalidPhrases = [
            'không xác định',
            'không có thông tin',
            'không có',
            'chưa rõ',
            'không đề cập',
            'không tìm thấy',
            'n/a',
            'unknown'
        ];

        // If the value contains any of these phrases, treat it as empty data.
        // Example: "Diện tích: Không xác định rõ trong hồ sơ" -> Invalid.
        // Example: "Diện tích: 100m2" -> Valid.
        return !invalidPhrases.some(phrase => text.includes(phrase));
    });

    if (!hasMeaningfulData && (!landInfo.symbolsAnalysis || landInfo.symbolsAnalysis.length === 0)) {
        return null;
    }

    return (
        <ReportSection title="Thông tin Thửa đất & Quy hoạch">
            <div className="flex items-center gap-2 mb-4 p-2 bg-teal-50 border border-teal-200 rounded-md">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944A12.096 12.096 0 0012 21c4.217 0 7.9-2.405 9.997-5.993A11.952 11.952 0 0012 2.944a11.955 11.955 0 015.618 3.04z" />
                </svg>
                <span className="text-xs font-bold text-teal-800">Dữ liệu Đất đai & Ký hiệu Bản vẽ</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                <InfoRow label="Số tờ bản đồ" value={landInfo.mapSheetNumber} />
                <InfoRow label="Số thửa đất" value={landInfo.parcelNumber} />
                <InfoRow label="Diện tích" value={landInfo.area} />
                <InfoRow label="Mục đích sử dụng" value={landInfo.landUsePurpose} />
                <InfoRow label="Thời hạn sử dụng" value={landInfo.landUseTerm} />
                <InfoRow label="Nguồn gốc sử dụng" value={landInfo.landUseSource} />
                <div className="md:col-span-2">
                    <InfoRow label="Địa chỉ thửa đất" value={landInfo.address} />
                </div>
                <div className="md:col-span-2">
                    <InfoRow label="Tình trạng quy hoạch" value={landInfo.planningStatus} />
                </div>
            </div>

            {/* NEW: Detailed Symbol Analysis Table */}
            {landInfo.symbolsAnalysis && landInfo.symbolsAnalysis.length > 0 && (
                <div className="mt-4 border rounded-lg overflow-hidden shadow-sm">
                    <div className="bg-teal-100 px-3 py-2 border-b border-teal-200">
                        <h5 className="text-sm font-bold text-teal-900 flex items-center gap-2">
                            Giải mã Ký hiệu Bản vẽ (Theo Niên đại Pháp lý)
                        </h5>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                                <tr>
                                    <th className="px-3 py-2">Ký hiệu Gốc</th>
                                    <th className="px-3 py-2">Giai đoạn</th>
                                    <th className="px-3 py-2">Ý nghĩa Lịch sử</th>
                                    <th className="px-3 py-2">Quy đổi Hiện tại</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {landInfo.symbolsAnalysis.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50">
                                        <td className="px-3 py-2 font-bold text-blue-600">{item.symbol}</td>
                                        <td className="px-3 py-2 text-slate-600">{item.period}</td>
                                        <td className="px-3 py-2">{item.meaning}</td>
                                        <td className="px-3 py-2 font-semibold text-green-700">{item.currentEquivalent}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-3 py-2 bg-slate-50 text-xs text-slate-500 italic border-t">
                        * Ký hiệu đất thay đổi tùy theo Luật Đất đai từng thời kỳ (1993, 2003, 2013, 2024).
                    </div>
                </div>
            )}
        </ReportSection>
    );
};
