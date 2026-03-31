import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { EquipmentPage } from "./pages/EquipmentPage";
import { CategoriesPage } from "./pages/CategoriesPage";
import { BorrowPage } from "./pages/BorrowPage";
import { MaintenancePage } from "./pages/MaintenancePage";
import { InventoryPage } from "./pages/InventoryPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { LoginPage } from "./pages/LoginPage";
import { AuthGuard } from "./components/AuthGuard";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/",
    Component: () => (
      <AuthGuard>
        <Layout />
      </AuthGuard>
    ),
    children: [
      { index: true, Component: DashboardPage },
      { path: "equipment", Component: EquipmentPage },
      { path: "categories", Component: CategoriesPage },
      { path: "borrow", Component: BorrowPage },
      { path: "maintenance", Component: MaintenancePage },
      { path: "inventory", Component: InventoryPage },
      { path: "reports", Component: ReportsPage },
      { path: "settings", Component: SettingsPage },
    ],
  },
]);
