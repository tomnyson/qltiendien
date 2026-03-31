import { useState } from "react";
import { Plus, Search, CheckCircle, XCircle, QrCode, Loader2, History } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import { useBorrows } from "../hooks/useBorrows";
import { useEquipment } from "../hooks/useEquipment";
import { FormModal } from "../components/FormModal";
import { useAuth } from "../context/AuthContext";

type BorrowViewMode = "active" | "history";

function BorrowPageContent({ mode }: { mode: BorrowViewMode }) {
  const { user } = useAuth();
  const isLecturer = user?.role === "lecturer";
  const isHistoryView = mode === "history";
  const borrowScope = isHistoryView ? "history" : isLecturer ? "active" : "all";

  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    equipmentId: "",
    borrower: "",
    borrowDate: "",
    returnDate: "",
    notes: "",
  });

  const { data: borrowRequests, loading, approve, reject, markReturned, create } = useBorrows({
    status: tab,
    search,
    scope: borrowScope,
  });
  const { data: allBorrows } = useBorrows({ scope: borrowScope });
  const { data: equipmentList } = useEquipment({ status: "available" });

  const counts = {
    all: allBorrows.length,
    pending: allBorrows.filter((b) => b.status === "pending").length,
    approved: allBorrows.filter((b) => b.status === "approved").length,
    overdue: allBorrows.filter((b) => b.status === "overdue").length,
    returned: allBorrows.filter((b) => b.status === "returned").length,
    rejected: allBorrows.filter((b) => b.status === "rejected").length,
  };

  const statusTabs = isHistoryView
    ? [
        { key: "all", label: "Tất cả", count: counts.all },
        { key: "returned", label: "Đã trả", count: counts.returned },
        { key: "rejected", label: "Từ chối", count: counts.rejected },
      ]
    : [
        { key: "all", label: "Tất cả", count: counts.all },
        { key: "pending", label: "Chờ duyệt", count: counts.pending },
        { key: "approved", label: "Đã duyệt", count: counts.approved },
        { key: "overdue", label: "Quá hạn", count: counts.overdue },
        ...(!isLecturer ? [{ key: "returned", label: "Đã trả", count: counts.returned }] : []),
      ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = isLecturer ? {
        equipmentId: formData.equipmentId,
        borrowDate: formData.borrowDate,
        returnDate: formData.returnDate,
        notes: formData.notes,
      } : formData;

      await create(payload);
      setShowModal(false);
      setFormData({ equipmentId: "", borrower: "", borrowDate: "", returnDate: "", notes: "" });
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
          <h1>{isHistoryView ? "Lịch sử mượn" : isLecturer ? "Phiếu mượn" : "Quản lý Mượn - Trả"}</h1>
          <p className="text-sm text-muted-foreground">
            {isHistoryView
              ? "Theo dõi các phiếu mượn đã hoàn tất hoặc bị từ chối"
              : isLecturer
                ? "Theo dõi các phiếu mượn do bạn tạo"
                : "Theo dõi và duyệt yêu cầu mượn thiết bị"}
          </p>
        </div>
        {!isHistoryView && (
          <div className="flex gap-2">
            {!isLecturer && (
              <button className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-sm hover:bg-accent">
                <QrCode className="w-4 h-4" /> Quét QR bàn giao
              </button>
            )}
            <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90">
              <Plus className="w-4 h-4" /> Tạo phiếu mượn
            </button>
          </div>
        )}
      </div>

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

      <div className="relative max-w-sm">
        {isHistoryView ? (
          <History className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        ) : (
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        )}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={isLecturer ? "Tìm phiếu mượn của bạn..." : "Tìm thiết bị hoặc người mượn..."}
          className="w-full pl-9 pr-3 py-2 bg-input-background rounded-lg text-sm border border-border"
        />
      </div>

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
              {!isLecturer && !isHistoryView && <th className="px-4 py-3 text-right">Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {borrowRequests.map((br) => (
              <tr key={br._id} className="border-b border-border/50 hover:bg-muted/20 last:border-0">
                <td className="px-4 py-3 text-muted-foreground">{br._id?.slice(-6).toUpperCase()}</td>
                <td className="px-4 py-3">
                  <div>{br.equipmentName?.length > 30 ? `${br.equipmentName.slice(0, 30)}…` : br.equipmentName}</div>
                  <div className="text-xs text-muted-foreground">{br.equipmentCode}</div>
                </td>
                <td className="px-4 py-3">{br.borrower}</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(br.borrowDate).toLocaleDateString("vi-VN")}</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(br.returnDate).toLocaleDateString("vi-VN")}</td>
                <td className="px-4 py-3"><StatusBadge status={br.status} /></td>
                {!isLecturer && !isHistoryView && (
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
                )}
              </tr>
            ))}
            {borrowRequests.length === 0 && (
              <tr><td colSpan={isLecturer || isHistoryView ? 6 : 7} className="px-4 py-8 text-center text-muted-foreground">Không có phiếu mượn nào</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {!isHistoryView && (
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
            {!isLecturer && (
              <div>
                <label className="text-sm text-muted-foreground">Người mượn</label>
                <input required value={formData.borrower} onChange={e => setFormData(p => ({ ...p, borrower: e.target.value }))} placeholder="Nhập tên người mượn / ID" className="mt-1 w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm" />
              </div>
            )}
            {isLecturer && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                Phiếu này sẽ được tạo dưới tên tài khoản hiện tại: <strong>{user?.name}</strong>
              </div>
            )}
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
      )}
    </div>
  );
}

export function BorrowPage() {
  return <BorrowPageContent mode="active" />;
}

export function BorrowHistoryPage() {
  return <BorrowPageContent mode="history" />;
}
