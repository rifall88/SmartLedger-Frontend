// src/components/Profile.jsx
import React, { useEffect, useState } from "react";
import { Modal, Form, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [editData, setEditData] = useState({});
  const [photoFile, setPhotoFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const now = Date.now() / 1000;
          if (decoded.exp < now) {
            console.log("Token expired, logout otomatis.");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
            navigate("/login");
          }
        } catch {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          navigate("/login");
        }
      }
    };

    checkTokenExpiration();

    // 🔁 periksa ulang setiap 30 detik biar real-time
    const interval = setInterval(checkTokenExpiration, 30000);
    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          navigate("/login");
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      navigate("/login");
      return;
    }

    let parsedUser;
    try {
      parsedUser = JSON.parse(storedUser);
    } catch {
      navigate("/login");
      return;
    }

    const userId = parsedUser.id;
    if (!userId) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8082/api/user/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Ambil tanggal lahir tanpa T00:00:00Z
        const tanggalFormatted = res.data.tanggalLahir
          ? new Date(res.data.tanggalLahir).toISOString().split("T")[0]
          : "2000-01-01";

        setUserData(res.data);
        setEditData({
          ...res.data,
          tanggalLahir: tanggalFormatted,
          fotoProfil: res.data.fotoProfil || "/icon/MySchedule.png",
        });
      } catch {
        setUserData(null);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleEditClick = () => {
    setErrors({});
    setShowModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };

  const validateFields = () => {
    const newErrors = {};
    const requiredFields = [
      "nama",
      "username",
      "gender",
      "tanggalLahir",
      "nomorTelepon",
      "asalSekolah",
    ];

    requiredFields.forEach((field) => {
      if (!editData[field] || editData[field].trim() === "") {
        newErrors[field] = "Field ini wajib diisi!";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveChanges = async () => {
    if (!validateFields()) return;

    const token = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      alert("⚠️ Token/User tidak ditemukan, login ulang.");
      navigate("/login");
      return;
    }

    let parsedUser = JSON.parse(storedUser);
    const userId = parsedUser.id;

    try {
      let fotoBase64;
      if (photoFile) {
        fotoBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = () => reject("File tidak bisa dibaca.");
          reader.readAsDataURL(photoFile);
        });
      }

      // kirim tanggal lahir dalam ISO penuh ke backend
      const payload = {
        nama: editData.nama,
        username: editData.username,
        gender: editData.gender,
        nomorTelepon: editData.nomorTelepon,
        asalSekolah: editData.asalSekolah,
        tanggalLahir: new Date(editData.tanggalLahir).toISOString(),
        fotoBase64,
      };

      const res = await axios.put(
        `http://localhost:8082/api/user/${userId}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUserData(res.data);

      // Update editData agar tanggal tetap tampil YYYY-MM-DD
      localStorage.setItem("user", JSON.stringify(res.data));
      window.dispatchEvent(new Event("userUpdated"));
      const tanggalFormatted = res.data.tanggalLahir
        ? new Date(res.data.tanggalLahir).toISOString().split("T")[0]
        : "2000-01-01";

      setEditData({ ...res.data, tanggalLahir: tanggalFormatted });
      setShowModal(false);
      setPhotoFile(null);
    } catch (err) {
      console.error(err);
      alert("Gagal update profile, coba lagi.");
    }
  };

  if (!userData) return <p className="text-center mt-5">Loading profile...</p>;

  return (
    <div className="py-5">
      <div className="container d-flex justify-content-center">
        <Card
          className="p-4 shadow rounded-4"
          style={{ maxWidth: "500px", width: "100%" }}
        >
          <div className="d-flex flex-column align-items-center mb-4">
            <img
              src={userData.fotoProfil || "/icon/MySchedule.png"}
              alt="Profile"
              className="rounded-circle mb-3"
              style={{
                width: "100px",
                height: "100px",
                objectFit: "cover",
                border: "3px solid #fff",
              }}
            />
            <h5 className="fw-bold mb-0">
              {userData.nama || "Nama Tidak Diketahui"}
            </h5>
            <p className="text-muted">
              {userData.username || "Username Kosong"}
            </p>
          </div>

          <div className="mb-3">
            <h6 className="fw-bold text-secondary">Contact Info</h6>
            <p className="mb-1">
              <i className="bi bi-envelope me-2"></i>
              {userData.email || "Email Kosong"}
            </p>
            <p className="mb-1">
              <i className="bi bi-telephone me-2"></i>
              {userData.nomorTelepon || "No HP Kosong"}
            </p>
          </div>

          <div className="mb-2 d-flex justify-content-between align-items-center">
            <h6 className="fw-bold text-secondary mb-0">Personal Info</h6>
            <i
              className="bi bi-pencil-square text-primary"
              style={{ cursor: "pointer" }}
              onClick={handleEditClick}
            ></i>
          </div>
          <p className="mb-1">
            <span className="fw-medium">Gender:</span>{" "}
            {userData.gender || "Tidak Diketahui"}
          </p>
          <p className="mb-0">
            <span className="fw-medium">Date of Birth:</span>{" "}
            {userData.tanggalLahir
              ? new Date(userData.tanggalLahir).toISOString().split("T")[0]
              : "Tidak Diketahui"}
          </p>
          <p>
            <strong>Asal Sekolah:</strong> {userData.asalSekolah || "-"}
          </p>
        </Card>
      </div>

      {/* Modal Edit */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Body className="p-4">
          <div className="d-flex justify-content-end">
            <Button
              variant="link"
              className="text-dark fs-4 fw-bold text-decoration-none"
              onClick={() => setShowModal(false)}
            >
              &times;
            </Button>
          </div>

          <Form>
            {[
              "nama",
              "username",
              "gender",
              "tanggalLahir",
              "asalSekolah",
              "nomorTelepon",
            ].map((field) => (
              <Form.Group className="mb-3" key={field}>
                <Form.Label className="small">
                  {field === "nama"
                    ? "Name"
                    : field === "username"
                    ? "Username"
                    : field === "gender"
                    ? "Gender"
                    : field === "tanggalLahir"
                    ? "Date of Birth"
                    : field === "asalSekolah"
                    ? "Asal Sekolah"
                    : "Nomor Telepon"}
                </Form.Label>

                {field === "gender" ? (
                  <Form.Select
                    name={field}
                    value={editData[field] || ""}
                    onChange={handleEditChange}
                    className="rounded-pill"
                  >
                    <option value="">Pilih Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </Form.Select>
                ) : field === "tanggalLahir" ? (
                  <Form.Control
                    type="date"
                    name={field}
                    value={editData[field] || ""}
                    onChange={handleEditChange}
                    className="rounded-pill"
                  />
                ) : (
                  <Form.Control
                    type="text"
                    name={field}
                    value={editData[field] || ""}
                    onChange={handleEditChange}
                    className="rounded-pill"
                  />
                )}

                {errors[field] && (
                  <small className="text-danger">{errors[field]}</small>
                )}
              </Form.Group>
            ))}

            <Form.Group className="mb-3">
              <Form.Label className="small">Foto Profil</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="rounded-pill"
              />
            </Form.Group>

            <div className="d-grid">
              <Button
                variant="primary"
                onClick={handleSaveChanges}
                className="rounded-pill"
              >
                Save Changes
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Profile;
