import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, Outlet } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const publicPaths = ["/", "/login", "/register"];

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setIsLoggedIn(true);
    } else if (!publicPaths.includes(window.location.pathname.toLowerCase())) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/login", { replace: true });
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside
        className="d-flex flex-column p-3 sidebar bg-white shadow-sm"
        style={{
          width: expanded ? "250px" : "80px",
          transition: "width 0.3s",
          height: "100vh",
          position: "fixed",
          zIndex: 1000,
        }}
      >
        <button
          className="btn btn-sm align-self-end mb-4"
          onClick={() => setExpanded(!expanded)}
        >
          <i
            className={`bi ${
              expanded
                ? "bi-layout-sidebar-inset-reverse"
                : "bi-layout-sidebar-inset"
            }`}
          ></i>
        </button>

        <nav className="nav flex-column">
          <NavLink
            to="/schedule"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center gap-2 mb-2 ${
                isActive ? "fw-bold text-primary" : "text-dark"
              }`
            }
          >
            <i className="bi bi-calendar-check fs-5"></i>
            {expanded && <span>Schedule</span>}
          </NavLink>

          <NavLink
            to="/expenditure"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center gap-2 mb-2 ${
                isActive ? "fw-bold text-primary" : "text-dark"
              }`
            }
          >
            <i className="bi bi-wallet2 fs-5"></i>
            {expanded && <span>Expenditure</span>}
          </NavLink>

          <NavLink
            to="/debt"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center gap-2 mb-2 ${
                isActive ? "fw-bold text-primary" : "text-dark"
              }`
            }
          >
            <i className="bi-receipt fs-5"></i>
            {expanded && <span>Debt</span>}
          </NavLink>
        </nav>

        <div className="mt-auto mb-5 pb-4">
          <hr />
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="nav-link text-danger d-flex align-items-center gap-2 bg-transparent border-0 w-100 text-start"
              style={{ cursor: "pointer" }}
            >
              <i className="bi bi-box-arrow-right"></i>
              {expanded && <span>Logout</span>}
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div
        className="flex-grow-1 d-flex flex-column"
        style={{
          marginLeft: expanded ? "250px" : "80px",
          transition: "margin-left 0.3s",
        }}
      >
        <header className="d-flex justify-content-end align-items-center px-4 py-2 border-bottom bg-white shadow-sm">
          <span className="fw-bold text-primary">MySchedule</span>
        </header>

        <main
          className="flex-grow-1 p-4 bg-light"
          style={{ overflowY: "auto", minHeight: 0 }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Navbar;
