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

export interface BaseSection {
    id: string;
    title?: string;
    order: number;
}

export interface HeaderSection extends BaseSection {
    type: 'header';
    content: string;
}

export interface TextSection extends BaseSection {
    type: 'text';
    content: string;
}

export interface KPIGridSection extends BaseSection {
    type: 'kpi-grid';
    content: string[]; // Array of KPI IDs
}

export interface ChartSection extends BaseSection {
    type: 'chart';
    content: {
        chartType: 'bar' | 'line' | 'pie';
        kpiIds: string[];
        options?: any;
    };
}

export interface TableSection extends BaseSection {
    type: 'table';
    content: {
        columns: { key: string; label: string }[];
        rows: any[];
    };
}

export type ReportSection = HeaderSection | TextSection | KPIGridSection | ChartSection | TableSection;

export interface ImpactReport {
    id: string;
    title: string;
    period: { start: string; end: string };
    sections: ReportSection[];
    status: 'draft' | 'published';
    createdAt: string;
    createdBy: string;
}
