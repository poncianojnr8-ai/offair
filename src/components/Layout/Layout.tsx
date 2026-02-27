import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navigation/Navbar";
import Footer from "./Navigation/Footer";

interface LayoutProps {
  children?: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Navbar />
      <main className="flex-grow w-full">
        {children ? children : <Outlet />}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
