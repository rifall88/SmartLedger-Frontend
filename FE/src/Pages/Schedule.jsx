import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Schedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [newSchedule, setNewSchedule] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
  });

  const navigate = useNavigate();

  // ────────────── Axios Interceptor ──────────────
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.warn("Token expired / unauthorized");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          navigate("/s");
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

  // ────────────── Fetch Schedules ──────────────
  const fetchSchedules = async () => {
    setLoading(true);
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const res = await axios.get("http://localhost:3535/api/schedules", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("📦 Schedules API response:", res.data); // Debug log
      // Sesuaikan dengan struktur respons backend
      setSchedules(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    } catch (err) {
      console.error("💥 Fetch schedules error:", err);
      setError("Gagal memuat data jadwal");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // ────────────── CRUD Functions ──────────────
  const handleCreateSchedule = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      const res = await axios.post(
        "http://localhost:3535/api/schedules",
        newSchedule,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("📦 Create schedule response:", res.data); // Debug
      setNewSchedule({ title: "", description: "", date: "", time: "" });
      fetchSchedules();
    } catch (err) {
      console.error("💥 Create schedule error:", err);
      alert("Gagal membuat jadwal");
    }
  };

  const handleEditClick = (schedule) => {
    setEditingId(schedule.id);
    setEditData({
      title: schedule.title,
      description: schedule.description,
      date: schedule.date?.split("T")[0] || "",
      time: schedule.time,
    });
  };

  const handleUpdate = async (id) => {
    const token = localStorage.getItem("accessToken");
    try {
      const res = await axios.put(
        `http://localhost:3535/api/schedules/${id}`,
        editData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("📦 Update schedule response:", res.data); // Debug
      setEditingId(null);
      fetchSchedules();
    } catch (err) {
      console.error("💥 Update schedule error:", err);
      alert("Gagal memperbarui jadwal");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus jadwal ini?")) return;
    const token = localStorage.getItem("accessToken");
    try {
      const res = await axios.delete(
        `http://localhost:3535/api/schedules/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("📦 Delete schedule response:", res.data); // Debug
      fetchSchedules();
    } catch (err) {
      console.error("💥 Delete schedule error:", err);
      alert("Gagal menghapus jadwal");
    }
  };

  // ────────────── Pagination & Filter ──────────────
  const filteredSchedules = schedules
    .filter((item) => {
      const matchesSearch = item.title
        ? item.title.toLowerCase().includes(searchTerm.toLowerCase())
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

  const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSchedules = filteredSchedules.slice(
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

  return (
    <div className="container-fluid w-full">
      <div className="mx-auto" style={{ maxWidth: "95%" }}>
        <h3 className="mb-3 fw-bold">Daftar Jadwal</h3>
        {/* ────────────── Filter Search ────────────── */}
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
            placeholder="Cari judul..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "300px" }}
          />
        </div>
        {/* ────────────── Table ────────────── */}
        <div className="table-responsive">
          <table className="table align-middle table-hover w-100">
            <thead className="table-primary">
              <tr>
                <th>No.</th>
                <th>Judul</th>
                <th>Deskripsi</th>
                <th>Date</th>
                <th>Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSchedules.length > 0 ? (
                paginatedSchedules.map((item, index) => (
                  <tr key={item.id}>
                    <td>{startIndex + index + 1}</td>
                    <td>
                      {editingId === item.id ? (
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={editData.title}
                          onChange={(e) =>
                            setEditData({ ...editData, title: e.target.value })
                          }
                        />
                      ) : (
                        item.title
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
                        <input
                          type="time"
                          className="form-control form-control-sm"
                          value={editData.time}
                          onChange={(e) =>
                            setEditData({ ...editData, time: e.target.value })
                          }
                        />
                      ) : (
                        item.time
                      )}
                    </td>
                    <td>
                      {editingId === item.id ? (
                        <>
                          <button
                            className="btn btn-sm btn-success me-1"
                            onClick={() => handleUpdate(item.id)}
                          >
                            Save
                          </button>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
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
                  <td colSpan="6" className="text-center">
                    Tidak ada data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ────────────── Pagination ────────────── */}
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
                  <label className="form-label fw-semibold">Judul</label>
                  <input
                    type="text"
                    className="form-control shadow-sm"
                    value={newSchedule.title}
                    onChange={(e) =>
                      setNewSchedule({ ...newSchedule, title: e.target.value })
                    }
                    placeholder="Masukkan judul kegiatan..."
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Deskripsi</label>
                  <textarea
                    className="form-control shadow-sm"
                    rows="3"
                    value={newSchedule.description}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        description: e.target.value,
                      })
                    }
                    placeholder="Masukkan deskripsi singkat..."
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Tanggal</label>
                    <input
                      type="date"
                      className="form-control shadow-sm"
                      value={newSchedule.date}
                      onChange={(e) =>
                        setNewSchedule({ ...newSchedule, date: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Waktu</label>
                    <input
                      type="time"
                      className="form-control shadow-sm"
                      value={newSchedule.time}
                      onChange={(e) =>
                        setNewSchedule({ ...newSchedule, time: e.target.value })
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
                    handleCreateSchedule();
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

export default Schedule;
