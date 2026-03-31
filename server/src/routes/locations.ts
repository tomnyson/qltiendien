import { Router } from 'express';
import { Location } from '../models/Location.js';
import { Equipment } from '../models/Equipment.js';
import { authorize, NON_LECTURER_ROLES } from '../middleware/auth.js';

const router = Router();
router.use(authorize(...NON_LECTURER_ROLES));

// GET /api/locations - with equipment count
router.get('/', async (_req, res) => {
  try {
    const locations = await Location.find().sort({ name: 1 });
    const counts = await Equipment.aggregate([
      { $group: { _id: '$location', count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map(c => [c._id.toString(), c.count]));

    const result = locations.map(loc => ({
      ...loc.toObject(),
      equipment: countMap.get(loc._id.toString()) || 0,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tải vị trí' });
  }
});

// POST /api/locations
router.post('/', async (req, res) => {
  try {
    const location = await Location.create(req.body);
    res.status(201).json(location);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Lỗi tạo vị trí' });
  }
});

// PUT /api/locations/:id
router.put('/:id', async (req, res) => {
  try {
    const location = await Location.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!location) return res.status(404).json({ message: 'Không tìm thấy vị trí' });
    res.json(location);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Lỗi cập nhật vị trí' });
  }
});

// DELETE /api/locations/:id
router.delete('/:id', async (req, res) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);
    if (!location) return res.status(404).json({ message: 'Không tìm thấy vị trí' });
    res.json({ message: 'Đã xóa vị trí' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa vị trí' });
  }
});

export default router;
