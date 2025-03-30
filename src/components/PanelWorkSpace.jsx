import { useState, useEffect } from "react";

export default function PanelWorkSpace() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editWorkspace, setEditWorkspace] = useState(null); // Para manejar el workspace que se está editando
  const [newName, setNewName] = useState(""); // Para el nuevo nombre del workspace

  // Obtener los espacios de trabajo al montar el componente
  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/workspaces", {
          method: "GET",
          credentials: "include", // Para enviar las cookies de autenticación
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

  // Manejar la eliminación de un workspace
  const handleDelete = async (workspaceId) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este espacio de trabajo?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/workspaces/${workspaceId}`, {
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

  // Abrir el modal de edición
  const handleEdit = (workspace) => {
    setEditWorkspace(workspace);
    setNewName(workspace.name);
  };

  // Manejar el envío del formulario de edición
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      alert("El nombre del espacio de trabajo no puede estar vacío");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/workspaces/${editWorkspace.id}`, {
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

  // Cerrar el modal de edición
  const handleCloseEdit = () => {
    setEditWorkspace(null);
    setNewName("");
  };

  return (
    <main className="flex-1 p-6">
      <div className="flex items-center justify-center h-full">
        <div className="w-282 bg-white mt-14 rounded-sm shadow-md p-0 h-[calc(100vh-4rem)]">
          <div className="bg-purple-600 p-1">
            <h1 className="font-bold font-[1000] mt-60 ml-25 text-[30px]">
              ESPACIO DE TRABAJO 💻
            </h1>
          </div>

          {/* Tabla de Espacios de Trabajo */}
          <div className="p-4">
            {loading ? (
              <p>Cargando espacios de trabajo...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : workspaces.length === 0 ? (
              <p>No hay espacios de trabajo disponibles.</p>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-00">
                    <th className=" p-2 text-left">Nombre</th>
                    <th className=" p-2 text-left"></th>
                  </tr>
                </thead>
                <tbody>
                  {workspaces.map((workspace) => (
                    <tr key={workspace.id} className="bg-gray-100 rounded-xl">
                      <td className=" p-2 ">{workspace.name}</td>
                      <td className=" p-2">
                        <button
                          onClick={() => handleEdit(workspace)}
                          className="border text-black px-2 py-1 rounded mr-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(workspace.id)}
                          className="border  text-black px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            <div className="fixed inset-0 bg-white-10 bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-lg font-bold mb-4">Editar Espacio de Trabajo</h2>
                <form onSubmit={handleEditSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Nombre</label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={handleCloseEdit}
                      className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
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