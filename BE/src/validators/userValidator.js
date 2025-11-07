import Joi from "joi";

export const validateRegister = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required().min(3).max(50).messages({
      "string.base": "Nama harus string.",
      "string.empty": "Nama pengguna tidak boleh kosong",
      "string.min":
        "Nama pengguna harus memiliki setidaknya {#limit} karakter.",
      "string.max": "Nama pengguna tidak boleh melebihi {#limit} karakter",
      "any.required": "Nama Pengguna Harus Di Isi",
    }),
    email: Joi.string().email().required().messages({
      "string.base": "Email harus string.",
      "string.email": "Format email tidak valid.",
      "string.empty": "Email tidak boleh kosong.",
      "any.required": "Email wajib diisi.",
    }),
    password: Joi.string().min(8).required().messages({
      "string.base": "Password harus string.",
      "string.min": "Password harus memiliki setidaknya {#limit} karakter.",
      "string.empty": "Password tidak boleh kosong.",
      "any.required": "Password wajib diisi.",
    }),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    return res.status(400).json({ message: errorMessages });
  }
  next();
};

export const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "string.base": "Email harus string.",
      "string.email": "Format email tidak valid.",
      "string.empty": "Email tidak boleh kosong.",
      "any.required": "Email wajib diisi.",
    }),
    password: Joi.string().min(8).required().messages({
      "string.base": "Password harus string.",
      "string.min": "Password harus memiliki setidaknya {#limit} karakter.",
      "string.empty": "Password tidak boleh kosong.",
      "any.required": "Password wajib diisi.",
    }),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

export const validateUpdate = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required().min(3).max(50).messages({
      "string.base": "Nama harus string.",
      "string.empty": "Nama pengguna tidak boleh kosong",
      "string.min":
        "Nama pengguna harus memiliki setidaknya {#limit} karakter.",
      "string.max": "Nama pengguna tidak boleh melebihi {#limit} karakter",
      "any.required": "Nama Pengguna Harus Di Isi",
    }),
    email: Joi.string().email().required().messages({
      "string.base": "Email harus string.",
      "string.email": "Format email tidak valid.",
      "string.empty": "Email tidak boleh kosong.",
      "any.required": "Email wajib diisi.",
    }),
    password: Joi.string().min(8).required().messages({
      "string.base": "Password harus string.",
      "string.min": "Password harus memiliki setidaknya {#limit} karakter.",
      "string.empty": "Password tidak boleh kosong.",
      "any.required": "Password wajib diisi.",
    }),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    return res.status(400).json({ message: errorMessages });
  }
  next();
};
