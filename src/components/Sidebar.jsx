import PropTypes from "prop-types";
import { useState } from "react";

export default function Sidebar({
  isDropdownOpen,
  setIsDropdownOpen,
  selectedWorkspace,
  handleSelectWorkspace,
  setIsModalOpen,
  workspaces,
  handleAddWorkspace,
}) {
  const [isAddingWorkspace, setIsAddingWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");

  const handleAddWorkspaceSubmit = () => {
    handleAddWorkspace(newWorkspaceName);
    setNewWorkspaceName("");
    setIsAddingWorkspace(false);
  };

  return (
    <aside className="w-75 bg-white mt-20 rounded-sm shadow-md p-4 h-[calc(100vh-4rem)] ">
      <div className="space-y-4">
        <button className="w-full bg-purple-500 text-white font-semibold py-2 rounded-lg hover:bg-purple-700 transition-colors cursor-pointer">
          Home
        </button>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-purple-600 mr-2"
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
                <span>{selectedWorkspace || "Espacio de trabajo..."}</span>
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
              <div className="absolute w-full bg-white border rounded-md shadow-lg mt-1 z-10">
                {workspaces.map((workspace, index) => (
                  <button
                    key={workspace} // Usar el nombre del workspace como clave única
                    onClick={() => handleSelectWorkspace(workspace)}
                    className="w-full px-4 py-2 text-gray-700 hover:bg-gray-100 text-left"
                  >
                    {workspace}
                  </button>
                ))}
                {/* Agregar espacio de trabajo */ }
                {isAddingWorkspace ? (  
                  <div className="px-4 py-2">
                    <input
                      type="text"
                      value={newWorkspaceName}
                      onChange={(e) => setNewWorkspaceName(e.target.value)}
                      placeholder="Nuevo espacio de trabajo"
                      className="w-full p-2 border rounded-md"
                    />
                    <div className="flex justify-end space-x-2 mt-2">
                      <button
                        onClick={handleAddWorkspaceSubmit}
                        className="px-2 py-1 bg-purple-600 text-white rounded-md"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setIsAddingWorkspace(false)}
                        className="px-1 py-1 bg-gray-300 rounded-md"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingWorkspace(true)}
                    className="w-full px-4 py-2 rounded text-gray-700 hover:bg-gray-100 text-left"
                  >
                    Agregar espacio de trabajo
                  </button>
                )}  
              </div>  
            )}
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-9 h-9 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
          >
            <span className="text-xl">+</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

Sidebar.propTypes = {
  isDropdownOpen: PropTypes.bool.isRequired,
  setIsDropdownOpen: PropTypes.func.isRequired,
  selectedWorkspace: PropTypes.string,
  handleSelectWorkspace: PropTypes.func.isRequired,
  setIsModalOpen: PropTypes.func.isRequired,
  workspaces: PropTypes.arrayOf(PropTypes.string).isRequired,
  handleAddWorkspace: PropTypes.func.isRequired,
};