import { ImpactKPI } from "./types";

export const MOCK_KPIS: ImpactKPI[] = [
    {
        id: '1',
        name: 'Lives Impacted',
        value: 1250,
        unit: 'people',
        trend: 'up',
        trendPercentage: 12,
        category: 'Community',
        dataSource: 'crm_contacts',
        goal: 1500
    },
    {
        id: '2',
        name: 'Volunteer Hours',
        value: 450,
        unit: 'hours',
        trend: 'stable',
        category: 'Engagement',
        dataSource: 'shifts',
        goal: 500
    },
    {
        id: '3',
        name: 'Donations Raised',
        value: 15000,
        unit: 'AUD',
        trend: 'up',
        trendPercentage: 0,
        category: 'Financial',
        dataSource: 'donations',
        goal: 20000
    },
    {
        id: '4',
        name: 'New Members',
        value: 45,
        unit: 'members',
        trend: 'down',
        trendPercentage: 5,
        category: 'Growth',
        dataSource: 'crm_contacts',
        goal: 60
    }
];

export const MOCK_CHART_DATA = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Apr', value: 800 },
    { name: 'May', value: 700 },
];

export const MOCK_DISTRIBUTION_DATA = [
    { name: 'Education', value: 400 },
    { name: 'Health', value: 300 },
    { name: 'Environment', value: 300 },
];
