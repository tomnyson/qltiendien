import { useState, useEffect } from "react";
import { Users, Shield, Clock, Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import { api } from "../services/api";
import { useUsers } from "../hooks/useUsers";
import { FormModal } from "../components/FormModal";

const roleLabels: Record<string, string> = { admin: "Quản trị viên", warehouse: "Thủ kho", lecturer: "Giảng viên", director: "Ban Giám hiệu" };
const roleColors: Record<string, string> = { admin: "bg-purple-100 text-purple-700", warehouse: "bg-blue-100 text-blue-700", lecturer: "bg-green-100 text-green-700", director: "bg-amber-100 text-amber-700" };

const permissions = [
  { feature: "Quản lý thiết bị", admin: "XTSXD", warehouse: "XTS", lecturer: "X", director: "X" },
  { feature: "Mượn - Trả", admin: "XTSXD", warehouse: "XTSD", lecturer: "XT", director: "XD" },
  { feature: "Bảo trì & Thanh lý", admin: "XTSXD", warehouse: "XTS", lecturer: "X", director: "XD" },
  { feature: "Kiểm kê", admin: "XTSXD", warehouse: "XTSX", lecturer: "-", director: "XD" },
  { feature: "Báo cáo", admin: "X", warehouse: "X", lecturer: "X", director: "X" },
  { feature: "Phân quyền", admin: "XTSX", warehouse: "-", lecturer: "-", director: "X" },
];
const permLabels: Record<string, string> = { X: "Xem", T: "Thêm", S: "Sửa", D: "Duyệt" };

type Tab = "users" | "permissions" | "audit";

export function SettingsPage() {
  const [tab, setTab] = useState<Tab>("users");
  const { users, loading: usersLoading, createUser, updateUser, removeUser } = useUsers();
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'lecturer',
    department: ''
  });

  useEffect(() => {
    api.get<any[]>('/users/audit-logs')
      .then(setAuditLog)
      .catch(() => {})
      .finally(() => setAuditLoading(false));
  }, []);

  const tabs: { key: Tab; label: string; icon: typeof Users }[] = [
    { key: "users", label: "Người dùng", icon: Users },
    { key: "permissions", label: "Phân quyền", icon: Shield },
    { key: "audit", label: "Nhật ký hoạt động", icon: Clock },
  ];

  const handleOpenModal = (editData: any = null) => {
    if (editData) {
      setEditingId(editData._id);
      setFormData({
        name: editData.name,
        email: editData.email,
        password: '', // blank on edit
        role: editData.role,
        department: editData.department || ''
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', email: '', password: '', role: 'lecturer', department: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: any = { ...formData };
      if (editingId && !payload.password) delete payload.password; // Don't send empty password if editing

      if (editingId) {
        await updateUser(editingId, payload);
      } else {
        await createUser(payload);
      }
      setShowModal(false);
    } catch (err: any) {
      alert(err.message || "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  const loading = usersLoading || auditLoading;

  if (loading && !users.length && !auditLog.length) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="p-6 space-y-4 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1>Cài đặt &amp; Phân quyền</h1>
          <p className="text-sm text-muted-foreground">Quản lý người dùng, vai trò và nhật ký hệ thống</p>
        </div>
        {tab === 'users' && (
          <button onClick={() => handleOpenModal()} className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90">
            <Plus className="w-4 h-4" /> Thêm người dùng
          </button>
        )}
      </div>

      <div className="flex gap-1 bg-muted/50 p-1 rounded-lg w-fit">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${tab === t.key ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "users" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
              <th className="px-4 py-3">Tên</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Vai trò</th><th className="px-4 py-3">Phòng ban</th><th className="px-4 py-3">Đăng nhập cuối</th><th className="px-4 py-3 text-right">Thao tác</th>
            </tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-border/50 last:border-0 hover:bg-muted/10">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[u.role] || ''}`}>{roleLabels[u.role] || u.role}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{u.department || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.lastLogin ? new Date(u.lastLogin).toLocaleString('vi-VN') : '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleOpenModal(u)} className="p-1.5 rounded hover:bg-accent"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                    {u.role !== 'admin' && (
                      <button onClick={() => { if(confirm('Xóa người dùng này?')) removeUser(u._id) }} className="p-1.5 rounded hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Chưa có dữ liệu người dùng</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "permissions" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
              <th className="px-4 py-3">Chức năng</th><th className="px-4 py-3 text-center">Admin</th><th className="px-4 py-3 text-center">Thủ kho</th><th className="px-4 py-3 text-center">Giảng viên</th><th className="px-4 py-3 text-center">Ban GH</th>
            </tr></thead>
            <tbody>
              {permissions.map((p) => (
                <tr key={p.feature} className="border-b border-border/50 last:border-0 hover:bg-muted/10">
                  <td className="px-4 py-3 font-medium">{p.feature}</td>
                  {(["admin", "warehouse", "lecturer", "director"] as const).map((role) => (
                    <td key={role} className="px-4 py-3 text-center">
                      <div className="flex gap-0.5 justify-center flex-wrap">
                        {p[role] === "-" ? <span className="text-xs text-muted-foreground opacity-50">—</span> : p[role].split("").map((c, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100/50 text-blue-700 border border-blue-200">{permLabels[c] || c}</span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "audit" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
              <th className="px-4 py-3">Thời gian</th><th className="px-4 py-3">Người dùng</th><th className="px-4 py-3">Hành động</th><th className="px-4 py-3">Chi tiết</th>
            </tr></thead>
            <tbody>
              {auditLog.map((log) => (
                <tr key={log._id} className="border-b border-border/50 last:border-0 hover:bg-muted/10">
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{new Date(log.createdAt).toLocaleString('vi-VN')}</td>
                  <td className="px-4 py-3 font-medium">{log.userName}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium">{log.action}</span></td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{log.detail}</td>
                </tr>
              ))}
              {auditLog.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Chưa có nhật ký hoạt động nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <FormModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        title={editingId ? 'Cập nhật Người dùng' : 'Thêm Người dùng mới'}
        loading={isSubmitting}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Tên hiển thị</label>
            <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="mt-1 w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="VD: Nguyễn Văn A" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Email đăng nhập</label>
            <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="mt-1 w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="VD: nva@school.edu.vn" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Mật khẩu {editingId && <span className="text-xs italic text-muted-foreground">(Để trống nếu không muốn đổi)</span>}</label>
            <input 
              required={!editingId} 
              type="password" 
              value={formData.password} 
              onChange={e => setFormData({ ...formData, password: e.target.value })} 
              className="mt-1 w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
              placeholder={editingId ? "Nhập mật khẩu mới..." : "Nhập mật khẩu..."} 
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Vai trò</label>
            <select required value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="mt-1 w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
              <option value="lecturer">Giảng viên</option>
              <option value="warehouse">Thủ kho</option>
              <option value="director">Ban Giám hiệu</option>
              <option value="admin">Quản trị viên</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Phòng ban / Khoa</label>
            <input value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} className="mt-1 w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="VD: Khoa CNTT" />
          </div>
        </div>
      </FormModal>
    </div>
  );
}
