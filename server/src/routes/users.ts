import { Router } from 'express';
import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';

const router = Router();

// GET /api/users
router.get('/', async (_req, res) => {
  try {
    const users = await User.find().sort({ name: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tải người dùng' });
  }
});

// POST /api/users
router.post('/', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email đã tồn tại' });
    }
    res.status(400).json({ message: error.message || 'Lỗi tạo người dùng' });
  }
});

// PUT /api/users/:id
router.put('/:id', async (req, res) => {
  try {
    // Don't allow password update through this route
    const { password, ...updateData } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Lỗi cập nhật người dùng' });
  }
});

// GET /api/users/audit-logs
router.get('/audit-logs', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tải nhật ký' });
  }
});

export default router;
