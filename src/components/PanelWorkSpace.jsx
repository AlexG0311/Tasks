import { useState, useEffect } from "react";

export default function PanelWorkSpace() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editWorkspace, setEditWorkspace] = useState(null);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const response = await fetch("http://localhost:5000/workspaces", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Error al obtener los espacios de trabajo");
        }

        const data = await response.json();
        setWorkspaces(data.workspaces || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, []);

  const handleDelete = async (workspaceId) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este espacio de trabajo?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/workspaces/${workspaceId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el espacio de trabajo");
      }

      setWorkspaces(workspaces.filter((workspace) => workspace.id !== workspaceId));
      alert("Espacio de trabajo eliminado exitosamente");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (workspace) => {
    setEditWorkspace(workspace);
    setNewName(workspace.name);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      alert("El nombre del espacio de trabajo no puede estar vacío");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/workspaces/${editWorkspace.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el espacio de trabajo");
      }

      setWorkspaces(
        workspaces.map((workspace) =>
          workspace.id === editWorkspace.id ? { ...workspace, name: newName.trim() } : workspace
        )
      );
      setEditWorkspace(null);
      setNewName("");
      alert("Espacio de trabajo actualizado exitosamente");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCloseEdit = () => {
    setEditWorkspace(null);
    setNewName("");
  };

  return (
    <main className="flex-1 p-6 bg-transparent">
      <div className="flex items-center justify-center h-full">
        <div className="w-282 bg-transparent mt-14 rounded-lg shadow-xl p-0 h-[calc(100vh-4rem)] border border-gray-600">
          <div className="bg-purple-800 p-4">
            <h1 className="font-bold text-white text-3xl text-center">
              ESPACIO DE TRABAJO 💻
            </h1>
          </div>

          {/* Tabla de Espacios de Trabajo */}
          <div className="p-4">
            {loading ? (
              <p className="text-gray-400 text-center">Cargando espacios de trabajo...</p>
            ) : error ? (
              <p className="text-red-400 text-center">{error}</p>
            ) : workspaces.length === 0 ? (
              <p className="text-gray-400 text-center">No hay espacios de trabajo disponibles.</p>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-transparent  text-gray-200">
                    <th className="p-2 text-left border-b border-gray-600">Nombre</th>
                    <th className="p-2 text-left border-b border-gray-600"></th>
                  </tr>
                </thead>
                <tbody>
                  {workspaces.map((workspace) => (
                    <tr key={workspace.id} className="bg-transparent rounded-xl hover:bg-transparent transition-colors">
                      <td className="p-2 text-white">{workspace.name}</td>
                      <td className="p-2">
                        <button
                          onClick={() => handleEdit(workspace)}
                          className="bg-transparent text-white ml-200  px-2 py-1 rounded mr-2 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(workspace.id)}
                          className="bg-transparent text-white px-2 py-1 rounded hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Modal de Edición */}
          {editWorkspace && (
            <div className="fixed inset-0 bg-white-100 bg-opacity-70 flex items-center justify-center">
              <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-96 border border-gray-600">
                <h2 className="text-lg font-bold mb-4 text-purple-300">Editar Espacio de Trabajo</h2>
                <form onSubmit={handleEditSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-300">Nombre</label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full p-2 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-700 text-white placeholder-gray-400"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={handleCloseEdit}
                      className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}