import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export function useMaintenance() {
  const [records, setRecords] = useState<any[]>([]);
  const [disposals, setDisposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [m, d] = await Promise.all([
        api.get<any[]>('/maintenance'),
        api.get<any[]>('/maintenance/disposals'),
      ]);
      setRecords(m);
      setDisposals(d);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const createRecord = async (data: any) => { await api.post('/maintenance', data); await fetchData(); };
  const createDisposal = async (data: any) => { await api.post('/maintenance/disposals', data); await fetchData(); };
  const approveDisposal = async (id: string) => { await api.patch(`/maintenance/disposals/${id}/approve`); await fetchData(); };

  return { records, disposals, loading, refetch: fetchData, createRecord, createDisposal, approveDisposal };
}
