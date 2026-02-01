export interface ImpactKPI {
    id: string;
    name: string;
    description?: string;
    value: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
    trendPercentage?: number;
    goal?: number;
    category: string;
    dataSource: string; // Ditto collection reference
    formula?: string;
}

export type ReportSectionType = 'header' | 'text' | 'kpi-grid' | 'chart' | 'table';

export interface ReportSection {
    id: string;
    type: ReportSectionType;
    title?: string;
    content?: any; // structured content based on type
    order: number;
}

export interface ImpactReport {
    id: string;
    title: string;
    period: { start: string; end: string };
    sections: ReportSection[];
    status: 'draft' | 'published';
    createdAt: string;
    createdBy: string;
}
