import { Router } from 'express';
import { MaintenanceRecord } from '../models/MaintenanceRecord.js';
import { DisposalRequest } from '../models/DisposalRequest.js';
import { Equipment } from '../models/Equipment.js';

const router = Router();

// ==================== MAINTENANCE ====================

// GET /api/maintenance
router.get('/', async (_req, res) => {
  try {
    const data = await MaintenanceRecord.find().sort({ date: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tải lịch bảo trì' });
  }
});

// POST /api/maintenance
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

    const record = await MaintenanceRecord.create(payload);
    res.status(201).json(record);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Lỗi tạo bảo trì' });
  }
});

// PUT /api/maintenance/:id
router.put('/:id', async (req, res) => {
  try {
    const record = await MaintenanceRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!record) return res.status(404).json({ message: 'Không tìm thấy bản ghi' });
    res.json(record);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// ==================== DISPOSALS ====================

// GET /api/maintenance/disposals
router.get('/disposals', async (_req, res) => {
  try {
    const data = await DisposalRequest.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tải danh sách thanh lý' });
  }
});

// POST /api/maintenance/disposals
router.post('/disposals', async (req, res) => {
  try {
    const equip = await Equipment.findById(req.body.equipmentId);
    if (!equip) return res.status(404).json({ message: 'Không tìm thấy thiết bị' });

    const payload = {
      ...req.body,
      equipment: equip._id,
      equipmentName: equip.name,
      equipmentCode: equip.code,
    };

    const disposal = await DisposalRequest.create(payload);
    res.status(201).json(disposal);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Lỗi tạo yêu cầu thanh lý' });
  }
});

// PATCH /api/maintenance/disposals/:id/approve
router.patch('/disposals/:id/approve', async (req, res) => {
  try {
    const disposal = await DisposalRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    if (!disposal) return res.status(404).json({ message: 'Không tìm thấy yêu cầu thanh lý' });
    res.json(disposal);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi duyệt thanh lý' });
  }
});

export default router;
