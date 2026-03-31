import { Bell, Search, User, QrCode, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const roleLabels: Record<string, string> = { admin: "Quản trị viên", warehouse: "Thủ kho", lecturer: "Giảng viên", director: "Ban Giám hiệu" };

export function Header() {
  const [showNotif, setShowNotif] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 gap-4">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm thiết bị, mã code, phòng..."
            className="w-full pl-9 pr-4 py-1.5 bg-input-background rounded-lg text-sm border border-border focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg hover:bg-accent text-muted-foreground" title="Quét QR Code">
          <QrCode className="w-4.5 h-4.5" />
        </button>
        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="p-2 rounded-lg hover:bg-accent text-muted-foreground relative"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </button>
          {showNotif && (
            <div className="absolute right-0 top-full mt-1 w-72 bg-card border border-border rounded-lg shadow-lg z-50 p-3">
              <p className="text-sm mb-2">Thông báo</p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="p-2 bg-accent/50 rounded">🔴 3 yêu cầu mượn chờ duyệt</div>
                <div className="p-2 bg-accent/50 rounded">⚠️ Camera Logitech Rally quá hạn trả</div>
                <div className="p-2 bg-accent/50 rounded">🔧 Máy in HP đang bảo trì</div>
              </div>
            </div>
          )}
        </div>
        <div className="w-px h-6 bg-border" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <User className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm">{user?.name || 'Người dùng'}</p>
            <p className="text-xs text-muted-foreground">{roleLabels[user?.role || ''] || user?.role}</p>
          </div>
          <button onClick={logout} className="p-2 rounded-lg hover:bg-accent text-muted-foreground" title="Đăng xuất">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
