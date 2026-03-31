import { Router } from 'express';
import { Supplier } from '../models/Supplier.js';
import { Equipment } from '../models/Equipment.js';
import { authorize, NON_LECTURER_ROLES } from '../middleware/auth.js';

const router = Router();
router.use(authorize(...NON_LECTURER_ROLES));

// GET /api/suppliers - with item count
router.get('/', async (_req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ name: 1 });
    const counts = await Equipment.aggregate([
      { $group: { _id: '$supplier', count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map(c => [c._id.toString(), c.count]));

    const result = suppliers.map(sup => ({
      ...sup.toObject(),
      items: countMap.get(sup._id.toString()) || 0,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tải nhà cung cấp' });
  }
});

// POST /api/suppliers
router.post('/', async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Lỗi tạo nhà cung cấp' });
  }
});

// PUT /api/suppliers/:id
router.put('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!supplier) return res.status(404).json({ message: 'Không tìm thấy NCC' });
    res.json(supplier);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Lỗi cập nhật NCC' });
  }
});

// DELETE /api/suppliers/:id
router.delete('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Không tìm thấy NCC' });
    res.json({ message: 'Đã xóa nhà cung cấp' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa NCC' });
  }
});

export default router;
