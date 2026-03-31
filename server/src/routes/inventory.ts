import { Router } from 'express';
import { InventorySession } from '../models/InventorySession.js';

const router = Router();

// GET /api/inventory
router.get('/', async (_req, res) => {
  try {
    const sessions = await InventorySession.find().sort({ date: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tải đợt kiểm kê' });
  }
});

// POST /api/inventory
router.post('/', async (req, res) => {
  try {
    const session = await InventorySession.create(req.body);
    res.status(201).json(session);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Lỗi tạo đợt kiểm kê' });
  }
});

// PATCH /api/inventory/:id/check - check an item in session
router.patch('/:id/check', async (req, res) => {
  try {
    const { equipmentId, matched, notes } = req.body;
    const session = await InventorySession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Không tìm thấy đợt kiểm kê' });

    session.items.push({
      equipment: equipmentId,
      checkedAt: new Date(),
      matched: matched ?? true,
      notes,
    });

    session.checkedItems = session.items.length;
    session.matchedItems = session.items.filter(i => i.matched).length;
    session.mismatchedItems = session.items.filter(i => !i.matched).length;
    session.progress = Math.round((session.checkedItems / session.totalItems) * 100);

    if (session.progress >= 100) {
      session.status = 'completed';
      session.progress = 100;
    }

    await session.save();
    res.json(session);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Lỗi cập nhật kiểm kê' });
  }
});

export default router;
