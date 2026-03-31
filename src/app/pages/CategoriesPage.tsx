import { FolderTree, MapPin, Truck, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useCategories, useLocations, useSuppliers } from "../hooks/useCategories";
import { FormModal } from "../components/FormModal";

type Tab = "categories" | "locations" | "suppliers";

export function CategoriesPage() {
  const [tab, setTab] = useState<Tab>("categories");
  const { data: categories, loading: catLoading, create: createCategory, update: updateCategory, remove: removeCategory } = useCategories();
  const { data: locations, loading: locLoading, create: createLocation, update: updateLocation, remove: removeLocation } = useLocations();
  const { data: suppliers, loading: supLoading, create: createSupplier, update: updateSupplier, remove: removeSupplier } = useSuppliers();

  const [modalType, setModalType] = useState<Tab | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tabs: { key: Tab; label: string; icon: typeof FolderTree }[] = [
    { key: "categories", label: "Loại thiết bị", icon: FolderTree },
    { key: "locations", label: "Vị trí / Phòng", icon: MapPin },
    { key: "suppliers", label: "Nhà cung cấp", icon: Truck },
  ];

  const loading = catLoading || locLoading || supLoading;

  const handleOpenModal = (type: Tab, editData: any = null) => {
    setModalType(type);
    if (editData) {
      setEditingId(editData._id);
      if (type === 'categories') setFormData({ name: editData.name, description: editData.description || '' });
      if (type === 'locations') setFormData({ name: editData.name });
      if (type === 'suppliers') setFormData({ name: editData.name, contact: editData.contact || '', address: editData.address || '' });
    } else {
      setEditingId(null);
      if (type === 'categories') setFormData({ name: '', description: '' });
      if (type === 'locations') setFormData({ name: '' });
      if (type === 'suppliers') setFormData({ name: '', contact: '', address: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalType) return;
    setIsSubmitting(true);
    try {
      if (modalType === 'categories') {
        editingId ? await updateCategory(editingId, formData) : await createCategory(formData);
      } else if (modalType === 'locations') {
        editingId ? await updateLocation(editingId, formData) : await createLocation(formData);
      } else if (modalType === 'suppliers') {
        editingId ? await updateSupplier(editingId, formData) : await createSupplier(formData);
      }
      setModalType(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !categories.length && !locations.length && !suppliers.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1>Quản lý Danh mục</h1>
          <p className="text-sm text-muted-foreground">Loại thiết bị, vị trí, nhà cung cấp</p>
        </div>
        <button onClick={() => handleOpenModal(tab)} className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90">
          <Plus className="w-4 h-4" /> Thêm mới
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-lg w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
              tab === t.key ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "categories" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((c) => (
            <div key={c._id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:border-blue-200 transition-colors">
              <div>
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.description || 'Chưa có mô tả'}</p>
                <p className="text-xs text-primary mt-1">{c.count || 0} thiết bị</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleOpenModal('categories', c)} className="p-1.5 rounded hover:bg-accent"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                <button onClick={() => { if(confirm('Xóa danh mục này?')) removeCategory(c._id); }} className="p-1.5 rounded hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-muted-foreground text-sm col-span-full text-center py-8">Chưa có danh mục</p>
          )}
        </div>
      )}

      {tab === "locations" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map((l) => (
            <div key={l._id} className="bg-card border border-border rounded-xl p-4 hover:border-blue-200 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium">{l.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{l.rooms || 0} phòng · {l.equipment || 0} thiết bị</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleOpenModal('locations', l)} className="p-1.5 rounded hover:bg-accent"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                  <button onClick={() => { if(confirm('Xóa vị trí này?')) removeLocation(l._id); }} className="p-1.5 rounded hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
                </div>
              </div>
              <div className="mt-4 w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(((l.equipment || 0) / 200) * 100, 100)}%` }} />
              </div>
            </div>
          ))}
          {locations.length === 0 && (
            <p className="text-muted-foreground text-sm col-span-full text-center py-8">Chưa có vị trí</p>
          )}
        </div>
      )}

      {tab === "suppliers" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                <th className="px-4 py-3">Mã</th>
                <th className="px-4 py-3">Tên NCC</th>
                <th className="px-4 py-3">Liên hệ</th>
                <th className="px-4 py-3">Địa chỉ</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s._id} className="border-b border-border/50 last:border-0 hover:bg-muted/10">
                  <td className="px-4 py-3 text-muted-foreground">{s._id?.slice(-6).toUpperCase()}</td>
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.contact || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.address || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleOpenModal('suppliers', s)} className="p-1.5 rounded hover:bg-accent"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                    <button onClick={() => { if(confirm('Xóa NCC này?')) removeSupplier(s._id); }} className="p-1.5 rounded hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
                  </td>
                </tr>
              ))}
              {suppliers.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Chưa có nhà cung cấp</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Shared Form Modal */}
      <FormModal
        open={!!modalType}
        onClose={() => setModalType(null)}
        onSubmit={handleSubmit}
        title={`${editingId ? 'Cập nhật' : 'Thêm mới'} ${
          modalType === 'categories' ? 'Loại thiết bị' : 
          modalType === 'locations' ? 'Vị trí / Phòng' : 
          'Nhà cung cấp'
        }`}
        loading={isSubmitting}
      >
        <div className="space-y-4">
          {modalType === 'categories' && (
            <>
              <div>
                <label className="text-sm text-muted-foreground">Tên loại thiết bị</label>
                <input required value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="mt-1 w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm" placeholder="VD: Laptop, Máy in..." />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Mô tả thêm</label>
                <textarea value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} className="mt-1 w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm resize-none h-20" placeholder="Thông tin chi tiết..." />
              </div>
            </>
          )}

          {modalType === 'locations' && (
            <div>
              <label className="text-sm text-muted-foreground">Tên vị trí / phòng</label>
              <input required value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="mt-1 w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm" placeholder="VD: Phòng Lab 1, Tầng 2..." />
            </div>
          )}

          {modalType === 'suppliers' && (
            <>
              <div>
                <label className="text-sm text-muted-foreground">Tên Nhà cung cấp</label>
                <input required value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="mt-1 w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm" placeholder="Nhập tên công ty / đối tác" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Thông tin liên hệ</label>
                <input value={formData.contact || ''} onChange={e => setFormData({ ...formData, contact: e.target.value })} className="mt-1 w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm" placeholder="Email / SĐT người đại diện" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Địa chỉ</label>
                <input value={formData.address || ''} onChange={e => setFormData({ ...formData, address: e.target.value })} className="mt-1 w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm" placeholder="Địa chỉ đối tác" />
              </div>
            </>
          )}
        </div>
      </FormModal>
    </div>
  );
}
