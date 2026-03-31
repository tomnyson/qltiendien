import { Router } from 'express';
import { Category } from '../models/Category.js';
import { Equipment } from '../models/Equipment.js';
import { authorize, NON_LECTURER_ROLES } from '../middleware/auth.js';

const router = Router();
router.use(authorize(...NON_LECTURER_ROLES));

// GET /api/categories - with equipment count
router.get('/', async (_req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    const counts = await Equipment.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map(c => [c._id.toString(), c.count]));

    const result = categories.map(cat => ({
      ...cat.toObject(),
      count: countMap.get(cat._id.toString()) || 0,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tải danh mục' });
  }
});

// POST /api/categories
router.post('/', async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Lỗi tạo danh mục' });
  }
});

// PUT /api/categories/:id
router.put('/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    res.json(category);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Lỗi cập nhật danh mục' });
  }
});

// DELETE /api/categories/:id
router.delete('/:id', async (req, res) => {
  try {
    const count = await Equipment.countDocuments({ category: req.params.id });
    if (count > 0) {
      return res.status(400).json({ message: `Không thể xóa - còn ${count} thiết bị thuộc danh mục này` });
    }
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    res.json({ message: 'Đã xóa danh mục' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa danh mục' });
  }
});

export default router;
