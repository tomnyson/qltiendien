import { useState } from "react";
import { Plus, Search, CheckCircle, XCircle, QrCode, Loader2 } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import { useBorrows } from "../hooks/useBorrows";
import { useEquipment } from "../hooks/useEquipment";
import { FormModal } from "../components/FormModal";

export function BorrowPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    equipmentId: '', borrower: '', borrowDate: '', returnDate: '', notes: ''
  });

  const { data: borrowRequests, loading, approve, reject, markReturned, create } = useBorrows({ status: tab, search });
  const { data: equipmentList } = useEquipment({ status: 'available' }); // Only show available eq
  
  const allData = useBorrows();
  const counts = {
    all: allData.data.length,
    pending: allData.data.filter(b => b.status === 'pending').length,
    approved: allData.data.filter(b => b.status === 'approved').length,
    overdue: allData.data.filter(b => b.status === 'overdue').length,
    returned: allData.data.filter(b => b.status === 'returned').length,
  };

  const statusTabs = [
    { key: "all", label: "Tất cả", count: counts.all },
    { key: "pending", label: "Chờ duyệt", count: counts.pending },
    { key: "approved", label: "Đã duyệt", count: counts.approved },
    { key: "overdue", label: "Quá hạn", count: counts.overdue },
    { key: "returned", label: "Đã trả", count: counts.returned },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await create(formData);
      setShowModal(false);
      setFormData({ equipmentId: '', borrower: '', borrowDate: '', returnDate: '', notes: '' });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !borrowRequests.length) {
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
          <h1>Quản lý Mượn - Trả</h1>
          <p className="text-sm text-muted-foreground">Theo dõi và duyệt yêu cầu mượn thiết bị</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-sm hover:bg-accent">
            <QrCode className="w-4 h-4" /> Quét QR bàn giao
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90">
            <Plus className="w-4 h-4" /> Tạo phiếu mượn
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap">
        {statusTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              tab === t.key ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm thiết bị hoặc người mượn..." className="w-full pl-9 pr-3 py-2 bg-input-background rounded-lg text-sm border border-border" />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
              <th className="px-4 py-3">Mã phiếu</th>
              <th className="px-4 py-3">Thiết bị</th>
              <th className="px-4 py-3">Người mượn</th>
              <th className="px-4 py-3">Ngày mượn</th>
              <th className="px-4 py-3">Ngày trả</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {borrowRequests.map((br) => (
              <tr key={br._id} className="border-b border-border/50 hover:bg-muted/20 last:border-0">
                <td className="px-4 py-3 text-muted-foreground">{br._id?.slice(-6).toUpperCase()}</td>
                <td className="px-4 py-3">
                  <div>{br.equipmentName?.length > 30 ? br.equipmentName.slice(0, 30) + "…" : br.equipmentName}</div>
                  <div className="text-xs text-muted-foreground">{br.equipmentCode}</div>
                </td>
                <td className="px-4 py-3">{br.borrower}</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(br.borrowDate).toLocaleDateString('vi-VN')}</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(br.returnDate).toLocaleDateString('vi-VN')}</td>
                <td className="px-4 py-3"><StatusBadge status={br.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {br.status === "pending" && (
                      <>
                        <button onClick={() => approve(br._id)} className="p-1.5 rounded hover:bg-green-100" title="Duyệt"><CheckCircle className="w-4 h-4 text-green-600" /></button>
                        <button onClick={() => reject(br._id)} className="p-1.5 rounded hover:bg-red-100" title="Từ chối"><XCircle className="w-4 h-4 text-red-600" /></button>
                      </>
                    )}
                    {br.status === "approved" && (
                      <button onClick={() => markReturned(br._id)} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200">Xác nhận trả</button>
                    )}
                    {br.status === "overdue" && (
                      <button className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200">Nhắc nhở</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {borrowRequests.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Không có phiếu mượn nào</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <FormModal 
        open={showModal} 
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        title="Tạo phiếu mượn"
        loading={isSubmitting}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Thiết bị</label>
            <select required value={formData.equipmentId} onChange={e => setFormData(p => ({ ...p, equipmentId: e.target.value }))} className="mt-1 w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm">
              <option value="">Chọn thiết bị (chỉ thiết bị đang sẵn sàng)</option>
              {equipmentList.map(eq => (
                <option key={eq._id} value={eq._id}>{eq.name} ({eq.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Người mượn</label>
            <input required value={formData.borrower} onChange={e => setFormData(p => ({ ...p, borrower: e.target.value }))} placeholder="Nhập tên người mượn / ID" className="mt-1 w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground">Ngày mượn</label>
              <input required type="date" value={formData.borrowDate} onChange={e => setFormData(p => ({ ...p, borrowDate: e.target.value }))} className="mt-1 w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Ngày trả dự kiến</label>
              <input required type="date" value={formData.returnDate} onChange={e => setFormData(p => ({ ...p, returnDate: e.target.value }))} className="mt-1 w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm" />
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Ghi chú thêm</label>
            <textarea value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} placeholder="Mục đích sử dụng, tình trạng đặc biệt..." className="mt-1 w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm resize-none h-20" />
          </div>
        </div>
      </FormModal>
    </div>
  );
}
