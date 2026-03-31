# PLAN: Bổ sung CRUD cho các chức năng còn thiếu

## Tổng quan

Hệ thống đã có backend API đầy đủ nhưng frontend chỉ hiển thị dữ liệu (Read) ở phần lớn các trang. Các nút **Create, Update, Delete** trên UI hầu hết chưa được nối chức năng (chỉ là nút tĩnh). Kế hoạch này bổ sung đầy đủ CRUD cho tất cả các module.

---

## Phân tích hiện trạng

### Ma trận CRUD hiện tại

| Trang | Create | Read | Update | Delete | Ghi chú |
|-------|--------|------|--------|--------|---------|
| **Equipment** | ✅ Modal | ✅ | ❌ Nút Sửa không hoạt động | ✅ | Thiếu Edit modal, nút Xem/QR chưa nối |
| **Borrow** | ❌ Nút "Tạo phiếu" không hoạt động | ✅ | ✅ (approve/reject/return) | ❌ | Thiếu Create modal |
| **Maintenance** | ❌ Nút "Tạo yêu cầu" không hoạt động | ✅ | ❌ | ❌ | Thiếu Create modal cho cả bảo trì & thanh lý |
| **Inventory** | ❌ Nút "Tạo đợt" không hoạt động | ✅ | ❌ | ❌ | Thiếu Create modal, hook chưa có |
| **Categories** | ❌ Nút "Thêm mới" không hoạt động | ✅ | ❌ Nút Sửa không hoạt động | ✅ | Thiếu Create/Edit modal cho 3 tab |
| **Settings/Users** | ❌ Không có nút Thêm | ✅ | ❌ Nút Sửa không hoạt động | ❌ | Thiếu Create/Edit modal cho users |

---

## Proposed Changes

### Component chung: Modal Form tái sử dụng

#### [NEW] `src/app/components/FormModal.tsx`
- Component modal tái sử dụng cho tất cả form Create/Edit
- Props: `open`, `title`, `onClose`, `onSubmit`, `children`
- Hỗ trợ loading state khi submit

---

### 1. Equipment Page — Thêm Edit Modal

#### [MODIFY] `src/app/pages/EquipmentPage.tsx`
- **Edit**: Khi click nút ✏️ → Mở modal với dữ liệu hiện tại pre-fill, gọi `update(id, data)`
- **View**: Khi click nút 👁 → Mở dialog chi tiết thiết bị (read-only)
- Tái sử dụng modal hiện tại cho cả Create và Edit (phát hiện mode qua `editingId`)

---

### 2. Borrow Page — Thêm Create Modal

#### [MODIFY] `src/app/pages/BorrowPage.tsx`
- **Create**: Nút "Tạo phiếu mượn" → Modal form với:
  - Tên thiết bị (text hoặc dropdown từ equipment list)
  - Mã thiết bị
  - Người mượn
  - Ngày mượn (date picker)
  - Ngày trả dự kiến (date picker)
- Gọi `create()` từ `useBorrows` hook

---

### 3. Maintenance Page — Thêm Create Modal cho Bảo trì + Thanh lý

#### [MODIFY] `src/app/pages/MaintenancePage.tsx`
- **Create Bảo trì**: Nút "Tạo yêu cầu" (tab Bảo trì) → Modal form:
  - Tên thiết bị, Mã thiết bị
  - Loại (repair/inspection/calibration)
  - Ngày, Chi phí, KTV
- **Create Thanh lý**: Nút "Tạo yêu cầu" (tab Thanh lý) → Modal form:
  - Tên thiết bị, Mã thiết bị
  - Lý do, Nguyên giá, Giá trị còn lại
- **Approve Thanh lý**: Thêm nút Duyệt cho mỗi disposal row (status=pending)
- Gọi `createRecord()`, `createDisposal()`, `approveDisposal()` từ `useMaintenance`

---

### 4. Inventory Page — Thêm Create Modal + Hook

#### [NEW] `src/app/hooks/useInventory.ts`
- Tách logic inventory ra hook riêng (hiện đang dùng raw `api.get` trong page)
- Cung cấp: `sessions`, `create`, `loading`, `refetch`

#### [MODIFY] `src/app/pages/InventoryPage.tsx`
- **Create**: Nút "Tạo đợt kiểm kê" → Modal form:
  - Tên đợt, Ngày, Vị trí, Tổng thiết bị
- Sử dụng `useInventory` hook thay cho raw fetch

---

### 5. Categories Page — Thêm Create/Edit Modal cho 3 tab

#### [MODIFY] `src/app/pages/CategoriesPage.tsx`
- **Nút "Thêm mới"** → Detect tab hiện tại → Mở modal phù hợp:
  - Tab Categories: Form nhập tên danh mục
  - Tab Locations: Form nhập tên, số phòng
  - Tab Suppliers: Form nhập tên, liên hệ
- **Nút Sửa (✏️)** → Mở modal với dữ liệu pre-fill, gọi `update(id, data)`
- Gọi `create()`, `update()` từ hooks tương ứng

---

### 6. Settings/Users Page — Thêm Create/Edit User

#### [MODIFY] `src/app/pages/SettingsPage.tsx`
- **Create User**: Thêm nút "Thêm người dùng" → Modal form:
  - Tên, Email, Mật khẩu, Vai trò (dropdown), Phòng ban
- **Edit User**: Nút Sửa → Modal với data pre-fill (không chỉnh password)
- Gọi `api.post('/users')`, `api.put('/users/:id')`

---

## Tổng kết file thay đổi

| Loại | File | Mô tả |
|------|------|-------|
| NEW | `src/app/components/FormModal.tsx` | Modal form tái sử dụng |
| NEW | `src/app/hooks/useInventory.ts` | Hook cho inventory sessions |
| MODIFY | `src/app/pages/EquipmentPage.tsx` | Thêm Edit modal, View dialog |
| MODIFY | `src/app/pages/BorrowPage.tsx` | Thêm Create phiếu mượn |
| MODIFY | `src/app/pages/MaintenancePage.tsx` | Create bảo trì + thanh lý, Approve |
| MODIFY | `src/app/pages/InventoryPage.tsx` | Create đợt kiểm kê, dùng hook |
| MODIFY | `src/app/pages/CategoriesPage.tsx` | Create/Edit cho 3 tab |
| MODIFY | `src/app/pages/SettingsPage.tsx` | Create/Edit user |

**Tổng: 2 file mới + 6 file sửa**

---

## Verification Plan

### Kiểm tra từng trang
1. **Equipment**: Tạo mới → Sửa → Xóa → Verify trong DB
2. **Borrow**: Tạo phiếu → Duyệt → Trả → Verify
3. **Maintenance**: Tạo bảo trì → Tạo thanh lý → Duyệt thanh lý
4. **Inventory**: Tạo đợt kiểm kê mới
5. **Categories**: Thêm/sửa danh mục, vị trí, NCC → Verify count cập nhật
6. **Settings**: Thêm user → Login bằng user mới → Sửa thông tin

### Kiểm tra browser
- Mở http://localhost:5173/ → Test toàn bộ flow trên từng trang
- Verify không có lỗi console
