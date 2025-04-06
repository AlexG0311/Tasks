import PropTypes from "prop-types";
import { useState } from "react";
import PanelWorkSpace from "./PanelWorkSpace";

export default function Sidebar({
  user,
  isDropdownOpen,
  setIsDropdownOpen,
  selectedWorkspace,
  handleSelectWorkspace,
  setIsModalOpen,
  workspaces,
  setWorkspaces,
}) {
  const [isAddingWorkspace, setIsAddingWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");

  const handleAddWorkspaceSubmit = async () => {
    if (!newWorkspaceName.trim()) {
      alert("Por favor, ingresa un nombre válido para el espacio de trabajo.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/workspaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name: newWorkspaceName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear el espacio de trabajo.");
      }

      setWorkspaces((prevWorkspaces) => [
        ...prevWorkspaces,
        { id: data.workspace.id, name: data.workspace.name },
      ]);

      setNewWorkspaceName("");
      setIsAddingWorkspace(false);
    } catch (err) {
      console.error("Error al agregar espacio de trabajo:", err);
      alert(err.message);
    }
  };

  const handleHomeClick = () => {
    handleSelectWorkspace(null);
  };

  return (
    <aside className="w-75  border border-gray-600 mt-20 rounded-lg shadow-xl p-4 h-[calc(100vh-4rem)]">
      <div className="space-y-4">
        <button
          onClick={handleHomeClick}
          className="w-full bg-purple-800 text-white font-semibold py-2 rounded-lg hover:bg-purple-900 transition-colors cursor-pointer"
        >
          Home
        </button>

        {/* Ocultamos el selector de workspaces y el botón de agregar si el usuario es admin */}
        {user.role !== "Administrador" && (
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-purple-400 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  <span>{selectedWorkspace?.name || "Espacio de trabajo..."}</span>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {isDropdownOpen && (
                <div className="absolute w-full bg-gray-800 border border-gray-600 rounded-md shadow-lg mt-1 z-10">
                  {workspaces.map((workspace) => (
                    <button
                      key={workspace.id}
                      onClick={() => handleSelectWorkspace(workspace)}
                      className="w-full px-4 py-2 text-white hover:bg-gray-700 text-left transition-colors"
                    >
                      {workspace.name}
                    </button>
                  ))}
                  {isAddingWorkspace ? (
                    <div className="px-4 py-2">
                      <input
                        type="text"
                        value={newWorkspaceName}
                        onChange={(e) => setNewWorkspaceName(e.target.value)}
                        placeholder="Nuevo espacio de trabajo"
                        className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <div className="flex justify-end space-x-2 mt-2">
                        <button
                          onClick={handleAddWorkspaceSubmit}
                          className="px-2 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => setIsAddingWorkspace(false)}
                          className="px-2 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAddingWorkspace(true)}
                      className="w-full px-4 py-2 text-gray-200 hover:bg-gray-700 text-left transition-colors"
                    >
                      Agregar espacio de trabajo
                    </button>
                  )}
                </div>
              )}
            </div>
            <button
              className="w-9 h-9 bg-purple-800 text-white rounded-md hover:bg-purple-900 transition-colors flex items-center justify-center"
            >
              <span className="text-xl">+</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

Sidebar.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number,
    email: PropTypes.string,
    role: PropTypes.oneOf(["Administrador", "Empleado"]).isRequired,
  }).isRequired,
  isDropdownOpen: PropTypes.bool.isRequired,
  setIsDropdownOpen: PropTypes.func.isRequired,
  selectedWorkspace: PropTypes.object,
  handleSelectWorkspace: PropTypes.func.isRequired,
  setIsModalOpen: PropTypes.func.isRequired,
  workspaces: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    })
  ).isRequired,
  setWorkspaces: PropTypes.func.isRequired,
};