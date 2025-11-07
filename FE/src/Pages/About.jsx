import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="container py-2">
      {/* Navbar Tombol Home & Sign In (hanya muncul kalau belum login) */}
      <div className="d-flex justify-content-between align-items-center p-4 pb-5">
        <h1 className="text-xl fw-bold">
          <span className="text-primary">My</span>
          <span className="text-dark">Schedule</span>
        </h1>
        <button
          className="btn btn-primary fw-semibold"
          style={{
            backgroundColor: "#6c47ff",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            padding: "6px 18px",
          }}
          onClick={() => navigate("/login")}
        >
          Sign in
        </button>
      </div>

      {/* Section Judul & Deskripsi */}
      <div className="row align-items-center mb-4">
        <div className="col-md-6 text-center mb-2 mb-md-0">
          <img
            src="/icon/caracter.png"
            alt="Character"
            className="img-fluid"
            style={{ maxWidth: "80%" }}
          />
        </div>
        <div className="col-md-6">
          <p
            style={{
              textAlign: "justify",
              fontSize: "16px",
              color: "#333",
            }}
          >
            Website ini merupakan sistem pencatatan harian yang memudahkan
            pengguna mengelola jadwal kegiatan dan pengeluaran sehari-hari
            secara efisien. Semua jadwal dan transaksi tercatat secara otomatis,
            sehingga pengguna dapat memantau aktivitas dan pengeluaran mereka
            secara real-time. Fitur ini membantu perencanaan harian lebih rapi
            dan pengelolaan keuangan menjadi lebih mudah.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
