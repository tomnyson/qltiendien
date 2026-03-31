import { Router } from 'express';
import { Equipment } from '../models/Equipment.js';
import { authorize, NON_LECTURER_ROLES } from '../middleware/auth.js';

const router = Router();

// GET /api/equipment - List all with filters & pagination
router.get('/', async (req, res) => {
  try {
    const { search, status, category, location, page = 1, limit = 20 } = req.query;
    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }
    if (status && status !== 'all') filter.status = status;
    if (category) filter.category = category;
    if (location) filter.location = location;

    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      Equipment.find(filter)
        .populate('category', 'name')
        .populate('location', 'name')
        .populate('supplier', 'name contact')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Equipment.countDocuments(filter),
    ]);

    res.json({ data, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tải danh sách thiết bị' });
  }
});

// GET /api/equipment/:id
router.get('/:id', async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id)
      .populate('category', 'name')
      .populate('location', 'name')
      .populate('supplier', 'name contact');
    if (!equipment) return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tải thiết bị' });
  }
});

// POST /api/equipment
router.post('/', authorize(...NON_LECTURER_ROLES), async (req, res) => {
  try {
    const equipment = await Equipment.create(req.body);
    const populated = await equipment.populate(['category', 'location', 'supplier']);
    res.status(201).json(populated);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Mã thiết bị đã tồn tại' });
    }
    res.status(400).json({ message: error.message || 'Lỗi tạo thiết bị' });
  }
});

// PUT /api/equipment/:id
router.put('/:id', authorize(...NON_LECTURER_ROLES), async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate(['category', 'location', 'supplier']);
    if (!equipment) return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
    res.json(equipment);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Lỗi cập nhật thiết bị' });
  }
});

// DELETE /api/equipment/:id
router.delete('/:id', authorize(...NON_LECTURER_ROLES), async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndDelete(req.params.id);
    if (!equipment) return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
    res.json({ message: 'Đã xóa thiết bị' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa thiết bị' });
  }
});

export default router;
