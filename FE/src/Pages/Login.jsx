import React, { useState, useEffect } from "react"; // tambahkan useEffect
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) navigate("/schedule");
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:3535/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("📦 Response data:", data);
      if (response.ok && data.status && data.data?.access_token) {
        const userData = data.data;
        localStorage.setItem("accessToken", userData.access_token);
        localStorage.setItem("user", JSON.stringify(userData));
        console.log("Navigating...");
        navigate("/schedule", { replace: true });
      } else {
        setError(data.message || "Email atau password salah.");
      }
    } catch (err) {
      console.error("💥 Login error:", err);
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
          className="fs-5 fw-bold text-decoration-none fw-bold text-dark"
          style={{
            background: "transparent",
            border: "none",
            fontSize: "16px",
            color: "#000",
          }}
          onClick={() => navigate("/")}
        >
          Home
        </button>
      </div>

      {/* Login Box */}
      <div className="d-flex justify-content-center align-items-center flex-grow-1">
        <div
          className="card shadow p-5"
          style={{
            width: "400px",
            borderRadius: "20px",
          }}
        >
          <form onSubmit={handleLogin}>
            <h2 className="text-primary fw-bold mb-3 text-center">Sign In</h2>
            <p className="text-muted small mb-4 text-center">
              Masuk untuk mengelola jadwal dan pengeluaranmu
            </p>

            {error && <p className="text-danger small mb-3">{error}</p>}

            {/* Email Input */}
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="Masukkan email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  borderRadius: "12px",
                  height: "50px",
                }}
              />
            </div>

            {/* Password Input */}
            <div className="mb-4">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Masukkan kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  borderRadius: "12px",
                  height: "50px",
                }}
              />
            </div>

            {/* Button Login */}
            <button
              type="submit"
              className="btn btn-primary w-100 py-2 rounded-pill fw-bold"
            >
              Sign In
            </button>

            <p className="text-center mt-4 mb-0">
              Belum punya akun?{" "}
              <a href="/register" className="text-primary fw-bold no-underline">
                Sign Up
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
