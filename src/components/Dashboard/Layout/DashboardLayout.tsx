import { Outlet } from "react-router-dom";
import Sidebar from "../Navigation/Sidebar";

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      <Sidebar />
      <main className="flex-1 ml-64 p-10">
        <div className="w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
