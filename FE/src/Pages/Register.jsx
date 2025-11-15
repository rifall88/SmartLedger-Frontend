import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:3535/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      console.log("📦 Response data:", data);

      if (response.ok && data.status) {
        alert("Register Success");
        navigate("/login");
      } else {
        setError(data.message || "Terjadi kesalahan saat registrasi.");
      }
    } catch (err) {
      console.error("💥 Register error:", err);
      setError("Gagal menghubungi server. Silakan coba lagi.");
    }
  };

  return (
    <div className="min-h-screen d-flex flex-column px-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center p-4 pb-5">
        <h1 className="text-xl fw-bold">
          <span className="text-primary">My</span>
          <span className="text-dark">Schedule</span>
        </h1>
        <button
          className="fs-5 fw-bold text-decoration-none text-dark"
          style={{
            background: "transparent",
            border: "none",
            fontSize: "16px",
          }}
          onClick={() => navigate("/")}
        >
          Home
        </button>
      </div>

      {/* Register Box */}
      <div className="d-flex justify-content-center align-items-center flex-grow-1">
        <div
          className="card shadow p-5"
          style={{ width: "400px", borderRadius: "20px" }}
        >
          <form onSubmit={handleRegister}>
            <h2 className="text-primary fw-bold mb-3 text-center">Sign Up</h2>
            <p className="text-muted small mb-4 text-center">
              Buat akun untuk mengelola jadwal dan pengeluaranmu
            </p>

            {error && <p className="text-danger small mb-3">{error}</p>}

            <div className="mb-3">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Masukkan nama"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ borderRadius: "12px", height: "50px" }}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="Masukkan email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ borderRadius: "12px", height: "50px" }}
              />
            </div>

            <div className="mb-4">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Masukkan kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ borderRadius: "12px", height: "50px" }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 rounded-pill fw-bold"
            >
              Sign Up
            </button>

            <p className="text-center mt-4 mb-0">
              Sudah punya akun?{" "}
              <a href="/login" className="text-primary fw-bold no-underline">
                Sign In
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
