import { useState, useCallback, useEffect } from 'react';
import { api } from '../services/api';

export function useUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<any[]>('/users');
      setUsers(res);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const createUser = async (data: any) => {
    await api.post('/users', data);
    await fetchUsers();
  };

  const updateUser = async (id: string, data: any) => {
    await api.put(`/users/${id}`, data);
    await fetchUsers();
  };

  const removeUser = async (id: string) => {
    await api.delete(`/users/${id}`);
    await fetchUsers();
  };

  return { users, loading, refetch: fetchUsers, createUser, updateUser, removeUser };
}
