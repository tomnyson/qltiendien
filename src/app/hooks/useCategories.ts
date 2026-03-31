import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export function useCategories() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<any[]>('/categories');
      setData(res);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const create = async (d: any) => { await api.post('/categories', d); await fetchData(); };
  const update = async (id: string, d: any) => { await api.put(`/categories/${id}`, d); await fetchData(); };
  const remove = async (id: string) => { await api.delete(`/categories/${id}`); await fetchData(); };

  return { data, loading, refetch: fetchData, create, update, remove };
}

export function useLocations() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<any[]>('/locations');
      setData(res);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const create = async (d: any) => { await api.post('/locations', d); await fetchData(); };
  const update = async (id: string, d: any) => { await api.put(`/locations/${id}`, d); await fetchData(); };
  const remove = async (id: string) => { await api.delete(`/locations/${id}`); await fetchData(); };

  return { data, loading, refetch: fetchData, create, update, remove };
}

export function useSuppliers() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<any[]>('/suppliers');
      setData(res);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const create = async (d: any) => { await api.post('/suppliers', d); await fetchData(); };
  const update = async (id: string, d: any) => { await api.put(`/suppliers/${id}`, d); await fetchData(); };
  const remove = async (id: string) => { await api.delete(`/suppliers/${id}`); await fetchData(); };

  return { data, loading, refetch: fetchData, create, update, remove };
}
