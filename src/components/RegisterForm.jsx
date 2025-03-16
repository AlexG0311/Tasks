import { useState } from "react";
import PropTypes from "prop-types";

const RegisterForm = ({ onRegisterSuccess, onToggleRegister }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password
    ) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError("email electrónico no válido.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Enviar cookies
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Error al registrar el usuario.");

      setSuccess(data.message);
      setFormData({ firstName: "", lastName: "", email: "", password: "" });
      if (onRegisterSuccess) onRegisterSuccess();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Registro de Usuario
      </h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nombres
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Ingresa tus nombres"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            lastName
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Ingresa tus lastName"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Ingresa tu email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Ingresa tu contraseña"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-purple-700 text-white font-semibold py-2 rounded-md hover:bg-purple-800 transition-colors"
        >
          Registrarse
        </button>
        <div className="text-center mt-2">
          <button
            onClick={() => onToggleRegister(false)}
            className="text-purple-600 hover:underline"
          >
            Ya tienes cuenta? Inicia sesión
          </button>
        </div>
      </form>
    </div>
  );
};

RegisterForm.propTypes = {
  onRegisterSuccess: PropTypes.func,
  onToggleRegister: PropTypes.func,
};

export default RegisterForm;
