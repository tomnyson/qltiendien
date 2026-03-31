import { Router } from 'express';
import { BorrowRequest } from '../models/BorrowRequest.js';
import { Equipment } from '../models/Equipment.js';

const router = Router();

// GET /api/borrows
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter: any = {};

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
router.post('/', async (req, res) => {
  try {
    const equip = await Equipment.findById(req.body.equipmentId);
    if (!equip) return res.status(404).json({ message: 'Không tìm thấy thiết bị' });

    const payload = {
      ...req.body,
      equipment: equip._id,
      equipmentName: equip.name,
      equipmentCode: equip.code,
    };

    const borrow = await BorrowRequest.create(payload);
    res.status(201).json(borrow);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Lỗi tạo phiếu mượn' });
  }
});

// PUT /api/borrows/:id
router.put('/:id', async (req, res) => {
  try {
    const borrow = await BorrowRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!borrow) return res.status(404).json({ message: 'Không tìm thấy phiếu mượn' });
    res.json(borrow);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH /api/borrows/:id/approve
router.patch('/:id/approve', async (req, res) => {
  try {
    const borrow = await BorrowRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    if (!borrow) return res.status(404).json({ message: 'Không tìm thấy phiếu mượn' });
    res.json(borrow);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi duyệt phiếu mượn' });
  }
});

// PATCH /api/borrows/:id/reject
router.patch('/:id/reject', async (req, res) => {
  try {
    const borrow = await BorrowRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    if (!borrow) return res.status(404).json({ message: 'Không tìm thấy phiếu mượn' });
    res.json(borrow);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi từ chối phiếu mượn' });
  }
});

// PATCH /api/borrows/:id/return
router.patch('/:id/return', async (req, res) => {
  try {
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
