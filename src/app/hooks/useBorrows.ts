import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export function useBorrows(filters?: { status?: string; search?: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters?.status && filters.status !== 'all') params.set('status', filters.status);
      if (filters?.search) params.set('search', filters.search);
      const qs = params.toString();
      const res = await api.get<any[]>(`/borrows${qs ? `?${qs}` : ''}`);
      setData(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters?.status, filters?.search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const create = async (borrowData: any) => {
    const result = await api.post('/borrows', borrowData);
    await fetchData();
    return result;
  };

  const approve = async (id: string) => {
    await api.patch(`/borrows/${id}/approve`);
    await fetchData();
  };

  const reject = async (id: string) => {
    await api.patch(`/borrows/${id}/reject`);
    await fetchData();
  };

  const markReturned = async (id: string) => {
    await api.patch(`/borrows/${id}/return`);
    await fetchData();
  };

  return { data, loading, error, refetch: fetchData, create, approve, reject, markReturned };
}
