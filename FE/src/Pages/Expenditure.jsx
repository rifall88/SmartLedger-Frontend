import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Expenditure = () => {
  const [expenditures, setExpenditures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [newExpenditure, setNewExpenditure] = useState({
    item_name: "",
    description: "",
    harga: "",
    date: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    item_name: "",
    description: "",
    harga: "",
    date: "",
  });

  const navigate = useNavigate();
  const API_URL = "http://localhost:3535/api/expenditures";

  // ────────────── Axios Interceptor ──────────────
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.warn("⚠️ Token expired / unauthorized");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          navigate("/login");
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [navigate]);

  // ────────────── Cek login ──────────────
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  // ────────────── Fetch Expenditures ──────────────
  const fetchExpenditures = async () => {
    setLoading(true);
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      // console.log(`📦 Fetching expenditures for userId: ${user.id}`);
      const res = await axios.get("http://localhost:3535/api/expenditures", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("📦 Expenditures API response:", res.data);
      setExpenditures(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    } catch (err) {
      console.error("💥 Fetch expenditures error:", err);
      setError("Gagal memuat data pengeluaran");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenditures();
  }, []);

  // ────────────── CREATE ──────────────
  const handleCreateExpenditure = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      const res = await axios.post(
        "http://localhost:3535/api/expenditures",
        newExpenditure,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("✅ Create expenditure response:", res.data);
      setNewExpenditure({
        title: "",
        item_name: "",
        description: "",
        harga: "",
        date: "",
      });
      fetchExpenditures();
    } catch (err) {
      console.error("💥 Create expenditure error:", err);
      alert("Gagal menambahkan pengeluaran");
    }
  };

  // ────────────── EDIT ──────────────
  const handleEditClick = (expenditure) => {
    setEditingId(expenditure.id);
    setEditData({
      item_name: expenditure.item_name,
      description: expenditure.description,
      harga: expenditure.harga,
      date: expenditure.date?.split("T")[0] || "",
    });
  };

  // ────────────── UPDATE ──────────────
  const handleUpdate = async (id) => {
    const token = localStorage.getItem("accessToken");
    try {
      const res = await axios.put(
        `http://localhost:3535/api/expenditures/${id}`,
        editData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("✅ Update expenditure response:", res.data);

      setEditingId(null);
      fetchExpenditures();
    } catch (err) {
      console.error("💥 Update expenditure error:", err);
      alert("Gagal memperbarui pengeluaran");
    }
  };

  // ────────────── DELETE ──────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus pengeluaran ini?")) return;
    const token = localStorage.getItem("accessToken");
    const user = JSON.parse(localStorage.getItem("user"));

    try {
      const res = await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { user_id: user.id },
      });
      console.log("🗑️ Delete expenditure response:", res.data);
      fetchExpenditures();
    } catch (err) {
      console.error("💥 Delete expenditure error:", err);
      alert("Gagal menghapus pengeluaran");
    }
  };

  // ────────────── Pagination & Filter ──────────────
  const filteredExpenditures = expenditures
    .filter((item) => {
      const matchesSearch = item.item_name
        ? item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
        : false;
      if (!matchesSearch) return false;

      if (!item.date) return true;

      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);

      if (startDate) {
        const s = new Date(startDate);
        s.setHours(0, 0, 0, 0);
        if (itemDate < s) return false;
      }

      if (endDate) {
        const e = new Date(endDate);
        e.setHours(0, 0, 0, 0);
        if (itemDate > e) return false;
      }

      return true;
    })
    // 👉 Selalu urut tanggal naik (lama → baru)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const totalPages = Math.ceil(filteredExpenditures.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedExpenditures = filteredExpenditures.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const renderPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          className={`btn btn-sm me-1 ${
            i === currentPage ? "btn-outline-primary" : "btn-light"
          }`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  if (loading) return <p className="text-center mt-4">Memuat data...</p>;
  if (error)
    return (
      <div className="text-center text-danger mt-4">
        <p>{error}</p>
      </div>
    );

  // ────────────── UI ──────────────
  return (
    <div className="container-fluid w-full">
      <div className="mx-auto" style={{ maxWidth: "95%" }}>
        <h3 className="mb-3 fw-bold">Daftar Pengeluaran</h3>
        <div className="mb-3 d-flex justify-content-between align-items-center">
          {/* Kiri: filter tanggal dari–sampai + tombol tambah */}
          <div className="d-flex gap-2 align-items-center">
            <input
              type="date"
              className="form-control form-control-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ width: "160px" }}
            />
            <input
              type="date"
              className="form-control form-control-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ width: "160px" }}
            />
            <button
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              Tambah
            </button>
          </div>

          {/* Kanan: kolom pencarian */}
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Cari nama item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "300px" }}
          />
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table align-middle table-hover w-100">
            <thead className="table-primary">
              <tr>
                <th>No.</th>
                <th>Nama Item</th>
                <th>Deskripsi</th>
                <th>Harga</th>
                <th>Tanggal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedExpenditures.length > 0 ? (
                paginatedExpenditures.map((item, index) => (
                  <tr key={item.id}>
                    <td>{startIndex + index + 1}</td>
                    <td>
                      {editingId === item.id ? (
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={editData.item_name}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              item_name: e.target.value,
                            })
                          }
                        />
                      ) : (
                        item.item_name
                      )}
                    </td>
                    <td>
                      {editingId === item.id ? (
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={editData.description}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              description: e.target.value,
                            })
                          }
                        />
                      ) : (
                        item.description
                      )}
                    </td>
                    <td>
                      {editingId === item.id ? (
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={editData.harga}
                          onChange={(e) =>
                            setEditData({ ...editData, harga: e.target.value })
                          }
                        />
                      ) : (
                        `Rp ${Number(item.harga).toLocaleString()}`
                      )}
                    </td>
                    <td>
                      {editingId === item.id ? (
                        <input
                          type="date"
                          className="form-control form-control-sm"
                          value={editData.date}
                          onChange={(e) =>
                            setEditData({ ...editData, date: e.target.value })
                          }
                        />
                      ) : (
                        new Date(item.date).toLocaleDateString("id-ID")
                      )}
                    </td>
                    <td>
                      {editingId === item.id ? (
                        <>
                          <button
                            className="btn btn-sm btn-success me-1"
                            onClick={() => handleUpdate(item.id)}
                          >
                            Simpan
                          </button>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => setEditingId(null)}
                          >
                            Batal
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn btn-sm btn-outline-primary me-1"
                            onClick={() => handleEditClick(item)}
                          >
                            Update
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(item.id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-3">
                    Tidak ada data pengeluaran
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="d-flex justify-content-center mt-3">
          {renderPageNumbers()}
        </div>
      </div>
      {showModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content shadow-lg border-0"
              style={{ borderRadius: "16px" }}
            >
              <div
                className="modal-header border-0"
                style={{
                  background: "#ffffff",
                  color: "#212529",
                  borderTopLeftRadius: "16px",
                  borderTopRightRadius: "16px",
                  borderBottom: "1px solid #dee2e6",
                }}
              >
                <h5 className="modal-title fw-semibold">
                  <i className="bi bi-calendar-plus me-2 text-primary"></i>
                  Tambah Jadwal Baru
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Nama Item</label>
                  <input
                    type="text"
                    className="form-control shadow-sm"
                    value={newExpenditure.item_name}
                    onChange={(e) =>
                      setNewExpenditure({
                        ...newExpenditure,
                        item_name: e.target.value,
                      })
                    }
                    placeholder="Masukkan nama item..."
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Deskripsi</label>
                  <textarea
                    className="form-control shadow-sm"
                    rows="3"
                    value={newExpenditure.description}
                    onChange={(e) =>
                      setNewExpenditure({
                        ...newExpenditure,
                        description: e.target.value,
                      })
                    }
                    placeholder="Masukkan deskripsi singkat..."
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Harga</label>
                  <input
                    type="number"
                    className="form-control shadow-sm"
                    value={newExpenditure.harga || ""}
                    onChange={(e) =>
                      setNewExpenditure({
                        ...newExpenditure,
                        harga: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    placeholder="Masukkan harga..."
                    min="0"
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Tanggal</label>
                    <input
                      type="date"
                      className="form-control shadow-sm"
                      value={newExpenditure.date}
                      onChange={(e) =>
                        setNewExpenditure({
                          ...newExpenditure,
                          date: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0 d-flex justify-content-between p-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4"
                  onClick={() => setShowModal(false)}
                >
                  <i className="bi bi-x-circle me-1"></i>Batal
                </button>
                <button
                  type="button"
                  className="btn btn-primary px-4 fw-semibold"
                  onClick={() => {
                    handleCreateExpenditure();
                    setShowModal(false);
                  }}
                >
                  <i className="bi bi-check-circle me-1"></i>Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenditure;
