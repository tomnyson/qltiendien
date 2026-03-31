import { useState } from "react";
import { Plus, Wrench, AlertTriangle, Loader2, CheckCircle } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import { useMaintenance } from "../hooks/useMaintenance";
import { useEquipment } from "../hooks/useEquipment";
import { FormModal } from "../components/FormModal";

export function MaintenancePage() {
  const [tab, setTab] = useState<"maintenance" | "disposal">("maintenance");
  
  const [showMaintModal, setShowMaintModal] = useState(false);
  const [showDispModal, setShowDispModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [maintData, setMaintData] = useState({ equipmentId: '', type: 'repair', date: '', cost: '', technician: '', notes: '' });
  const [dispData, setDispData] = useState({ equipmentId: '', reason: '', originalValue: '', residualValue: '' });

  const { records: maintenanceRecords, disposals: disposalRequests, loading, createRecord, createDisposal, approveDisposal } = useMaintenance();
  const { data: equipmentList } = useEquipment();

  const formatCurrency = (v: number) => new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(v) + "₫";

  const handleCreateMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createRecord({ ...maintData, cost: Number(maintData.cost) || 0 });
      setShowMaintModal(false);
      setMaintData({ equipmentId: '', type: 'repair', date: '', cost: '', technician: '', notes: '' });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateDisposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createDisposal({ 
        ...dispData, 
        originalValue: Number(dispData.originalValue) || 0,
        residualValue: Number(dispData.residualValue) || 0 
      });
      setShowDispModal(false);
      setDispData({ equipmentId: '', reason: '', originalValue: '', residualValue: '' });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !maintenanceRecords.length && !disposalRequests.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 overflow-auto h-full">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1>Bảo trì & Thanh lý</h1>
          <p className="text-sm text-muted-foreground">Quản lý lịch bảo trì và quy trình thanh lý thiết bị</p>
        </div>
        <button 
          onClick={() => tab === 'maintenance' ? setShowMaintModal(true) : setShowDispModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm"
        >
          <Plus className="w-4 h-4" /> Tạo yêu cầu {tab === 'maintenance' ? 'bảo trì' : 'thanh lý'}
        </button>
      </div>

      <div className="flex gap-1 bg-muted/50 p-1 rounded-lg w-fit">
        <button onClick={() => setTab("maintenance")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm ${tab === "maintenance" ? "bg-card shadow-sm" : "text-muted-foreground"}`}>
          <Wrench className="w-4 h-4" /> Bảo trì ({maintenanceRecords.length})
        </button>
        <button onClick={() => setTab("disposal")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm ${tab === "disposal" ? "bg-card shadow-sm" : "text-muted-foreground"}`}>
          <AlertTriangle className="w-4 h-4" /> Thanh lý ({disposalRequests.length})
        </button>
      </div>

      {tab === "maintenance" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                <th className="px-4 py-3">Mã</th>
                <th className="px-4 py-3">Thiết bị</th>
                <th className="px-4 py-3">Loại</th>
                <th className="px-4 py-3">Ngày</th>
                <th className="px-4 py-3">Chi phí</th>
                <th className="px-4 py-3">KTV</th>
                <th className="px-4 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceRecords.map((m) => (
                <tr key={m._id} className="border-b border-border/50 last:border-0 hover:bg-muted/10">
                  <td className="px-4 py-3 text-muted-foreground">{m._id?.slice(-6).toUpperCase()}</td>
                  <td className="px-4 py-3">
                    <div>{m.equipmentName}</div>
                    <div className="text-xs text-muted-foreground">{m.equipmentCode}</div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={m.type} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(m.date).toLocaleDateString('vi-VN')}</td>
                  <td className="px-4 py-3">{formatCurrency(m.cost)}</td>
                  <td className="px-4 py-3">{m.technician}</td>
                  <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                </tr>
              ))}
              {maintenanceRecords.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Chưa có bản ghi bảo trì</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "disposal" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                <th className="px-4 py-3">Mã</th>
                <th className="px-4 py-3">Thiết bị</th>
                <th className="px-4 py-3">Lý do</th>
                <th className="px-4 py-3">Nguyên giá</th>
                <th className="px-4 py-3">Giá trị còn lại</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {disposalRequests.map((d) => (
                <tr key={d._id} className="border-b border-border/50 last:border-0 hover:bg-muted/10">
                  <td className="px-4 py-3 text-muted-foreground">{d._id?.slice(-6).toUpperCase()}</td>
                  <td className="px-4 py-3">
                    <div>{d.equipmentName}</div>
                    <div className="text-xs text-muted-foreground">{d.equipmentCode}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{d.reason}</td>
                  <td className="px-4 py-3">{formatCurrency(d.originalValue)}</td>
                  <td className="px-4 py-3">{formatCurrency(d.residualValue)}</td>
                  <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                  <td className="px-4 py-3 text-right">
                    {d.status === 'pending' && (
                      <button onClick={() => approveDisposal(d._id)} className="p-1.5 rounded hover:bg-green-100" title="Duyệt thanh lý">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {disposalRequests.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Chưa có yêu cầu thanh lý</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <FormModal
        open={showMaintModal}
        onClose={() => setShowMaintModal(false)}
        onSubmit={handleCreateMaintenance}
        title="Tạo yêu cầu bảo trì"
        loading={isSubmitting}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Thiết bị</label>
            <select required value={maintData.equipmentId} onChange={e => setMaintData(p => ({ ...p, equipmentId: e.target.value }))} className="mt-1 w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm">
              <option value="">Chọn thiết bị</option>
              {equipmentList.map(eq => <option key={eq._id} value={eq._id}>{eq.name} ({eq.code})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground">Loại bảo trì</label>
              <select required value={maintData.type} onChange={e => setMaintData(p => ({ ...p, type: e.target.value }))} className="mt-1 w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm">
                <option value="repair">Sửa chữa</option>
                <option value="inspection">Kiểm tra định kỳ</option>
                <option value="calibration">Hiệu chuẩn</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Ngày thực hiện</label>
              <input required type="date" value={maintData.date} onChange={e => setMaintData(p => ({ ...p, date: e.target.value }))} className="mt-1 w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground">Chi phí (VNĐ)</label>
              <input required type="number" value={maintData.cost} onChange={e => setMaintData(p => ({ ...p, cost: e.target.value }))} className="mt-1 w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm" placeholder="0" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Kỹ thuật viên</label>
              <input required value={maintData.technician} onChange={e => setMaintData(p => ({ ...p, technician: e.target.value }))} className="mt-1 w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm" placeholder="Tên KTV / Đơn vị" />
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Ghi chú</label>
            <textarea value={maintData.notes} onChange={e => setMaintData(p => ({ ...p, notes: e.target.value }))} className="mt-1 w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm resize-none h-16" placeholder="Mô tả công việc đã thực hiện..." />
          </div>
        </div>
      </FormModal>

      <FormModal
        open={showDispModal}
        onClose={() => setShowDispModal(false)}
        onSubmit={handleCreateDisposal}
        title="Tạo yêu cầu thanh lý"
        loading={isSubmitting}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Thiết bị cần thanh lý</label>
            <select required value={dispData.equipmentId} onChange={e => setDispData(p => ({ ...p, equipmentId: e.target.value }))} className="mt-1 w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm">
              <option value="">Chọn thiết bị</option>
              {equipmentList.map(eq => <option key={eq._id} value={eq._id}>{eq.name} ({eq.code})</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Lý do thanh lý</label>
            <textarea required value={dispData.reason} onChange={e => setDispData(p => ({ ...p, reason: e.target.value }))} className="mt-1 w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm resize-none h-16" placeholder="Hư hỏng không thể sửa chữa, quá hạn sử dụng..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground">Nguyên giá (VNĐ)</label>
              <input required type="number" value={dispData.originalValue} onChange={e => setDispData(p => ({ ...p, originalValue: e.target.value }))} className="mt-1 w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm" placeholder="0" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Giá trị còn lại (VNĐ)</label>
              <input required type="number" value={dispData.residualValue} onChange={e => setDispData(p => ({ ...p, residualValue: e.target.value }))} className="mt-1 w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm" placeholder="0" />
            </div>
          </div>
        </div>
      </FormModal>
    </div>
  );
}
