import { Router } from 'express';
import { Equipment } from '../models/Equipment.js';
import { BorrowRequest } from '../models/BorrowRequest.js';
import { MaintenanceRecord } from '../models/MaintenanceRecord.js';

const router = Router();

// GET /api/stats/overview
router.get('/overview', async (_req, res) => {
  try {
    const [statusCounts, totalValue, pendingBorrows, overdueReturns] = await Promise.all([
      Equipment.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Equipment.aggregate([
        { $group: { _id: null, total: { $sum: '$value' } } },
      ]),
      BorrowRequest.countDocuments({ status: 'pending' }),
      BorrowRequest.countDocuments({ status: 'overdue' }),
    ]);

    const statusMap = new Map(statusCounts.map(s => [s._id, s.count]));
    const totalEquipment = statusCounts.reduce((sum, s) => sum + s.count, 0);

    res.json({
      totalEquipment,
      available: statusMap.get('available') || 0,
      inUse: statusMap.get('in-use') || 0,
      maintenance: statusMap.get('maintenance') || 0,
      disposed: statusMap.get('disposed') || 0,
      totalValue: totalValue[0]?.total || 0,
      pendingBorrows,
      overdueReturns,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tải thống kê' });
  }
});

// GET /api/stats/monthly
router.get('/monthly', async (_req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [borrowStats, maintenanceStats] = await Promise.all([
      BorrowRequest.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { $month: '$createdAt' },
            borrowed: { $sum: 1 },
            returned: {
              $sum: { $cond: [{ $eq: ['$status', 'returned'] }, 1, 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      MaintenanceRecord.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { $month: '$date' },
            maintenance: { $sum: 1 },
          },
        },
      ]),
    ]);

    const monthNames = ['', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    const maintenanceMap = new Map(maintenanceStats.map(m => [m._id, m.maintenance]));

    const result = borrowStats.map(b => ({
      month: monthNames[b._id] || `T${b._id}`,
      borrowed: b.borrowed,
      returned: b.returned,
      maintenance: maintenanceMap.get(b._id) || 0,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tải thống kê tháng' });
  }
});

// GET /api/stats/categories
router.get('/categories', async (_req, res) => {
  try {
    const data = await Equipment.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      { $unwind: '$categoryInfo' },
      {
        $group: {
          _id: '$category',
          name: { $first: '$categoryInfo.name' },
          value: { $sum: 1 },
        },
      },
      { $sort: { value: -1 } },
    ]);

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#6b7280'];
    const result = data.map((d, i) => ({
      name: d.name,
      value: d.value,
      color: colors[i % colors.length],
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tải phân bố danh mục' });
  }
});

export default router;
