const statusConfig: Record<string, { label: string; className: string }> = {
  available: { label: "Sẵn sàng", className: "bg-emerald-100 text-emerald-700" },
  "in-use": { label: "Đang sử dụng", className: "bg-blue-100 text-blue-700" },
  maintenance: { label: "Bảo trì", className: "bg-amber-100 text-amber-700" },
  disposed: { label: "Thanh lý", className: "bg-red-100 text-red-700" },
  pending: { label: "Chờ duyệt", className: "bg-yellow-100 text-yellow-700" },
  approved: { label: "Đã duyệt", className: "bg-green-100 text-green-700" },
  returned: { label: "Đã trả", className: "bg-gray-100 text-gray-700" },
  overdue: { label: "Quá hạn", className: "bg-red-100 text-red-700" },
  scheduled: { label: "Đã lên lịch", className: "bg-blue-100 text-blue-700" },
  "in-progress": { label: "Đang thực hiện", className: "bg-amber-100 text-amber-700" },
  completed: { label: "Hoàn thành", className: "bg-green-100 text-green-700" },
  repair: { label: "Sửa chữa", className: "bg-orange-100 text-orange-700" },
  inspection: { label: "Kiểm tra", className: "bg-cyan-100 text-cyan-700" },
  calibration: { label: "Hiệu chuẩn", className: "bg-purple-100 text-purple-700" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { label: status, className: "bg-gray-100 text-gray-700" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${config.className}`}>
      {config.label}
    </span>
  );
}
