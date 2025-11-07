import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Debt = () => {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [newDebt, setNewDebt] = useState({
    creditor_name: "",
    debtor_name: "",
    amount: "",
    borrowed_date: "",
    description: "",
    status: "",
    paid_date: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    creditor_name: "",
    debtor_name: "",
    amount: "",
    borrowed_date: "",
    description: "",
    status: "",
    paid_date: "",
  });

  const navigate = useNavigate();
  const API_URL = "http://192.168.200.179:3535/api/debts";

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

  // ────────────── Fetch Debts ──────────────
  const fetchDebts = async () => {
    setLoading(true);
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      // console.log(`📦 Fetching debts for userId: ${user.id}`);
      const res = await axios.get("http://192.168.200.179:3535/api/debts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("📦 Debts API response:", res.data);
      setDebts(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    } catch (err) {
      console.error("💥 Fetch debts error:", err);
      setError("Gagal memuat data pengeluaran");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebts();
  }, []);

  // ────────────── CREATE ──────────────
  const handleCreateDebt = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      const res = await axios.post(
        "http://192.168.200.179:3535/api/debts",
        newDebt,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("✅ Create debt response:", res.data);
      setNewDebt({
        creditor_name: "",
        debtor_name: "",
        amount: "",
        borrowed_date: "",
        description: "",
        status: "",
        paid_date: "",
      });
      fetchDebts();
    } catch (err) {
      console.error("💥 Create debt error:", err);
      alert("Gagal menambahkan pengeluaran");
    }
  };

  // ────────────── EDIT ──────────────
  const handleEditClick = (debt) => {
    setEditingId(debt.id);
    setEditData({
      creditor_name: debt.creditor_name,
      debtor_name: debt.debtor_name,
      amount: debt.amount,
      borrowed_date: debt.borrowed_date?.split("T")[0] || "",
      description: debt.description,
      status: debt.status,
      paid_date: debt.paid_date?.split("T")[0] || "",
    });
  };

  // ────────────── UPDATE ──────────────
  const handleUpdate = async (id) => {
    const token = localStorage.getItem("accessToken");
    try {
      const res = await axios.put(
        `http://192.168.200.179:3535/api/debts/${id}`,
        editData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("✅ Update debt response:", res.data);

      setEditingId(null);
      fetchDebts();
    } catch (err) {
      console.error("💥 Update debt error:", err);
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
      console.log("🗑️ Delete debt response:", res.data);
      fetchDebts();
    } catch (err) {
      console.error("💥 Delete Debt error:", err);
      alert("Gagal menghapus pengeluaran");
    }
  };

  // ────────────── Pagination & Filter ──────────────
  const filteredDebts = debts
    .filter((item) => {
      const matchesSearch = item.creditor_name
        ? item.creditor_name.toLowerCase().includes(searchTerm.toLowerCase())
        : false;
      if (!matchesSearch) return false;

      if (!item.borrowed_date) return true;

      const itemDate = new Date(item.borrowed_date);
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
    .sort((a, b) => new Date(a.borrowed_date) - new Date(b.borrowed_date));

  const totalPages = Math.ceil(filteredDebts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDebts = filteredDebts.slice(
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
                <th>Pemberi Hutang</th>
                <th>Penerima Hutang</th>
                <th>Jumlah</th>
                <th>Tanggal Hutang</th>
                <th>Deskripsi</th>
                <th>Status</th>
                <th>Tanggal Bayar</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDebts.length > 0 ? (
                paginatedDebts.map((item, index) => (
                  <tr key={item.id}>
                    <td>{startIndex + index + 1}</td>
                    <td>
                      {editingId === item.id ? (
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={editData.creditor_name}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              creditor_name: e.target.value,
                            })
                          }
                        />
                      ) : (
                        item.creditor_name
                      )}
                    </td>
                    <td>
                      {editingId === item.id ? (
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={editData.debtor_name}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              debtor_name: e.target.value,
                            })
                          }
                        />
                      ) : (
                        item.debtor_name
                      )}
                    </td>
                    <td>
                      {editingId === item.id ? (
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={editData.amount}
                          onChange={(e) =>
                            setEditData({ ...editData, amount: e.target.value })
                          }
                        />
                      ) : (
                        `Rp ${Number(item.amount).toLocaleString()}`
                      )}
                    </td>
                    <td>
                      {editingId === item.id ? (
                        <input
                          type="date"
                          className="form-control form-control-sm"
                          value={editData.borrowed_date}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              borrowed_date: e.target.value,
                            })
                          }
                        />
                      ) : (
                        new Date(item.borrowed_date).toLocaleDateString("id-ID")
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
                        <select
                          className="form-select form-select-sm"
                          value={editData.status}
                          onChange={(e) =>
                            setEditData({ ...editData, status: e.target.value })
                          }
                        >
                          <option value="Unpaid">Unpaid</option>
                          <option value="Installment">Installment</option>
                          <option value="Paid">Paid</option>
                        </select>
                      ) : (
                        <span
                          className={`badge ${
                            item.status === "Paid"
                              ? "bg-success"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {item.status}
                        </span>
                      )}
                    </td>
                    <td>
                      {editingId === item.id ? (
                        <input
                          type="date"
                          className="form-control form-control-sm"
                          value={editData.paid_date}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              paid_date: e.target.value,
                            })
                          }
                        />
                      ) : item.paid_date ? (
                        new Date(item.paid_date).toLocaleDateString("id-ID")
                      ) : (
                        "-"
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
                  <td colSpan="9" className="text-center text-muted py-3">
                    Tidak ada data hutang
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
                  <label className="form-label fw-semibold">
                    Pemberi Hutang
                  </label>
                  <input
                    type="text"
                    className="form-control shadow-sm"
                    value={newDebt.creditor_name}
                    onChange={(e) =>
                      setNewDebt({ ...newDebt, creditor_name: e.target.value })
                    }
                    placeholder="Masukkan nama pemberi hutang..."
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Penerima Hutang
                  </label>
                  <input
                    type="text"
                    className="form-control shadow-sm"
                    value={newDebt.debtor_name}
                    onChange={(e) =>
                      setNewDebt({ ...newDebt, debtor_name: e.target.value })
                    }
                    placeholder="Masukkan nama penerima hutang..."
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Jumlah</label>
                  <input
                    type="number"
                    className="form-control shadow-sm"
                    value={newDebt.amount}
                    onChange={(e) =>
                      setNewDebt({ ...newDebt, amount: e.target.value })
                    }
                    placeholder="Masukkan jumlah hutang..."
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Tanggal Hutang
                  </label>
                  <input
                    type="date"
                    className="form-control shadow-sm"
                    value={newDebt.borrowed_date}
                    onChange={(e) =>
                      setNewDebt({ ...newDebt, borrowed_date: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Deskripsi</label>
                  <textarea
                    className="form-control shadow-sm"
                    rows="3"
                    value={newDebt.description}
                    onChange={(e) =>
                      setNewDebt({ ...newDebt, description: e.target.value })
                    }
                    placeholder="Masukkan deskripsi..."
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Status</label>
                  <select
                    className="form-select shadow-sm"
                    value={newDebt.status}
                    onChange={(e) =>
                      setNewDebt({ ...newDebt, status: e.target.value })
                    }
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Installment">Installment</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Debt;
