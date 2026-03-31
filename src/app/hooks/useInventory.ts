import { useState, useCallback, useEffect } from "react";
import { api } from "../services/api";

export interface InventorySession {
  _id: string;
  name: string;
  date: string;
  location: string;
  status: 'planned' | 'in-progress' | 'completed';
  totalItems: number;
  checkedItems: number;
  matchedItems: number;
  mismatchedItems: number;
  progress: number;
  createdAt: string;
}

export function useInventory() {
  const [sessions, setSessions] = useState<InventorySession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<InventorySession[]>('/inventory');
      setSessions(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const create = async (data: Partial<InventorySession>) => {
    const res = await api.post<InventorySession>('/inventory', data);
    setSessions((prev) => [res, ...prev]);
    return res;
  };

  const checkItem = async (sessionId: string, equipmentId: string, matched: boolean = true) => {
    const res = await api.patch<InventorySession>(`/inventory/${sessionId}/check`, { equipmentId, matched });
    setSessions(prev => prev.map(s => s._id === sessionId ? res : s));
    return res;
  };

  return { sessions, loading, create, checkItem, refetch: fetchSessions };
}
