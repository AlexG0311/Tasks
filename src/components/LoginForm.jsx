import { useState } from "react";
import PropTypes from "prop-types";
import './style.css'
const LoginForm = ({ onLoginSuccess, onToggleRegister }) => {
  const [formData, setFormData] = useState({
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

    if (!formData.email || !formData.password) {
      setError("email y contraseña son obligatorios.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError("email electrónico no válido.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Enviar cookies
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Credenciales incorrectas.");

      setSuccess(data.message);
      setFormData({ email: "", password: "" });
      if (onLoginSuccess) onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (

    <div className="max-w-md mx-auto p-6 bg-black rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-4 text-white">Iniciar Sesión</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 p-2 w-full border text-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Ingresa tu email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white text-regal-blue">
            Contraseña
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="mt-1 p-2 w-full border text-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Ingresa tu contraseña"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-purple-700 text-white font-semibold py-2 rounded-md hover:bg-purple-800 transition-colors"
        >
          Iniciar Sesión
        </button>
        <div className="text-center mt-2">
          <button
            onClick={() => onToggleRegister(true)}
            className="text-purple-600 hover:underline"
          >
            No tienes cuenta? Regístrate
          </button>
        </div>
      </form>
    </div>
    
  );
};

LoginForm.propTypes = {
  onLoginSuccess: PropTypes.func,
  onToggleRegister: PropTypes.func,
};

export default LoginForm;
