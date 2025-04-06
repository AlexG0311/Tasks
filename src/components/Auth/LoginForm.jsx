import { useState } from "react";
import PropTypes from "prop-types";
import './style.css'; // Asegúrate de importar el archivo CSS

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
      setError("Email y contraseña son obligatorios.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError("Email electrónico no válido.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
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
    <div className="min-h-screen w-full flex items-center justify-center animated-purple-gradient">
      <div className="relative max-w-md w-full mx-4 p-8 bg-black/40 rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-white text-center">
          Iniciar Sesión
        </h2>
        {error && (
          <p className="text-red-400 bg-red-900/30 p-3 rounded-md mb-4 text-center">
            {error}
          </p>
        )}
        {success && (
          <p className="text-green-400 bg-green-900/30 p-3 rounded-md mb-4 text-center">
            {success}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <label className="block text-sm font-medium text-white mb-1">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 pl-10 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                placeholder="Ingresa tu email"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                />
              </svg>
            </div>
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-white mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 pl-10 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                placeholder="Ingresa tu contraseña"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 11c0-1.104-.896-2-2-2s-2 .896-2 2c0 .738.402 1.376 1 1.723V15a1 1 0 001 1h2a1 1 0 001-1v-2.277c.598-.347 1-.985 1-1.723zm9-2v6a3 3 0 01-3 3H6a3 3 0 01-3-3V9a3 3 0 013-3h1V5a5 5 0 0110 0v1h1a3 3 0 013 3z"
                />
              </svg>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 text-white font-semibold py-3 rounded-md hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
          >
            Iniciar Sesión
          </button>
         
        </form>
      </div>
    </div>
  );
};

LoginForm.propTypes = {
  onLoginSuccess: PropTypes.func,
  onToggleRegister: PropTypes.func,
};

export default LoginForm;