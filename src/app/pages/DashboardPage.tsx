import { Package, CheckCircle, AlertTriangle, Clock, DollarSign, ArrowLeftRight, XCircle, Wrench, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { StatCard } from "../components/StatCard";
import { StatusBadge } from "../components/StatusBadge";
import { useStats } from "../hooks/useStats";
import { useBorrows } from "../hooks/useBorrows";
import { useEquipment } from "../hooks/useEquipment";

export function DashboardPage() {
  const { overview, monthly, categories, loading: statsLoading } = useStats();
  const { data: borrowRequests, loading: borrowsLoading } = useBorrows();
  const { data: equipmentData, loading: equipLoading } = useEquipment();

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(v);

  if (statsLoading || borrowsLoading || equipLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = overview || { totalEquipment: 0, available: 0, inUse: 0, pendingBorrows: 0, overdueReturns: 0, maintenance: 0, disposed: 0, totalValue: 0 };
  const monthlyStats = monthly.length > 0 ? monthly : [];

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div>
        <h1>Dashboard</h1>
        <p className="text-sm text-muted-foreground">Tổng quan hệ thống quản lý thiết bị trường học</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Tổng thiết bị" value={stats.totalEquipment} icon={Package} color="bg-blue-100 text-blue-600" subtitle={`${stats.available} sẵn sàng`} />
        <StatCard title="Đang sử dụng" value={stats.inUse} icon={CheckCircle} color="bg-green-100 text-green-600" subtitle={stats.totalEquipment > 0 ? `${((stats.inUse / stats.totalEquipment) * 100).toFixed(0)}% tổng TB` : '0%'} />
        <StatCard title="Chờ duyệt mượn" value={stats.pendingBorrows} icon={Clock} color="bg-yellow-100 text-yellow-600" subtitle="Yêu cầu mới" />
        <StatCard title="Quá hạn trả" value={stats.overdueReturns} icon={AlertTriangle} color="bg-red-100 text-red-600" subtitle="Cần xử lý" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Đang bảo trì" value={stats.maintenance} icon={Wrench} color="bg-amber-100 text-amber-600" />
        <StatCard title="Đã thanh lý" value={stats.disposed} icon={XCircle} color="bg-gray-100 text-gray-600" />
        <StatCard title="Tổng giá trị" value={formatCurrency(stats.totalValue)} icon={DollarSign} color="bg-purple-100 text-purple-600" />
        <StatCard title="Lượt mượn tháng" value={monthlyStats.length > 0 ? monthlyStats[monthlyStats.length - 1].borrowed : 0} icon={ArrowLeftRight} color="bg-cyan-100 text-cyan-600" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-4">
          <h3 className="mb-4">Thống kê mượn/trả theo tháng</h3>
          {monthlyStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyStats}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="borrowed" name="Mượn" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="returned" name="Trả" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="maintenance" name="Bảo trì" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">Chưa có dữ liệu</div>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="mb-4">Phân bố theo loại</h3>
          {categories.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={categories} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={80} label={false}>
                  {categories.map((entry, index) => (
                    <Cell key={`cat-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">Chưa có dữ liệu</div>
          )}
        </div>
      </div>

      {/* Recent Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Borrow Requests */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="mb-3">Yêu cầu mượn gần đây</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="pb-2 pr-3">Thiết bị</th>
                  <th className="pb-2 pr-3">Người mượn</th>
                  <th className="pb-2 pr-3">Ngày trả</th>
                  <th className="pb-2">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {borrowRequests.slice(0, 4).map((br) => (
                  <tr key={br._id} className="border-b border-border/50 last:border-0">
                    <td className="py-2 pr-3">{br.equipmentName?.length > 25 ? br.equipmentName.slice(0, 25) + "…" : br.equipmentName}</td>
                    <td className="py-2 pr-3">{br.borrower}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{br.returnDate ? new Date(br.returnDate).toLocaleDateString('vi-VN') : ''}</td>
                    <td className="py-2"><StatusBadge status={br.status} /></td>
                  </tr>
                ))}
                {borrowRequests.length === 0 && (
                  <tr><td colSpan={4} className="py-4 text-center text-muted-foreground text-sm">Chưa có dữ liệu</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Equipment */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="mb-3">Thiết bị mới cập nhật</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="pb-2 pr-3">Mã</th>
                  <th className="pb-2 pr-3">Tên thiết bị</th>
                  <th className="pb-2 pr-3">Vị trí</th>
                  <th className="pb-2">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {equipmentData.slice(0, 5).map((eq) => (
                  <tr key={eq._id} className="border-b border-border/50 last:border-0">
                    <td className="py-2 pr-3 text-muted-foreground">{eq.code}</td>
                    <td className="py-2 pr-3">{eq.name?.length > 25 ? eq.name.slice(0, 25) + "…" : eq.name}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{eq.location?.name || ''}</td>
                    <td className="py-2"><StatusBadge status={eq.status} /></td>
                  </tr>
                ))}
                {equipmentData.length === 0 && (
                  <tr><td colSpan={4} className="py-4 text-center text-muted-foreground text-sm">Chưa có dữ liệu</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}