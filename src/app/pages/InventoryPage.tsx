import { ClipboardCheck, Plus, QrCode, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import { useState } from "react";
import { useInventory } from "../hooks/useInventory";
import { FormModal } from "../components/FormModal";
import { Scanner } from '@yudiel/react-qr-scanner';

export function InventoryPage() {
  const { sessions, loading, create, checkItem } = useInventory();
  const [showModal, setShowModal] = useState(false);
  const [scanningSessionId, setScanningSessionId] = useState<string | null>(null);
  const [scanMessage, setScanMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    location: ''
  });

  const current = sessions.find(s => s.status === 'in-progress');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await create({
        name: formData.name,
        date: formData.date,
        location: formData.location,
        status: 'in-progress',
        totalItems: 0,
        checkedItems: 0,
        matchedItems: 0,
        mismatchedItems: 0,
        progress: 0,
      });
      setShowModal(false);
      setFormData({ name: '', date: '', location: '' });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScan = async (text: string) => {
    if (!scanningSessionId || scanMessage) return; // debounce using message duration
    try {
      await checkItem(scanningSessionId, text, true);
      setScanMessage('✅ Đã điểm danh thiết bị thành công');
      setTimeout(() => setScanMessage(''), 2500);
    } catch (err: any) {
      setScanMessage('❌ Lỗi: Khu vực không có thiết bị hoặc mã sai');
      setTimeout(() => setScanMessage(''), 3000);
    }
  };

  if (loading && !sessions.length) {
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
          <h1>Kiểm kê Định kỳ</h1>
          <p className="text-sm text-muted-foreground">Quản lý đợt kiểm kê thiết bị, hỗ trợ quét QR trên di động</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90">
          <Plus className="w-4 h-4" /> Tạo đợt kiểm kê
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <ClipboardCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Đợt kiểm kê hiện tại</p>
            <p className="text-sm font-medium">{current?.name || 'Chưa có'}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Đã kiểm tra</p>
            <p className="text-sm font-medium">{current ? `${current.checkedItems} / ${current.totalItems} (${current.progress}%)` : '—'}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Chênh lệch</p>
            <p className="text-sm font-medium">{current ? `${current.mismatchedItems} thiết bị` : '—'}</p>
          </div>
        </div>
      </div>

      {/* Mobile QR scan prompt */}
      <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
        <QrCode className="w-6 h-6 text-blue-600 shrink-0" />
        <div>
          <p className="text-sm font-medium text-blue-900">Quét QR Code trên thiết bị di động</p>
          <p className="text-xs text-blue-700 mt-0.5">Sử dụng điện thoại để quét mã QR trên thiết bị, dữ liệu sẽ tự động cập nhật vào đợt kiểm kê hiện tại.</p>
        </div>
      </div>

      {/* Sessions */}
      <div className="space-y-4">
        {sessions.map((s) => (
          <div key={s._id} className="bg-card border border-border rounded-xl p-4 hover:border-blue-200 transition-colors">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{s.name}</p>
                  <StatusBadge status={s.status} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{new Date(s.date).toLocaleDateString('vi-VN')} · {s.location}</p>
              </div>
              {s.status === "in-progress" && (
                <button onClick={() => setScanningSessionId(s._id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs hover:opacity-90 transition-opacity">
                  <QrCode className="w-3.5 h-3.5" /> Tiếp tục kiểm kê
                </button>
              )}
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>Tiến độ: {s.checkedItems}/{s.totalItems} thiết bị</span>
                <span className="font-medium">{s.progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${s.progress === 100 ? "bg-green-500" : "bg-blue-500"}`}
                  style={{ width: `${s.progress}%` }}
                />
              </div>
            </div>
            
            <div className="mt-3 flex gap-4 text-xs">
              <span className="text-muted-foreground">Khớp: <strong className="text-green-600 font-medium">{s.matchedItems}</strong></span>
              <span className="text-muted-foreground">Chênh lệch: <strong className="text-red-600 font-medium">{s.mismatchedItems}</strong></span>
            </div>
          </div>
        ))}
        {sessions.length === 0 && (
          <div className="text-center py-12 border border-dashed border-border rounded-xl">
            <ClipboardCheck className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-foreground font-medium">Chưa có đợt kiểm kê nào</p>
            <p className="text-xs text-muted-foreground mt-1">Tạo đợt kiểm kê mới để bắt đầu theo dõi tài sản</p>
          </div>
        )}
      </div>

      <FormModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        title="Tạo đợt kiểm kê mới"
        loading={isSubmitting}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Tên đợt kiểm kê</label>
            <input 
              required 
              value={formData.name} 
              onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} 
              placeholder="VD: Kiểm kê cuối năm 2024" 
              className="mt-1 w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Ngày bắt đầu</label>
            <input 
              required 
              type="date" 
              value={formData.date} 
              onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} 
              className="mt-1 w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Phạm vi / Địa điểm</label>
            <input 
              required 
              value={formData.location} 
              onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} 
              placeholder="VD: Kho thiết bị A, Toàn trường..." 
              className="mt-1 w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
            />
          </div>
        </div>
      </FormModal>

      {scanningSessionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="bg-card w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl relative border border-border">
            <div className="p-4 border-b border-border bg-muted/10">
              <h3 className="font-semibold text-center">Quét QR Kiểm kê</h3>
            </div>
            
            <div className="p-2 bg-black">
              <Scanner 
                onScan={(result) => {
                  if (result && result.length > 0) {
                     handleScan(result[0].rawValue);
                  }
                }}

                onError={(err) => console.log(err)}
              />
            </div>
            
            <div className="p-5 text-center min-h-[70px] flex items-center justify-center border-t border-border bg-card">
               {scanMessage ? (
                 <p className={`text-sm font-medium ${scanMessage.includes('Lỗi') ? 'text-red-500' : 'text-green-500'}`}>{scanMessage}</p>
               ) : (
                 <p className="text-sm text-muted-foreground">Đưa thiết bị quét lại gần QR Code để tự ghi nhận</p>
               )}
            </div>
            
            <div className="p-4 bg-muted/30 border-t border-border pb-6">
              <button 
                onClick={() => setScanningSessionId(null)} 
                className="w-full px-4 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-accent transition-colors"
               >
                Đóng máy quét
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
