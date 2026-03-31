import { Router } from 'express';
import { BorrowRequest } from '../models/BorrowRequest.js';
import { Equipment } from '../models/Equipment.js';
import { type AuthRequest } from '../middleware/auth.js';

const router = Router();
const ACTIVE_STATUSES = ['pending', 'approved', 'overdue'];
const HISTORY_STATUSES = ['returned', 'rejected'];

// GET /api/borrows
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { status, search, scope = 'all' } = req.query;
    const filter: any = {};

    if (req.user?.role === 'lecturer') {
      filter.createdBy = req.user._id;
    }

    if (scope === 'active') {
      filter.status = { $in: ACTIVE_STATUSES };
    } else if (scope === 'history') {
      filter.status = { $in: HISTORY_STATUSES };
    }

    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { equipmentName: { $regex: search, $options: 'i' } },
        { borrower: { $regex: search, $options: 'i' } },
      ];
    }

    const data = await BorrowRequest.find(filter).sort({ createdAt: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tải danh sách mượn' });
  }
});

// POST /api/borrows
router.post('/', async (req: AuthRequest, res) => {
  try {
    const equip = await Equipment.findById(req.body.equipmentId);
    if (!equip) return res.status(404).json({ message: 'Không tìm thấy thiết bị' });

    const isLecturer = req.user?.role === 'lecturer';
    const payload = {
      ...req.body,
      equipment: equip._id,
      equipmentName: equip.name,
      equipmentCode: equip.code,
      createdBy: req.user?._id,
      borrower: isLecturer ? req.user.name : req.body.borrower,
      status: isLecturer ? 'pending' : req.body.status,
      approvedBy: isLecturer ? undefined : req.body.approvedBy,
    };

    const borrow = await BorrowRequest.create(payload);
    res.status(201).json(borrow);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Lỗi tạo phiếu mượn' });
  }
});

// PUT /api/borrows/:id
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    if (req.user?.role === 'lecturer') {
      return res.status(403).json({ message: 'Không có quyền cập nhật phiếu mượn' });
    }
    const borrow = await BorrowRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!borrow) return res.status(404).json({ message: 'Không tìm thấy phiếu mượn' });
    res.json(borrow);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH /api/borrows/:id/approve
router.patch('/:id/approve', async (req: AuthRequest, res) => {
  try {
    if (req.user?.role === 'lecturer') {
      return res.status(403).json({ message: 'Không có quyền duyệt phiếu mượn' });
    }
    const borrow = await BorrowRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', approvedBy: req.user?._id },
      { new: true }
    );
    if (!borrow) return res.status(404).json({ message: 'Không tìm thấy phiếu mượn' });
    res.json(borrow);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi duyệt phiếu mượn' });
  }
});

// PATCH /api/borrows/:id/reject
router.patch('/:id/reject', async (req: AuthRequest, res) => {
  try {
    if (req.user?.role === 'lecturer') {
      return res.status(403).json({ message: 'Không có quyền từ chối phiếu mượn' });
    }
    const borrow = await BorrowRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', approvedBy: req.user?._id },
      { new: true }
    );
    if (!borrow) return res.status(404).json({ message: 'Không tìm thấy phiếu mượn' });
    res.json(borrow);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi từ chối phiếu mượn' });
  }
});

// PATCH /api/borrows/:id/return
router.patch('/:id/return', async (req: AuthRequest, res) => {
  try {
    if (req.user?.role === 'lecturer') {
      return res.status(403).json({ message: 'Không có quyền xác nhận trả thiết bị' });
    }
    const borrow = await BorrowRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'returned', actualReturnDate: new Date() },
      { new: true }
    );
    if (!borrow) return res.status(404).json({ message: 'Không tìm thấy phiếu mượn' });
    res.json(borrow);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xác nhận trả' });
  }
});

export default router;
