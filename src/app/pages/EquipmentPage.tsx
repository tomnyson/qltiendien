import { useState } from "react";
import { Plus, Search, Download, QrCode, Eye, Pencil, Trash2, Loader2, X } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import { useEquipment } from "../hooks/useEquipment";
import { useCategories, useLocations, useSuppliers } from "../hooks/useCategories";
import { FormModal } from "../components/FormModal";
import { QRCodeCanvas } from "qrcode.react";
import * as XLSX from "xlsx";
import { useAuth } from "../context/AuthContext";

export function EquipmentPage() {
  const { user } = useAuth();
  const isLecturer = user?.role === "lecturer";
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [viewingData, setViewingData] = useState<any>(null);
  const [qrData, setQrData] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    category: "",
    location: "",
    supplier: "",
    value: "",
    purchaseDate: "",
  });

  const effectiveStatusFilter = isLecturer ? "available" : statusFilter;
  const { data: equipment, total, loading, create, update, remove } = useEquipment({ search, status: effectiveStatusFilter });
  const { data: categories } = useCategories(!isLecturer);
  const { data: locations } = useLocations(!isLecturer);
  const { data: suppliers } = useSuppliers(!isLecturer);

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(v) + "₫";

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ name: "", code: "", category: "", location: "", supplier: "", value: "", purchaseDate: "" });
    setShowModal(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingId(item._id);
    setFormData({
      name: item.name,
      code: item.code,
      category: item.category?._id || "",
      location: item.location?._id || "",
      supplier: item.supplier?._id || "",
      value: String(item.value || 0),
      purchaseDate: item.purchaseDate || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        value: Number(formData.value) || 0,
        purchaseDate: formData.purchaseDate || new Date().toISOString(),
      };

      if (editingId) {
        await update(editingId, payload);
      } else {
        await create(payload);
      }

      setShowModal(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc muốn xóa thiết bị này?")) {
      try {
        await remove(id);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleDownloadQR = () => {
    if (!qrData) return;
    const canvas = document.getElementById("qr-gen") as HTMLCanvasElement;
    if (!canvas) return;
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `QR-${qrData.code}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const qrPayload = qrData ? qrData.code : "";

  const handleExportExcel = () => {
    if (!equipment.length) return alert("Không có dữ liệu để xuất");

    const dataToExport = equipment.map((eq, index) => ({
      STT: index + 1,
      "Mã Thiết Bị": eq.code,
      "Tên Thiết Bị": eq.name,
      Loại: eq.category?.name || "",
      "Vị Trí": eq.location?.name || "",
      "Nhà Cung Cấp": eq.supplier?.name || "",
      "Giá Trị (VNĐ)": eq.value,
      "Trạng Thái":
        eq.status === "available"
          ? "Sẵn sàng"
          : eq.status === "in-use"
            ? "Đang sử dụng"
            : eq.status === "maintenance"
              ? "Bảo trì"
              : "Thanh lý",
      "Người Đang Mượn": eq.assignedTo || "",
      "Ngày Mua": eq.purchaseDate ? new Date(eq.purchaseDate).toLocaleDateString("vi-VN") : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachThietBi");
    XLSX.writeFile(workbook, `Danh_sach_thiet_bi_${new Date().getTime()}.xlsx`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 overflow-auto h-full relative">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1>{isLecturer ? "Thiết bị đang trống" : "Quản lý Thiết bị"}</h1>
          <p className="text-sm text-muted-foreground">
            {isLecturer ? "Danh sách thiết bị hiện có thể mượn" : "Hồ sơ và trạng thái toàn bộ thiết bị"}
          </p>
        </div>
        {!isLecturer && (
          <div className="flex gap-2">
            <button onClick={handleOpenCreate} className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90">
              <Plus className="w-4 h-4" /> Thêm thiết bị
            </button>
            <button onClick={handleExportExcel} className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-sm hover:bg-accent transition-colors">
              <Download className="w-4 h-4" /> Xuất Excel
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isLecturer ? "Tìm thiết bị đang trống..." : "Tìm theo tên hoặc mã..."}
            className="w-full pl-9 pr-3 py-2 bg-input-background rounded-lg text-sm border border-border"
          />
        </div>
        {isLecturer ? (
          <div className="px-3 py-2 rounded-lg border border-emerald-200 bg-emerald-50 text-sm text-emerald-700">
            Chỉ hiển thị trạng thái: Sẵn sàng
          </div>
        ) : (
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 bg-input-background border border-border rounded-lg text-sm">
            <option value="all">Tất cả trạng thái</option>
            <option value="available">Sẵn sàng</option>
            <option value="in-use">Đang sử dụng</option>
            <option value="maintenance">Bảo trì</option>
            <option value="disposed">Thanh lý</option>
          </select>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                <th className="px-4 py-3">Mã</th>
                <th className="px-4 py-3">Tên thiết bị</th>
                <th className="px-4 py-3">Loại</th>
                <th className="px-4 py-3">Vị trí</th>
                <th className="px-4 py-3">Giá trị</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">{isLecturer ? "Chi tiết" : "Thao tác"}</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map((eq) => (
                <tr key={eq._id} className="border-b border-border/50 hover:bg-muted/20 last:border-0">
                  <td className="px-4 py-3 text-muted-foreground">{eq.code}</td>
                  <td className="px-4 py-3">
                    <div>{eq.name}</div>
                    {eq.assignedTo && <div className="text-xs text-muted-foreground">→ {eq.assignedTo}</div>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{eq.category?.name || ""}</td>
                  <td className="px-4 py-3 text-muted-foreground">{eq.location?.name || ""}</td>
                  <td className="px-4 py-3">{formatCurrency(eq.value)}</td>
                  <td className="px-4 py-3"><StatusBadge status={eq.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {isLecturer ? (
                        <button onClick={() => setViewingData(eq)} className="p-1.5 rounded hover:bg-accent" title="Xem chi tiết">
                          <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      ) : (
                        <>
                          <button onClick={() => setQrData(eq)} className="p-1.5 rounded hover:bg-accent" title="QR Code">
                            <QrCode className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                          <button onClick={() => setViewingData(eq)} className="p-1.5 rounded hover:bg-accent" title="Xem">
                            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                          <button onClick={() => handleOpenEdit(eq)} className="p-1.5 rounded hover:bg-accent" title="Sửa">
                            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                          <button onClick={() => handleDelete(eq._id)} className="p-1.5 rounded hover:bg-accent" title="Xóa">
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {equipment.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Không có thiết bị nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
          Hiển thị {equipment.length} / {total} {isLecturer ? "thiết bị đang sẵn sàng" : "thiết bị"}
        </div>
      </div>

      {!isLecturer && (
        <FormModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
          title={editingId ? "Sửa thiết bị" : "Thêm thiết bị mới"}
          loading={isSubmitting}
        >
          <div className="space-y-3">
            <div>
              <label className="text-sm text-muted-foreground">Tên thiết bị</label>
              <input required value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Nhập tên thiết bị" className="mt-1 w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Mã thiết bị</label>
              <input required value={formData.code} onChange={e => setFormData(p => ({ ...p, code: e.target.value }))} placeholder="VD: MC-001" className="mt-1 w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Loại thiết bị</label>
              <select required value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))} className="mt-1 w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm">
                <option value="">Chọn loại</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Vị trí</label>
              <select required value={formData.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} className="mt-1 w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm">
                <option value="">Chọn vị trí</option>
                {locations.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Nhà cung cấp</label>
              <select required value={formData.supplier} onChange={e => setFormData(p => ({ ...p, supplier: e.target.value }))} className="mt-1 w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm">
                <option value="">Chọn NCC</option>
                {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Giá trị (VNĐ)</label>
              <input value={formData.value} onChange={e => setFormData(p => ({ ...p, value: e.target.value }))} type="number" placeholder="0" className="mt-1 w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm" />
            </div>
          </div>
        </FormModal>
      )}

      {viewingData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded-xl border border-border w-full max-w-md mx-4 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-semibold">{viewingData.name}</h2>
                <p className="text-sm text-muted-foreground">Mã: {viewingData.code}</p>
              </div>
              <button onClick={() => setViewingData(null)} className="p-1 rounded hover:bg-accent text-muted-foreground"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Loại:</span> <span>{viewingData.category?.name || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Vị trí:</span> <span>{viewingData.location?.name || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Nhà cung cấp:</span> <span>{viewingData.supplier?.name || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Trạng thái:</span> <StatusBadge status={viewingData.status} /></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Giá trị:</span> <span>{formatCurrency(viewingData.value)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Người mượn:</span> <span>{viewingData.assignedTo || "—"}</span></div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setViewingData(null)} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-accent">Đóng</button>
            </div>
          </div>
        </div>
      )}

      {!isLecturer && qrData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md mx-4 rounded-[2rem] bg-[linear-gradient(145deg,#0f172a_0%,#1d4ed8_48%,#0f172a_100%)] p-[1px] shadow-2xl">
            <div className="rounded-[calc(2rem-1px)] bg-white p-6 text-center">
              <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white">
                <QrCode className="w-3.5 h-3.5" />
                Ready To Scan
              </div>
              <h2 className="text-[1.9rem] font-semibold leading-tight text-slate-950">{qrData.name}</h2>
              <p className="mt-2 text-sm text-slate-500">Mã thiết bị: {qrData.code}</p>

              <div className="mx-auto mt-6 w-fit rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
                <div className="rounded-[1.5rem] bg-white p-3 ring-1 ring-slate-100">
                  <QRCodeCanvas
                    id="qr-gen"
                    value={qrPayload}
                    size={288}
                    level="L"
                    marginSize={4}
                    boostLevel={false}
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                    title={`QR ${qrData.code}`}
                  />
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <p className="text-sm font-medium text-slate-700">Mã quét nhanh: <span className="font-semibold text-slate-950">{qrPayload}</span></p>
                <p className="text-xs leading-5 text-slate-500">
                  QR dùng payload ngắn và vùng trắng chuẩn 4 ô để camera nhận nhanh hơn, tương tự cách nhiều app ngân hàng tối ưu mã thanh toán.
                </p>
              </div>

              <div className="mt-8 flex gap-3">
                <button onClick={() => setQrData(null)} className="flex-1 px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Đóng</button>
                <button onClick={handleDownloadQR} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-950 text-white rounded-2xl text-sm font-medium hover:opacity-90 transition-opacity">
                <Download className="w-4 h-4" /> Tải về
                </button>
              </div>
              <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-slate-400">Hold camera steady for 1 second</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
