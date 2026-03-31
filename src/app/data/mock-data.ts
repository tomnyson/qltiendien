// Mock data for School Equipment Management System

export interface Equipment {
  id: string;
  name: string;
  code: string;
  category: string;
  location: string;
  status: "available" | "in-use" | "maintenance" | "disposed";
  supplier: string;
  purchaseDate: string;
  value: number;
  assignedTo?: string;
}

export interface BorrowRequest {
  id: string;
  equipmentName: string;
  equipmentCode: string;
  borrower: string;
  borrowDate: string;
  returnDate: string;
  status: "pending" | "approved" | "returned" | "overdue";
}

export interface MaintenanceRecord {
  id: string;
  equipmentName: string;
  equipmentCode: string;
  type: "repair" | "inspection" | "calibration";
  date: string;
  cost: number;
  status: "scheduled" | "in-progress" | "completed";
  technician: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "warehouse" | "lecturer" | "director";
  department: string;
  lastLogin: string;
}

export const equipmentData: Equipment[] = [
  { id: "E001", name: "Máy chiếu Epson EB-X51", code: "MC-001", category: "Máy chiếu", location: "Phòng A301", status: "available", supplier: "Epson Vietnam", purchaseDate: "2024-03-15", value: 15000000 },
  { id: "E002", name: "Laptop Dell Latitude 5540", code: "LT-012", category: "Máy tính", location: "Phòng Lab CNTT", status: "in-use", supplier: "Dell Vietnam", purchaseDate: "2024-01-20", value: 25000000, assignedTo: "Nguyễn Văn A" },
  { id: "E003", name: "Máy in HP LaserJet Pro M404dn", code: "MI-005", category: "Máy in", location: "Văn phòng khoa", status: "maintenance", supplier: "HP Vietnam", purchaseDate: "2023-06-10", value: 8500000 },
  { id: "E004", name: "Bộ thí nghiệm Vật lý cơ bản", code: "TN-101", category: "Thiết bị thí nghiệm", location: "Phòng TN Vật lý", status: "available", supplier: "LabTech Co.", purchaseDate: "2023-09-01", value: 35000000 },
  { id: "E005", name: "Camera hội nghị Logitech Rally", code: "CM-003", category: "Thiết bị hội nghị", location: "Phòng họp B201", status: "available", supplier: "Logitech Vietnam", purchaseDate: "2024-05-22", value: 42000000 },
  { id: "E006", name: "Máy đo nhiệt độ hồng ngoại", code: "MD-007", category: "Thiết bị đo lường", location: "Kho chính", status: "disposed", supplier: "Fluke Corp.", purchaseDate: "2020-11-15", value: 12000000 },
  { id: "E007", name: "Bảng tương tác thông minh 75\"", code: "BT-002", category: "Thiết bị giảng dạy", location: "Phòng A102", status: "in-use", supplier: "Samsung Vietnam", purchaseDate: "2024-02-28", value: 65000000, assignedTo: "Trần Thị B" },
  { id: "E008", name: "Máy quay phim Sony PXW-Z90", code: "MQ-001", category: "Thiết bị truyền thông", location: "Studio", status: "available", supplier: "Sony Vietnam", purchaseDate: "2024-04-10", value: 55000000 },
];

export const borrowRequests: BorrowRequest[] = [
  { id: "BR001", equipmentName: "Máy chiếu Epson EB-X51", equipmentCode: "MC-001", borrower: "Nguyễn Văn A", borrowDate: "2026-03-25", returnDate: "2026-03-28", status: "approved" },
  { id: "BR002", equipmentName: "Laptop Dell Latitude 5540", equipmentCode: "LT-012", borrower: "Trần Thị B", borrowDate: "2026-03-20", returnDate: "2026-04-03", status: "pending" },
  { id: "BR003", equipmentName: "Camera hội nghị Logitech Rally", equipmentCode: "CM-003", borrower: "Lê Văn C", borrowDate: "2026-03-18", returnDate: "2026-03-22", status: "overdue" },
  { id: "BR004", equipmentName: "Bộ thí nghiệm Vật lý cơ bản", equipmentCode: "TN-101", borrower: "Phạm Thị D", borrowDate: "2026-03-26", returnDate: "2026-03-30", status: "pending" },
  { id: "BR005", equipmentName: "Máy quay phim Sony PXW-Z90", equipmentCode: "MQ-001", borrower: "Hoàng Văn E", borrowDate: "2026-03-15", returnDate: "2026-03-20", status: "returned" },
];

export const maintenanceRecords: MaintenanceRecord[] = [
  { id: "MT001", equipmentName: "Máy in HP LaserJet Pro M404dn", equipmentCode: "MI-005", type: "repair", date: "2026-03-20", cost: 1500000, status: "in-progress", technician: "Nguyễn Kỹ Thuật" },
  { id: "MT002", equipmentName: "Máy chiếu Epson EB-X51", equipmentCode: "MC-001", type: "inspection", date: "2026-04-01", cost: 500000, status: "scheduled", technician: "Trần Bảo Trì" },
  { id: "MT003", equipmentName: "Bộ thí nghiệm Vật lý cơ bản", equipmentCode: "TN-101", type: "calibration", date: "2026-03-15", cost: 2000000, status: "completed", technician: "Lê Hiệu Chuẩn" },
];

export const users: User[] = [
  { id: "U001", name: "Nguyễn Admin", email: "admin@school.edu.vn", role: "admin", department: "Phòng CNTT", lastLogin: "2026-03-28 08:30" },
  { id: "U002", name: "Trần Thủ Kho", email: "thukho@school.edu.vn", role: "warehouse", department: "Phòng Quản trị", lastLogin: "2026-03-28 07:45" },
  { id: "U003", name: "Lê Giảng Viên", email: "giangvien@school.edu.vn", role: "lecturer", department: "Khoa CNTT", lastLogin: "2026-03-27 16:20" },
  { id: "U004", name: "Phạm Hiệu Trưởng", email: "hieutruong@school.edu.vn", role: "director", department: "Ban Giám hiệu", lastLogin: "2026-03-28 09:00" },
];

export const categories = [
  { id: "C01", name: "Máy chiếu", count: 24 },
  { id: "C02", name: "Máy tính", count: 156 },
  { id: "C03", name: "Máy in", count: 32 },
  { id: "C04", name: "Thiết bị thí nghiệm", count: 89 },
  { id: "C05", name: "Thiết bị hội nghị", count: 15 },
  { id: "C06", name: "Thiết bị đo lường", count: 45 },
  { id: "C07", name: "Thiết bị giảng dạy", count: 67 },
  { id: "C08", name: "Thiết bị truyền thông", count: 12 },
];

export const locations = [
  { id: "L01", name: "Tòa nhà A", rooms: 30, equipment: 120 },
  { id: "L02", name: "Tòa nhà B", rooms: 25, equipment: 95 },
  { id: "L03", name: "Khu thí nghiệm", rooms: 15, equipment: 180 },
  { id: "L04", name: "Kho chính", rooms: 5, equipment: 45 },
  { id: "L05", name: "Studio & Truyền thông", rooms: 3, equipment: 28 },
];

export const statsOverview = {
  totalEquipment: 440,
  available: 285,
  inUse: 112,
  maintenance: 28,
  disposed: 15,
  totalValue: 12500000000,
  pendingBorrows: 8,
  overdueReturns: 3,
};

export const monthlyStats = [
  { month: "T10", borrowed: 45, returned: 42, maintenance: 5 },
  { month: "T11", borrowed: 52, returned: 48, maintenance: 8 },
  { month: "T12", borrowed: 38, returned: 40, maintenance: 3 },
  { month: "T1", borrowed: 55, returned: 50, maintenance: 6 },
  { month: "T2", borrowed: 60, returned: 58, maintenance: 7 },
  { month: "T3", borrowed: 48, returned: 44, maintenance: 4 },
];

export const categoryDistribution = [
  { name: "Máy tính", value: 156, color: "#3b82f6" },
  { name: "Thí nghiệm", value: 89, color: "#10b981" },
  { name: "Giảng dạy", value: 67, color: "#f59e0b" },
  { name: "Đo lường", value: 45, color: "#8b5cf6" },
  { name: "Máy in", value: 32, color: "#ef4444" },
  { name: "Máy chiếu", value: 24, color: "#06b6d4" },
  { name: "Khác", value: 27, color: "#6b7280" },
];
