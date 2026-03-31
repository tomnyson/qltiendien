import { FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";
import { useStats } from "../hooks/useStats";

const usageByLocation = [
  { location: "Tòa A", usage: 85 },
  { location: "Tòa B", usage: 72 },
  { location: "Thí nghiệm", usage: 95 },
  { location: "Kho chính", usage: 30 },
  { location: "Studio", usage: 60 },
];

const damageData = [
  { month: "T10", count: 3 },
  { month: "T11", count: 5 },
  { month: "T12", count: 2 },
  { month: "T1", count: 4 },
  { month: "T2", count: 6 },
  { month: "T3", count: 3 },
];

export function ReportsPage() {
  const { overview, monthly, categories, loading } = useStats();

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const stats = overview || { totalEquipment: 0, inUse: 0, maintenance: 0, overdueReturns: 0 };

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1>Báo cáo &amp; Thống kê</h1>
          <p className="text-sm text-muted-foreground">Phân tích dữ liệu thiết bị và hoạt động</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-sm hover:bg-accent"><FileSpreadsheet className="w-4 h-4" /> Xuất Excel</button>
          <button className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-sm hover:bg-accent"><FileText className="w-4 h-4" /> Xuất PDF</button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Tổng TB", value: stats.totalEquipment, color: "text-blue-600" },
          { label: "Tỷ lệ sử dụng", value: stats.totalEquipment > 0 ? `${((stats.inUse / stats.totalEquipment) * 100).toFixed(0)}%` : "0%", color: "text-green-600" },
          { label: "Đang bảo trì", value: stats.maintenance, color: "text-amber-600" },
          { label: "Quá hạn trả", value: stats.overdueReturns, color: "text-red-600" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-2xl mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="mb-4">Tỷ lệ sử dụng theo vị trí (%)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={usageByLocation} layout="vertical">
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
              <YAxis dataKey="location" type="category" tick={{ fontSize: 12 }} width={90} />
              <Tooltip />
              <Bar dataKey="usage" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="mb-4">Xu hướng hư hỏng</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={damageData}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" name="Số lượng" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="mb-4">Lượt mượn/trả theo tháng</h3>
          {monthly.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthly}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="borrowed" name="Mượn" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="returned" name="Trả" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">Chưa có dữ liệu</div>}
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="mb-4">Phân bố theo loại thiết bị</h3>
          {categories.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={categories} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label={false}>
                  {categories.map((entry, index) => <Cell key={`rpt-${index}`} fill={entry.color} />)}
                </Pie>
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">Chưa có dữ liệu</div>}
        </div>
      </div>
    </div>
  );
}