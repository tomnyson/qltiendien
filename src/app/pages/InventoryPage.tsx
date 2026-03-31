import { ClipboardCheck, Plus, QrCode, CheckCircle, AlertTriangle, Loader2, ImageUp, Keyboard, Camera } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import { useEffect, useRef, useState } from "react";
import { useInventory } from "../hooks/useInventory";
import { FormModal } from "../components/FormModal";

export function InventoryPage() {
  const { sessions, loading, create, checkItem } = useInventory();
  const [showModal, setShowModal] = useState(false);
  const [scanningSessionId, setScanningSessionId] = useState<string | null>(null);
  const [scanMessage, setScanMessage] = useState<string>("");
  const [lastScanValue, setLastScanValue] = useState<string>("");
  const [manualScanValue, setManualScanValue] = useState("");
  const [scannerError, setScannerError] = useState<string>("");
  const [isDecodingImage, setIsDecodingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const decodeBusyRef = useRef(false);
  const scanMessageRef = useRef("");
  const imageDecodeRef = useRef(false);
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    location: "",
  });

  const current = sessions.find((s) => s.status === "in-progress");

  useEffect(() => {
    scanMessageRef.current = scanMessage;
  }, [scanMessage]);

  useEffect(() => {
    imageDecodeRef.current = isDecodingImage;
  }, [isDecodingImage]);

  const formatScanError = (err: unknown) => {
    if (err instanceof Error && err.message) return err.message;
    return "Lỗi: chưa thể ghi nhận thiết bị từ QR";
  };

  const clearScanFeedback = (delayMs: number) => {
    window.setTimeout(() => setScanMessage(""), delayMs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await create({
        name: formData.name,
        date: formData.date,
        location: formData.location,
        status: "in-progress",
        totalItems: 0,
        checkedItems: 0,
        matchedItems: 0,
        mismatchedItems: 0,
        progress: 0,
      });
      setShowModal(false);
      setFormData({ name: "", date: "", location: "" });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const processScanValue = async (text: string) => {
    if (!scanningSessionId || scanMessageRef.current) return;

    const normalized = text.trim();
    if (!normalized) return;

    setLastScanValue(normalized);
    try {
      await checkItem(scanningSessionId, normalized, true);
      setScanMessage(`✅ Đã ghi nhận thiết bị từ mã: ${normalized}`);
      setManualScanValue("");
      clearScanFeedback(2500);
    } catch (err: unknown) {
      setScanMessage(`❌ ${formatScanError(err)}`);
      clearScanFeedback(3000);
    }
  };

  const handleManualSubmit = async () => {
    await processScanValue(manualScanValue);
  };

  const decodeQRCodeFromImage = async (input: Blob | ImageData) => {
    const { readBarcodes } = await import("zxing-wasm/reader");
    const results = await readBarcodes(input, {
      formats: ["QRCode"],
      maxNumberOfSymbols: 1,
      tryHarder: true,
    });
    return results[0]?.text?.trim() || "";
  };

  const handleDecodeImage = async (file: File) => {
    if (!scanningSessionId) return;

    setScannerError("");
    setIsDecodingImage(true);
    try {
      const decodedText = await decodeQRCodeFromImage(file);
      if (!decodedText) {
        throw new Error("Không tìm thấy QR hợp lệ trong ảnh đã chọn");
      }
      await processScanValue(decodedText);
    } catch (err: unknown) {
      setScanMessage(`❌ ${formatScanError(err)}`);
      clearScanFeedback(3000);
    } finally {
      setIsDecodingImage(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }
  };

  useEffect(() => {
    if (!scanningSessionId) return;

    let cancelled = false;
    let timerId: number | null = null;

    const stopStream = () => {
      if (timerId) {
        window.clearTimeout(timerId);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      decodeBusyRef.current = false;
    };

    const scanFrame = async () => {
      if (cancelled) return;

      timerId = window.setTimeout(scanFrame, 700);
      if (decodeBusyRef.current || scanMessageRef.current || imageDecodeRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
        return;
      }

      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      decodeBusyRef.current = true;
      try {
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const decodedText = await decodeQRCodeFromImage(imageData);
        if (decodedText) {
          setScannerError("");
          await processScanValue(decodedText);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setScannerError(formatScanError(err));
        }
      } finally {
        decodeBusyRef.current = false;
      }
    };

    const startCamera = async () => {
      setScannerError("");
      setIsStartingCamera(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        const video = videoRef.current;
        if (!video) return;

        video.srcObject = stream;
        await video.play();
        scanFrame();
      } catch (err: unknown) {
        if (!cancelled) {
          setScannerError(formatScanError(err));
        }
      } finally {
        if (!cancelled) {
          setIsStartingCamera(false);
        }
      }
    };

    void startCamera();

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [scanningSessionId]);

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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <ClipboardCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Đợt kiểm kê hiện tại</p>
            <p className="text-sm font-medium">{current?.name || "Chưa có"}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Đã kiểm tra</p>
            <p className="text-sm font-medium">{current ? `${current.checkedItems} / ${current.totalItems} (${current.progress}%)` : "—"}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Chênh lệch</p>
            <p className="text-sm font-medium">{current ? `${current.mismatchedItems} thiết bị` : "—"}</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
        <QrCode className="w-6 h-6 text-blue-600 shrink-0" />
        <div>
          <p className="text-sm font-medium text-blue-900">Quét QR Code trên thiết bị di động</p>
          <p className="text-xs text-blue-700 mt-0.5">Camera live và upload ảnh hiện dùng cùng một bộ giải mã để tránh lệch kết quả nhận diện.</p>
        </div>
      </div>

      <div className="space-y-4">
        {sessions.map((s) => (
          <div key={s._id} className="bg-card border border-border rounded-xl p-4 hover:border-blue-200 transition-colors">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{s.name}</p>
                  <StatusBadge status={s.status} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{new Date(s.date).toLocaleDateString("vi-VN")} · {s.location}</p>
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
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
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
              onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
              className="mt-1 w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Phạm vi / Địa điểm</label>
            <input
              required
              value={formData.location}
              onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
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
              <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-950">
                {isStartingCamera && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center text-white text-sm gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang khởi động camera...</span>
                  </div>
                )}
                {!scannerError ? (
                  <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center gap-3 text-center text-white px-6">
                    <Camera className="w-8 h-8 opacity-80" />
                    <p className="text-sm">Không mở được camera live.</p>
                    <p className="text-xs text-white/70">{scannerError}</p>
                  </div>
                )}
                <div className="pointer-events-none absolute inset-6 rounded-2xl border-2 border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.25)]" />
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="p-5 text-center min-h-[84px] flex items-center justify-center border-t border-border bg-card">
              {scanMessage ? (
                <p className={`text-sm font-medium ${scanMessage.includes("❌") ? "text-red-500" : "text-green-500"}`}>{scanMessage}</p>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Đưa QR vào giữa khung và giữ ổn định khoảng 1 giây</p>
                  <p className="text-xs text-muted-foreground">Nếu webcam khó bắt QR từ màn hình điện thoại, dùng ngay ảnh QR hoặc nhập mã bên dưới</p>
                  {lastScanValue && <p className="text-xs text-blue-600">Lần quét gần nhất: {lastScanValue}</p>}
                </div>
              )}
            </div>

            <div className="px-4 pb-4 space-y-3 border-t border-border bg-card">
              <div className="pt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isDecodingImage}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-border rounded-xl text-sm hover:bg-accent disabled:opacity-60"
                >
                  <ImageUp className="w-4 h-4" />
                  {isDecodingImage ? "Đang đọc ảnh..." : "Chọn ảnh QR"}
                </button>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      void handleDecodeImage(file);
                    }
                  }}
                />
              </div>

              <div className="rounded-xl border border-border p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Keyboard className="w-4 h-4" />
                  <span>Nhập mã thủ công nếu camera khó nhận QR trên màn hình điện thoại</span>
                </div>
                <div className="flex gap-2">
                  <input
                    value={manualScanValue}
                    onChange={(e) => setManualScanValue(e.target.value)}
                    placeholder="VD: tb:MC-001 hoặc 69cbd71cf36e50a7d3d3875f"
                    className="flex-1 px-3 py-2 bg-input-background border border-border rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => void handleManualSubmit()}
                    disabled={!manualScanValue.trim()}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm disabled:opacity-50"
                  >
                    Ghi nhận
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/30 border-t border-border pb-6">
              <button
                onClick={() => {
                  setScanningSessionId(null);
                  setScannerError("");
                  setScanMessage("");
                }}
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
