import { Router } from 'express';
import { InventorySession } from '../models/InventorySession.js';
import { authorize, NON_LECTURER_ROLES } from '../middleware/auth.js';
import { Equipment } from '../models/Equipment.js';

const router = Router();
router.use(authorize(...NON_LECTURER_ROLES));

function parseScannedEquipmentValue(rawValue: unknown) {
  if (typeof rawValue !== 'string') return null;

  const value = rawValue.trim();
  if (!value) return null;

  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object') {
      const candidate = parsed.code || parsed.equipmentCode || parsed.id || parsed.equipmentId;
      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate.trim();
      }
    }
  } catch {
    // Keep raw string handling below.
  }

  if (value.startsWith('tb:')) return value.slice(3).trim();

  try {
    const url = new URL(value);
    const candidate = url.searchParams.get('code') || url.searchParams.get('id');
    if (candidate) return candidate.trim();
  } catch {
    // Not a URL.
  }

  return value;
}

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
    const totalEquipment = req.body.totalItems && req.body.totalItems > 0
      ? req.body.totalItems
      : await Equipment.countDocuments();

    const session = await InventorySession.create({
      ...req.body,
      totalItems: totalEquipment,
    });
    res.status(201).json(session);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Lỗi tạo đợt kiểm kê' });
  }
});

// PATCH /api/inventory/:id/check - check an item in session
router.patch('/:id/check', async (req, res) => {
  try {
    const { equipmentId, scanValue, matched, notes } = req.body;
    const session = await InventorySession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Không tìm thấy đợt kiểm kê' });
    const scannedValue = parseScannedEquipmentValue(scanValue || equipmentId);
    if (!scannedValue) {
      return res.status(400).json({ message: 'Không đọc được nội dung QR' });
    }

    const equipment = /^[a-f\d]{24}$/i.test(scannedValue)
      ? await Equipment.findById(scannedValue)
      : await Equipment.findOne({ code: scannedValue.toUpperCase() });
    if (!equipment) {
      return res.status(404).json({ message: `Không nhận diện được thiết bị từ mã "${scannedValue}"` });
    }

    const alreadyChecked = session.items.some((item) => item.equipment?.toString() === equipment._id.toString());
    if (alreadyChecked) {
      return res.status(409).json({ message: `Thiết bị ${equipment.code} đã được ghi nhận trước đó` });
    }

    session.items.push({
      equipment: equipment._id,
      checkedAt: new Date(),
      matched: matched ?? true,
      notes,
    });

    if (session.totalItems <= 0) {
      session.totalItems = await Equipment.countDocuments();
    }
    session.checkedItems = session.items.length;
    session.matchedItems = session.items.filter(i => i.matched).length;
    session.mismatchedItems = session.items.filter(i => !i.matched).length;
    const totalItems = Math.max(session.totalItems, session.checkedItems, 1);
    session.totalItems = totalItems;
    session.progress = Math.round((session.checkedItems / totalItems) * 100);

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
