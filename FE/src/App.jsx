import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./Components/Navbar/Navbar";
import ProtectedRoute from "./Components/ProtectedRoute";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import About from "./Pages/About";
import Schedule from "./Pages/Schedule";
import Expenditure from "./Pages/Expenditure";
import Dept from "./Pages/Dept";

function App() {
  return (
    <Routes>
      {/* Halaman publik */}
      <Route path="/" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Halaman privat dengan Navbar */}
      <Route
        element={
          <ProtectedRoute>
            <Navbar />
          </ProtectedRoute>
        }
      >
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/expenditure" element={<Expenditure />} />
        <Route path="/debt" element={<Dept />} />
        {/* nanti bisa tambah halaman privat lain */}
      </Route>

      {/* Redirect jika route tidak dikenal */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
