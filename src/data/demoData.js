export const demoEmployees = [
  { id: 1, name: 'Alice Johnson', role: 'Operations Manager', salary: 82000, attendance: 96, employee_id: 'E-1001', employee_login_id: 'EMP1001', temporary_password: 'rb!1UE0W1#' },
  { id: 2, name: 'Bob Smith', role: 'Finance Analyst', salary: 71000, attendance: 92, employee_id: 'E-1002', employee_login_id: 'EMP1002', temporary_password: '5BLf9zm!r6' },
  { id: 3, name: 'Carol Davis', role: 'Inventory Lead', salary: 68000, attendance: 94, employee_id: 'E-1003', employee_login_id: 'EMP1003', temporary_password: '$ut1TLBVLZ' },
  { id: 4, name: 'David Wilson', role: 'Security Specialist', salary: 76000, attendance: 91, employee_id: 'E-1004', employee_login_id: 'EMP1004', temporary_password: 'p1!#sQeCIe' },
  { id: 5, name: 'Emma Thompson', role: 'Account Executive', salary: 73500, attendance: 95, employee_id: 'E-1005', employee_login_id: 'EMP1005', temporary_password: 'Qm7@2xLp1!' },
];

export const demoTransactions = [
  { id: 5012, timestamp: '2026-05-09T08:15:00Z', type: 'revenue', amount: 24500, risk_score: 12, is_fraud: false },
  { id: 5011, timestamp: '2026-05-09T07:50:00Z', type: 'expense', amount: 9200, risk_score: 24, is_fraud: false },
  { id: 5010, timestamp: '2026-05-08T15:20:00Z', type: 'payment', amount: 12800, risk_score: 16, is_fraud: false },
  { id: 5009, timestamp: '2026-05-08T12:40:00Z', type: 'refund', amount: 6100, risk_score: 78, is_fraud: true },
  { id: 5008, timestamp: '2026-05-08T09:10:00Z', type: 'transfer', amount: 17100, risk_score: 34, is_fraud: false },
];

export const demoInventory = [
  { id: 301, product_name: 'Industrial Router X4', sku: 'NET-X4-200', unit_price: 420, quantity: 34, status: 'in_stock' },
  { id: 302, product_name: 'Thermal Scanner Pro', sku: 'SEC-TH-19', unit_price: 860, quantity: 8, status: 'low_stock' },
  { id: 303, product_name: 'Smart Label Kit', sku: 'INV-LB-77', unit_price: 110, quantity: 0, status: 'out_of_stock' },
  { id: 304, product_name: 'Warehouse Beacon', sku: 'INV-BC-22', unit_price: 280, quantity: 22, status: 'in_stock' },
  { id: 305, product_name: 'POS Terminal Edge', sku: 'FIN-POS-11', unit_price: 510, quantity: 6, status: 'low_stock' },
];

export const demoFraudTransactions = [
  { id: 9001, timestamp: '2026-05-09T05:30:00Z', type: 'refund', amount: 18100, risk_score: 92, is_fraud: true },
  { id: 9002, timestamp: '2026-05-08T23:10:00Z', type: 'transfer', amount: 25600, risk_score: 88, is_fraud: true },
  { id: 9003, timestamp: '2026-05-08T21:05:00Z', type: 'payment', amount: 13400, risk_score: 81, is_fraud: true },
];

export const demoTasks = [
  { id: 1, title: 'Q2 Workforce Review', description: 'Validate attendance variance and publish HR summary for board review.', status: 'in_progress', due_date: '2026-05-14', assigned_to_name: 'Alice Johnson', assigned_by_name: 'Admin' },
  { id: 2, title: 'Reconcile Vendor Ledger', description: 'Cross-check all expense entries above $5,000 and close open mismatches.', status: 'pending', due_date: '2026-05-16', assigned_to_name: 'Bob Smith', assigned_by_name: 'Admin' },
  { id: 3, title: 'Warehouse Safety Audit', description: 'Run compliance checklist for aisle C and report all high-risk points.', status: 'completed', due_date: '2026-05-11', assigned_to_name: 'Carol Davis', assigned_by_name: 'Admin' },
];

export const demoBenchmark = {
  status: 'Above Average',
  sales_comparison: '+18.6%',
  expense_comparison: '-7.3%',
  profit_comparison: '+12.4%',
};

export const demoDashboard = {
  metrics: {
    total_sales: 286400,
    total_expenses: 163900,
    active_employees: 124,
    fraud_alerts: 3,
  },
  chart_data: [
    { name: 'Jan', sales: 38000, expense: 24000 },
    { name: 'Feb', sales: 42000, expense: 25500 },
    { name: 'Mar', sales: 47000, expense: 26800 },
    { name: 'Apr', sales: 51500, expense: 28200 },
    { name: 'May', sales: 53800, expense: 29100 },
    { name: 'Jun', sales: 54100, expense: 30300 },
  ],
  fraud_alerts_list: demoFraudTransactions.map((row) => ({ ...row, company_name: 'CloudERP' })),
  recommendations: [
    'Focus fraud rule-tuning for refund clusters in 22:00-02:00 UTC window.',
    'Reorder low-stock SKUs within 48 hours to protect dispatch SLA.',
    'Shift budget from ad-hoc expenses to high-conversion sales channels.',
  ],
};
