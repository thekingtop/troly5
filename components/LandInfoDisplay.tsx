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

    // Check if there is any actual data to display
    const hasData = Object.values(landInfo).some(value => value !== undefined && value !== '');
    if (!hasData) {
        return null;
    }

    return (
        <ReportSection title="Thông tin Thửa đất & Quy hoạch">
            <div className="flex items-center gap-2 mb-4 p-2 bg-teal-50 border border-teal-200 rounded-md">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944A12.096 12.096 0 0012 21c4.217 0 7.9-2.405 9.997-5.993A11.952 11.952 0 0012 2.944a11.955 11.955 0 015.618 3.04z" />
                </svg>
                <span className="text-xs font-bold text-teal-800">Chế độ Phân tích: Đất đai</span>
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
        </ReportSection>
    );
};
