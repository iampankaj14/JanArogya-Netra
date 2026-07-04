import { ReportItem } from '@/shared/types/report';


export const dummyReports: ReportItem[] = [
  {
    id: 'r1',
    title: 'Weekly Epidemiological Summary - Week 26',
    type: 'Epidemiological',
    date: '2026-06-28T18:00:00Z',
    generatedBy: 'System AI',
  },
  {
    id: 'r2',
    title: 'June Medicine Redistribution Audit',
    type: 'Inventory Audit',
    date: '2026-06-25T12:00:00Z',
    generatedBy: 'Dr. Rajesh Kumar',
  },
  {
    id: 'r3',
    title: 'PHC Mandi Shyam Nagar Service Delivery Report',
    type: 'Performance',
    date: '2026-06-20T10:00:00Z',
    generatedBy: 'Dr. Vikram Patel',
  },
];

export default dummyReports;
