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
import { AuthGuard, HomeRedirect, RoleGuard } from "./components/AuthGuard";
import { BorrowHistoryPage } from "./pages/BorrowPage";

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
      { index: true, Component: HomeRedirect },
      {
        path: "equipment",
        Component: () => (
          <RoleGuard path="/equipment">
            <EquipmentPage />
          </RoleGuard>
        ),
      },
      {
        path: "categories",
        Component: () => (
          <RoleGuard path="/categories">
            <CategoriesPage />
          </RoleGuard>
        ),
      },
      {
        path: "borrow",
        Component: () => (
          <RoleGuard path="/borrow">
            <BorrowPage />
          </RoleGuard>
        ),
      },
      {
        path: "borrow/history",
        Component: () => (
          <RoleGuard path="/borrow/history">
            <BorrowHistoryPage />
          </RoleGuard>
        ),
      },
      {
        path: "maintenance",
        Component: () => (
          <RoleGuard path="/maintenance">
            <MaintenancePage />
          </RoleGuard>
        ),
      },
      {
        path: "inventory",
        Component: () => (
          <RoleGuard path="/inventory">
            <InventoryPage />
          </RoleGuard>
        ),
      },
      {
        path: "reports",
        Component: () => (
          <RoleGuard path="/reports">
            <ReportsPage />
          </RoleGuard>
        ),
      },
      {
        path: "settings",
        Component: () => (
          <RoleGuard path="/settings">
            <SettingsPage />
          </RoleGuard>
        ),
      },
      {
        path: "dashboard",
        Component: () => (
          <RoleGuard path="/dashboard">
            <DashboardPage />
          </RoleGuard>
        ),
      },
    ],
  },
]);
