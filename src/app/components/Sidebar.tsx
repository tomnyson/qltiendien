import { NavLink } from "react-router";
import {
  LayoutDashboard, Package, ArrowLeftRight, Wrench, ClipboardCheck,
  BarChart3, Settings, FolderTree, ChevronDown, ChevronRight, GraduationCap
} from "lucide-react";
import { useState } from "react";

const navGroups = [
  {
    label: "Tổng quan",
    items: [
      { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    ],
  },
  {
    label: "Quản lý",
    items: [
      { to: "/equipment", icon: Package, label: "Thiết bị" },
      { to: "/categories", icon: FolderTree, label: "Danh mục" },
      { to: "/borrow", icon: ArrowLeftRight, label: "Mượn - Trả" },
      { to: "/maintenance", icon: Wrench, label: "Bảo trì & Thanh lý" },
      { to: "/inventory", icon: ClipboardCheck, label: "Kiểm kê" },
    ],
  },
  {
    label: "Báo cáo",
    items: [
      { to: "/reports", icon: BarChart3, label: "Thống kê" },
    ],
  },
  {
    label: "Hệ thống",
    items: [
      { to: "/settings", icon: Settings, label: "Cài đặt & Phân quyền" },
    ],
  },
];

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(navGroups.map((g) => [g.label, true]))
  );

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside
      className={`h-full bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <GraduationCap className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm text-sidebar-foreground truncate">QL Thiết Bị</p>
            <p className="text-xs text-muted-foreground truncate">Trường học</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-1">
            {!collapsed && (
              <button
                onClick={() => toggleGroup(group.label)}
                className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-muted-foreground uppercase tracking-wider hover:text-sidebar-foreground"
              >
                {group.label}
                {expandedGroups[group.label] ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </button>
            )}
            {(collapsed || expandedGroups[group.label]) &&
              group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    } ${collapsed ? "justify-center" : ""}`
                  }
                >
                  <item.icon className="w-4.5 h-4.5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
          </div>
        ))}
      </nav>

      {/* Toggle */}
      <button
        onClick={onToggle}
        className="p-3 border-t border-sidebar-border text-muted-foreground hover:text-sidebar-foreground text-xs"
      >
        {collapsed ? "»" : "« Thu gọn"}
      </button>
    </aside>
  );
}
