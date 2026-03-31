import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export function useEquipment(filters?: { search?: string; status?: string; page?: number }) {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.set('search', filters.search);
      if (filters?.status) params.set('status', filters.status);
      if (filters?.page) params.set('page', String(filters.page));
      const qs = params.toString();
      const res = await api.get<PaginatedResponse<any>>(`/equipment${qs ? `?${qs}` : ''}`);
      setData(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters?.search, filters?.status, filters?.page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const create = async (equipmentData: any) => {
    const result = await api.post('/equipment', equipmentData);
    await fetchData();
    return result;
  };

  const update = async (id: string, equipmentData: any) => {
    const result = await api.put(`/equipment/${id}`, equipmentData);
    await fetchData();
    return result;
  };

  const remove = async (id: string) => {
    await api.delete(`/equipment/${id}`);
    await fetchData();
  };

  return { data, total, totalPages, loading, error, refetch: fetchData, create, update, remove };
}
