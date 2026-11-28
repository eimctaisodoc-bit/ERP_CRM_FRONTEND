import { Outlet } from "react-router-dom";
import { Asidebar } from "../component/aside.jsx";
import { useAuth } from "../component/hooks/useAuth.js";
import Navbar from "../component/navbar";
import React, { useState, useEffect, useRef } from "react";
import { CornerDownLeft } from "lucide-react";
import { Skeleton } from "../component/skeleton.jsx";
import { useOnlineUsersSocket } from "../component/hooks/usesocketListenerhook";
import { isRoleRoute } from "../component/hooks/routeStatus";
import { useLocation } from "react-router-dom";

const Dashboard = () => {

  const { isAuthLoading } = useAuth();
  const { isConnected } = useOnlineUsersSocket();
  const { pathname } = useLocation();
  const sessionUser = JSON.parse(sessionStorage.getItem("user") || "null");
  const isOnRoleRoute = isRoleRoute(pathname, sessionUser?.role);



  const [isOpen, setIsOpen] = useState(true);
  const asideRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isOpen &&
        window.innerWidth < 768 &&
        asideRef.current &&
        !asideRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="min-h-screen bg-white">

      <div>
        <div ref={asideRef}>
          <Asidebar
            isOpen={isOpen} setIsOpen={setIsOpen}
          />
          {/* <LoginStatus/> */}
        </div>
        <Navbar
          isOpen={isOpen}
          toggleSidebar={() => setIsOpen(!isOpen)}
          isOnline={isOnRoleRoute && isConnected}
        />
      </div>
      <main className={`mt-16 flex-1 ${isOpen ? "ml-67" : "ml-0 md:ml-20"} bg-white p-2`}>
        {
          isAuthLoading ? (
            <div className="space-y-8 p-4 sm:p-6" aria-busy="true" aria-label="Loading dashboard">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-3">
                  <Skeleton className="h-8 w-64 max-w-full rounded-lg" />
                  <Skeleton className="h-4 w-40 rounded-full" />
                </div>
                <Skeleton className="h-10 w-32 rounded-lg" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[0, 1, 2, 3].map((item) => (
                  <div key={item} className="space-y-4 rounded-xl border border-slate-100 p-5">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <Skeleton className="h-3 w-24 rounded-full" />
                    <Skeleton className="h-7 w-16 rounded-lg" />
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-slate-100 p-5">
                <Skeleton className="mb-6 h-6 w-48 rounded-lg" />
                <div className="space-y-4">
                  {[0, 1, 2, 3, 4].map((item) => (
                    <div key={item} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                      <Skeleton className="h-4 flex-1 rounded-full" />
                      <Skeleton className="hidden h-4 w-24 rounded-full sm:block" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : <Outlet />
        }

      </main>
    </div>
  );
};

export default Dashboard;
