export interface LogisticsRequest {
  id: string;
  from: string;
  to: string;
  item: string;
  quantity: number;
  status: 'pending' | 'approved' | 'en_route' | 'delivered';
  urgent: boolean;
}

export const dummyLogistics: LogisticsRequest[] = [
  { id: 'req-1', from: 'PHC Badalpur', to: 'PHC Barola', item: 'Paracetamol 650mg', quantity: 500, status: 'pending', urgent: true },
  { id: 'req-2', from: 'Jewar PHC', to: 'District Hospital', item: 'IV Fluids', quantity: 100, status: 'approved', urgent: false },
  { id: 'req-3', from: 'Dadri CHC', to: 'State Warehouse', item: 'Dengue Testing Kits', quantity: 50, status: 'pending', urgent: true },
  { id: 'req-4', from: 'Bisrakh PHC', to: 'District Hospital', item: 'Amoxicillin 250mg', quantity: 200, status: 'en_route', urgent: false },
  { id: 'req-5', from: 'Dankaur PHC', to: 'Dadri CHC', item: 'ORS Sachets', quantity: 1000, status: 'delivered', urgent: false },
  { id: 'req-6', from: 'PHC Barola', to: 'Jewar PHC', item: 'First Aid Kits', quantity: 20, status: 'pending', urgent: true },
  { id: 'req-7', from: 'State Warehouse', to: 'District Hospital', item: 'Oxygen Cylinders', quantity: 15, status: 'en_route', urgent: true },
];
