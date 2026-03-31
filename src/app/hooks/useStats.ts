import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

interface StatsOverview {
  totalEquipment: number;
  available: number;
  inUse: number;
  maintenance: number;
  disposed: number;
  totalValue: number;
  pendingBorrows: number;
  overdueReturns: number;
}

interface MonthlyData {
  month: string;
  borrowed: number;
  returned: number;
  maintenance: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export function useStats() {
  const [overview, setOverview] = useState<StatsOverview | null>(null);
  const [monthly, setMonthly] = useState<MonthlyData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ov, mo, ca] = await Promise.all([
        api.get<StatsOverview>('/stats/overview'),
        api.get<MonthlyData[]>('/stats/monthly'),
        api.get<CategoryData[]>('/stats/categories'),
      ]);
      setOverview(ov);
      setMonthly(mo);
      setCategories(ca);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { overview, monthly, categories, loading, refetch: fetchData };
}
