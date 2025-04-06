import { useState, useEffect } from "react";

export function GestionUsuarios({ handleGoHome }) { // Recibe handleGoHome como prop
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/user", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Error al obtener los usuarios");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !selectedRole) {
      setError("Todos los campos son obligatorios");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("El correo no es válido");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setError("");
    const userData = { firstName, lastName, email, password, role: selectedRole };

    try {
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al registrar el usuario.");
      }

      alert("Usuario registrado con éxito.");
      closeModal();
      fetchUsers();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEdit = () => {
    const selectedUser = users.find((user) => user.id === selectedUserId);
    if (!selectedUser) {
      alert("Por favor, selecciona un usuario para editar.");
      return;
    }
    setFirstName(selectedUser.firstName);
    setLastName(selectedUser.lastName);
    setEmail(selectedUser.email);
    setPassword(""); // Dejamos la contraseña vacía para no mostrarla
    setSelectedRole(selectedUser.role || "");
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!firstName || !lastName || !email || !selectedRole) {
      setError("Todos los campos son obligatorios (excepto contraseña si no se cambia)");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("El correo no es válido");
      return;
    }

    if (password && password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setError("");
    const userData = { firstName, lastName, email, role: selectedRole };
    if (password) userData.password = password;

    try {
      const response = await fetch(`http://localhost:5000/api/users/${selectedUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al actualizar el usuario.");
      }

      alert("Usuario actualizado con éxito.");
      closeModal();
      fetchUsers();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDelete = async () => {
    if (!selectedUserId) {
      alert("Por favor, selecciona un usuario para eliminar.");
      return;
    }

    if (window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${selectedUserId}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Error al eliminar el usuario.");
        }

        alert("Usuario eliminado con éxito.");
        setSelectedUserId(null);
        fetchUsers();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setSelectedUserId(null);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setSelectedRole("");
    setError("");
  };

  const handleCheckboxChange = (userId) => {
    setSelectedUserId(selectedUserId === userId ? null : userId);
  };

  return (
    <div className="h-full w-320 p-4 mt-6 bg-gray-900 text-white rounded-lg shadow-xl">
      <h1 className="text-2xl font-bold mb-6 text-purple-300">Gestión de Usuarios</h1>

      <div className="flex mb-6 space-x-3">
        {/* Botón Home agregado aquí */}
        <button
          onClick={handleGoHome}
          className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white px-5 py-2 rounded-full shadow-lg mt-1 hover:from-purple-800 hover:to-indigo-900 hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 12l2-2m0 0l7-7 7 7m-9 2v10h6V12h-6z"
            />
          </svg>
          <span className="relative font-semibold">Home</span>
        </button>

        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors shadow-lg"
          onClick={() => setIsModalOpen(true)}
        >
          Agregar Usuario
        </button>

        {/* Campo de búsqueda */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar"
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-700 text-white placeholder-gray-400"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <button
          className="bg-purple-600 text-white font-semibold py-2 px-4 rounded hover:bg-purple-700 transition-colors shadow-lg"
          onClick={handleEdit}
        >
          Editar
        </button>
        <button
          className="bg-red-600 text-white font-semibold py-2 px-4 rounded hover:bg-red-700 transition-colors shadow-lg"
          onClick={handleDelete}
        >
          Eliminar
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="w-full text-left bg-gray-800 rounded-lg overflow-hidden">
          <thead className="bg-gray-700 text-gray-200">
            <tr>
              <th className="p-3 w-12"></th>
              <th className="p-3">Nombres</th>
              <th className="p-3">Apellidos</th>
              <th className="p-3">Correo</th>
              <th className="p-3">Rol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-600">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-700 transition-colors">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedUserId === user.id}
                    onChange={() => handleCheckboxChange(user.id)}
                    className="rounded border-gray-500"
                  />
                </td>
                <td className="p-3">{user.firstName}</td>
                <td className="p-3">{user.lastName}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'Administrador' ? 'bg-purple-700 text-purple-100' : 'bg-blue-700 text-blue-100'}`}>
                    {user.role || "Sin rol"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-2xl w-96 border border-purple-500 border-opacity-30">
            <h2 className="text-xl font-bold mb-4 text-purple-300">{isEditing ? "Editar Usuario" : "Agregar Usuario"}</h2>
            {error && <p className="text-red-400 mb-4 p-2 bg-red-900 bg-opacity-40 rounded">{error}</p>}
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nombres"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Apellidos"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <input
                type="email"
                placeholder="Correo"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder={isEditing ? "Nueva contraseña (opcional)" : "Contraseña"}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <select
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white focus:border-purple-500 focus:outline-none"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="">Seleccionar Rol</option>
                <option value="Administrador">Administrador</option>
                <option value="Empleado">Empleado</option>
              </select>
            </div>

            <div className="flex justify-end mt-6 space-x-3">
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors shadow-lg"
                onClick={isEditing ? handleUpdate : handleRegister}
              >
                {isEditing ? "Actualizar" : "Agregar"} Usuario
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors shadow-lg"
                onClick={closeModal}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}