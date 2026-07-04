export interface DiseaseTrend {
  id: string;
  disease: string;
  cases: number;
  trend: string;
  isUp: boolean;
  color: string;
  bg: string;
  data: number[];
}

export const dummyDiseaseTrends: DiseaseTrend[] = [
  { id: '4', disease: 'Viral Fever', cases: 210, trend: '+30%', isUp: true, color: '#EF4444', bg: '#FEE2E2', data: [100, 110, 130, 140, 150, 160, 175, 180, 190, 200, 210] },
  { id: '1', disease: 'Dengue', cases: 125, trend: '+18%', isUp: true, color: '#EF4444', bg: '#FEE2E2', data: [30, 35, 32, 45, 50, 48, 60, 65, 80, 85, 100] },
  { id: '3', disease: 'Typhoid', cases: 42, trend: '+5%', isUp: true, color: '#F97316', bg: '#FFEDD5', data: [20, 22, 25, 24, 28, 30, 35, 38, 40, 41, 42] },
  { id: '2', disease: 'Malaria', cases: 64, trend: '-4%', isUp: false, color: '#22C55E', bg: '#DCFCE7', data: [80, 75, 70, 65, 50, 55, 40, 35, 30, 25, 20] },
  { id: '5', disease: 'Chikungunya', cases: 28, trend: '-12%', isUp: false, color: '#22C55E', bg: '#DCFCE7', data: [40, 38, 37, 35, 30, 32, 28, 31, 30, 29, 28] },
];
