import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { Category } from './models/Category.js';
import { Location } from './models/Location.js';
import { Supplier } from './models/Supplier.js';
import { Equipment } from './models/Equipment.js';
import { BorrowRequest } from './models/BorrowRequest.js';
import { MaintenanceRecord } from './models/MaintenanceRecord.js';
import { DisposalRequest } from './models/DisposalRequest.js';
import { InventorySession } from './models/InventorySession.js';
import { User } from './models/User.js';
import { AuditLog } from './models/AuditLog.js';

async function seed() {
  await connectDB();
  console.log('🌱 Seeding database...');

  // Clear all collections
  await Promise.all([
    Category.deleteMany({}),
    Location.deleteMany({}),
    Supplier.deleteMany({}),
    Equipment.deleteMany({}),
    BorrowRequest.deleteMany({}),
    MaintenanceRecord.deleteMany({}),
    DisposalRequest.deleteMany({}),
    InventorySession.deleteMany({}),
    User.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);
  console.log('✅ Cleared existing data');

  // 1. Categories
  const categoriesData = [
    { name: 'Máy chiếu' },
    { name: 'Máy tính' },
    { name: 'Máy in' },
    { name: 'Thiết bị thí nghiệm' },
    { name: 'Thiết bị hội nghị' },
    { name: 'Thiết bị đo lường' },
    { name: 'Thiết bị giảng dạy' },
    { name: 'Thiết bị truyền thông' },
  ];
  const categories = await Category.insertMany(categoriesData);
  const catMap = new Map(categories.map(c => [c.name, c._id]));
  console.log(`✅ Created ${categories.length} categories`);

  // 2. Locations
  const locationsData = [
    { name: 'Tòa nhà A', rooms: 30 },
    { name: 'Tòa nhà B', rooms: 25 },
    { name: 'Khu thí nghiệm', rooms: 15 },
    { name: 'Kho chính', rooms: 5 },
    { name: 'Studio & Truyền thông', rooms: 3 },
  ];
  const locations = await Location.insertMany(locationsData);
  const locMap = new Map(locations.map(l => [l.name, l._id]));
  console.log(`✅ Created ${locations.length} locations`);

  // 3. Suppliers
  const suppliersData = [
    { name: 'Epson Vietnam', contact: 'epson@vn.com' },
    { name: 'Dell Vietnam', contact: 'dell@vn.com' },
    { name: 'HP Vietnam', contact: 'hp@vn.com' },
    { name: 'LabTech Co.', contact: 'labtech@co.com' },
    { name: 'Logitech Vietnam', contact: 'logitech@vn.com' },
    { name: 'Fluke Corp.', contact: 'fluke@corp.com' },
    { name: 'Samsung Vietnam', contact: 'samsung@vn.com' },
    { name: 'Sony Vietnam', contact: 'sony@vn.com' },
  ];
  const suppliers = await Supplier.insertMany(suppliersData);
  const supMap = new Map(suppliers.map(s => [s.name, s._id]));
  console.log(`✅ Created ${suppliers.length} suppliers`);

  // Helper to get location ID from room description
  function getLocationId(locationName: string) {
    if (locationName.includes('A')) return locMap.get('Tòa nhà A');
    if (locationName.includes('B')) return locMap.get('Tòa nhà B');
    if (locationName.includes('thí nghiệm') || locationName.includes('TN')) return locMap.get('Khu thí nghiệm');
    if (locationName.includes('Kho')) return locMap.get('Kho chính');
    if (locationName.includes('Studio')) return locMap.get('Studio & Truyền thông');
    return locMap.get('Tòa nhà A'); // default
  }

  // 4. Equipment
  const equipmentData = [
    { name: 'Máy chiếu Epson EB-X51', code: 'MC-001', category: catMap.get('Máy chiếu'), location: getLocationId('Phòng A301'), status: 'available' as const, supplier: supMap.get('Epson Vietnam'), purchaseDate: new Date('2024-03-15'), value: 15000000 },
    { name: 'Laptop Dell Latitude 5540', code: 'LT-012', category: catMap.get('Máy tính'), location: getLocationId('Phòng Lab CNTT'), status: 'in-use' as const, supplier: supMap.get('Dell Vietnam'), purchaseDate: new Date('2024-01-20'), value: 25000000, assignedTo: 'Nguyễn Văn A' },
    { name: 'Máy in HP LaserJet Pro M404dn', code: 'MI-005', category: catMap.get('Máy in'), location: getLocationId('Văn phòng khoa'), status: 'maintenance' as const, supplier: supMap.get('HP Vietnam'), purchaseDate: new Date('2023-06-10'), value: 8500000 },
    { name: 'Bộ thí nghiệm Vật lý cơ bản', code: 'TN-101', category: catMap.get('Thiết bị thí nghiệm'), location: getLocationId('Phòng TN Vật lý'), status: 'available' as const, supplier: supMap.get('LabTech Co.'), purchaseDate: new Date('2023-09-01'), value: 35000000 },
    { name: 'Camera hội nghị Logitech Rally', code: 'CM-003', category: catMap.get('Thiết bị hội nghị'), location: getLocationId('Phòng họp B201'), status: 'available' as const, supplier: supMap.get('Logitech Vietnam'), purchaseDate: new Date('2024-05-22'), value: 42000000 },
    { name: 'Máy đo nhiệt độ hồng ngoại', code: 'MD-007', category: catMap.get('Thiết bị đo lường'), location: getLocationId('Kho chính'), status: 'disposed' as const, supplier: supMap.get('Fluke Corp.'), purchaseDate: new Date('2020-11-15'), value: 12000000 },
    { name: 'Bảng tương tác thông minh 75"', code: 'BT-002', category: catMap.get('Thiết bị giảng dạy'), location: getLocationId('Phòng A102'), status: 'in-use' as const, supplier: supMap.get('Samsung Vietnam'), purchaseDate: new Date('2024-02-28'), value: 65000000, assignedTo: 'Trần Thị B' },
    { name: 'Máy quay phim Sony PXW-Z90', code: 'MQ-001', category: catMap.get('Thiết bị truyền thông'), location: getLocationId('Studio'), status: 'available' as const, supplier: supMap.get('Sony Vietnam'), purchaseDate: new Date('2024-04-10'), value: 55000000 },
  ];
  const equipment = await Equipment.insertMany(equipmentData);
  const equipmentMap = new Map(equipment.map((item) => [item.code, item]));
  console.log(`✅ Created ${equipment.length} equipment items`);

  // 5. Users (password: 123456)
  const usersData = [
    { name: 'Nguyễn Admin', email: 'admin@school.edu.vn', password: '123456', role: 'admin' as const, department: 'Phòng CNTT' },
    { name: 'Trần Thủ Kho', email: 'thukho@school.edu.vn', password: '123456', role: 'warehouse' as const, department: 'Phòng Quản trị' },
    { name: 'Lê Giảng Viên', email: 'giangvien@school.edu.vn', password: '123456', role: 'lecturer' as const, department: 'Khoa CNTT' },
    { name: 'Phạm Hiệu Trưởng', email: 'hieutruong@school.edu.vn', password: '123456', role: 'director' as const, department: 'Ban Giám hiệu' },
  ];

  const users = [];
  for (const userData of usersData) {
    users.push(await User.create(userData));
  }
  const userMap = new Map(users.map((user) => [user.email, user]));
  console.log(`✅ Created ${users.length} users (password: 123456)`);

  // 6. Borrow Requests
  const lecturer = userMap.get('giangvien@school.edu.vn');
  const borrowsData = [
    {
      equipment: equipmentMap.get('MC-001')?._id,
      equipmentName: 'Máy chiếu Epson EB-X51',
      equipmentCode: 'MC-001',
      borrower: 'Nguyễn Văn A',
      createdBy: userMap.get('admin@school.edu.vn')?._id,
      borrowDate: new Date('2026-03-25'),
      returnDate: new Date('2026-03-28'),
      status: 'approved' as const,
    },
    {
      equipment: equipmentMap.get('LT-012')?._id,
      equipmentName: 'Laptop Dell Latitude 5540',
      equipmentCode: 'LT-012',
      borrower: 'Trần Thị B',
      createdBy: userMap.get('thukho@school.edu.vn')?._id,
      borrowDate: new Date('2026-03-20'),
      returnDate: new Date('2026-04-03'),
      status: 'pending' as const,
    },
    {
      equipment: equipmentMap.get('CM-003')?._id,
      equipmentName: 'Camera hội nghị Logitech Rally',
      equipmentCode: 'CM-003',
      borrower: 'Lê Văn C',
      createdBy: userMap.get('admin@school.edu.vn')?._id,
      borrowDate: new Date('2026-03-18'),
      returnDate: new Date('2026-03-22'),
      status: 'overdue' as const,
    },
    {
      equipment: equipmentMap.get('TN-101')?._id,
      equipmentName: 'Bộ thí nghiệm Vật lý cơ bản',
      equipmentCode: 'TN-101',
      borrower: lecturer?.name || 'Lê Giảng Viên',
      createdBy: lecturer?._id,
      borrowDate: new Date('2026-03-26'),
      returnDate: new Date('2026-04-02'),
      status: 'pending' as const,
    },
    {
      equipment: equipmentMap.get('MQ-001')?._id,
      equipmentName: 'Máy quay phim Sony PXW-Z90',
      equipmentCode: 'MQ-001',
      borrower: lecturer?.name || 'Lê Giảng Viên',
      createdBy: lecturer?._id,
      borrowDate: new Date('2026-03-15'),
      returnDate: new Date('2026-03-20'),
      status: 'returned' as const,
      actualReturnDate: new Date('2026-03-20'),
    },
  ];
  await BorrowRequest.insertMany(borrowsData);
  console.log(`✅ Created ${borrowsData.length} borrow requests`);

  // 7. Maintenance Records
  const maintenanceData = [
    { equipmentName: 'Máy in HP LaserJet Pro M404dn', equipmentCode: 'MI-005', type: 'repair' as const, date: new Date('2026-03-20'), cost: 1500000, status: 'in-progress' as const, technician: 'Nguyễn Kỹ Thuật' },
    { equipmentName: 'Máy chiếu Epson EB-X51', equipmentCode: 'MC-001', type: 'inspection' as const, date: new Date('2026-04-01'), cost: 500000, status: 'scheduled' as const, technician: 'Trần Bảo Trì' },
    { equipmentName: 'Bộ thí nghiệm Vật lý cơ bản', equipmentCode: 'TN-101', type: 'calibration' as const, date: new Date('2026-03-15'), cost: 2000000, status: 'completed' as const, technician: 'Lê Hiệu Chuẩn' },
  ];
  await MaintenanceRecord.insertMany(maintenanceData);
  console.log(`✅ Created ${maintenanceData.length} maintenance records`);

  // 8. Disposal Requests
  const disposalData = [
    { equipmentName: 'Máy đo nhiệt độ hồng ngoại', equipmentCode: 'MD-007', reason: 'Hết tuổi thọ sử dụng', originalValue: 12000000, residualValue: 500000, status: 'pending' as const },
    { equipmentName: 'Máy chiếu cũ Panasonic', equipmentCode: 'MC-OLD', reason: 'Hư hỏng không sửa được', originalValue: 8000000, residualValue: 0, status: 'approved' as const },
  ];
  await DisposalRequest.insertMany(disposalData);
  console.log(`✅ Created ${disposalData.length} disposal requests`);

  // 9. Inventory Sessions
  const inventoryData = [
    { name: 'Kiểm kê Quý 1/2026', date: new Date('2026-03-15'), location: 'Toàn trường', totalItems: 440, checkedItems: 380, matchedItems: 365, mismatchedItems: 15, status: 'in-progress' as const, progress: 86 },
    { name: 'Kiểm kê Quý 4/2025', date: new Date('2025-12-20'), location: 'Toàn trường', totalItems: 430, checkedItems: 430, matchedItems: 425, mismatchedItems: 5, status: 'completed' as const, progress: 100 },
    { name: 'Kiểm kê Quý 3/2025', date: new Date('2025-09-15'), location: 'Khu thí nghiệm', totalItems: 180, checkedItems: 180, matchedItems: 178, mismatchedItems: 2, status: 'completed' as const, progress: 100 },
  ];
  await InventorySession.insertMany(inventoryData);
  console.log(`✅ Created ${inventoryData.length} inventory sessions`);

  // 10. Audit Logs
  const auditData = [
    { userName: 'Nguyễn Admin', action: 'Thêm thiết bị', detail: 'Máy chiếu Epson EB-X51 (MC-001)' },
    { userName: 'Trần Thủ Kho', action: 'Duyệt mượn', detail: 'Phiếu BR001 - Nguyễn Văn A' },
    { userName: 'Lê Giảng Viên', action: 'Tạo phiếu mượn', detail: 'Camera Logitech Rally' },
    { userName: 'Nguyễn Admin', action: 'Cập nhật quyền', detail: 'Vai trò Thủ kho - thêm quyền Duyệt' },
    { userName: 'Phạm Hiệu Trưởng', action: 'Xem báo cáo', detail: 'Báo cáo tồn kho Q1/2026' },
  ];
  await AuditLog.insertMany(auditData);
  console.log(`✅ Created ${auditData.length} audit logs`);

  console.log('\n🎉 Seed complete!');
  console.log('📧 Login: admin@school.edu.vn / 123456');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
