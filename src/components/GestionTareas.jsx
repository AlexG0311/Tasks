import { useState, useEffect } from "react";
import CommentsPanel from "./CommentsPanel";

export function GestionTareas({ handleGoHome }) { // Recibe handleGoHome como prop
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "Media",
  });
  const [error, setError] = useState("");
  const [tareas, setTareas] = useState([]);

  useEffect(() => {
    fetchTareas();
  }, []);

  const fetchTareas = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/tasks", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Error al obtener las tareas");
      const data = await response.json();
      setTareas(data.tasks || []);
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleChangeTask = (e) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveTask = async () => {
    if (!newTask.title) {
      setError("El título es obligatorio");
      return;
    }

    const taskData = {
      title: newTask.title,
      description: newTask.description || null,
      dueDate: newTask.dueDate || null,
      priority: newTask.priority.toLowerCase(),
    };

    try {
      let url = "http://localhost:5000/api/admin/tasks";
      let method = "POST";

      if (isEditing && selectedTaskId) {
        url = `http://localhost:5000/api/admin/tasks/${selectedTaskId}`;
        method = "PUT";
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Error al ${isEditing ? "actualizar" : "registrar"} la tarea.`);
      }

      alert(`Tarea ${isEditing ? "actualizada" : "registrada"} con éxito.`);
      closeModal();
      fetchTareas();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditTask = () => {
    if (!selectedTaskId) {
      setError("Por favor, selecciona una tarea para editar.");
      return;
    }

    const taskToEdit = tareas.find((tarea) => tarea.id === selectedTaskId);
    if (!taskToEdit) {
      setError("Tarea no encontrada.");
      return;
    }

    setNewTask({
      title: taskToEdit.title,
      description: taskToEdit.description || "",
      dueDate: taskToEdit.dueDate ? taskToEdit.dueDate.split("T")[0] : "",
      priority: taskToEdit.priority.charAt(0).toUpperCase() + taskToEdit.priority.slice(1).toLowerCase(),
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDeleteTask = async () => {
    if (!selectedTaskId) {
      setError("Por favor, selecciona una tarea para eliminar.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/admin/tasks/${selectedTaskId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al eliminar la tarea.");
      }

      alert("Tarea eliminada con éxito.");
      setSelectedTaskId(null);
      setError("");
      fetchTareas();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleCheckboxChange = (taskId) => {
    setSelectedTaskId(selectedTaskId === taskId ? null : taskId);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setSelectedTaskId(null);
    setNewTask({ title: "", description: "", dueDate: "", priority: "Media" });
    setError("");
  };

  const handleEmailChange = (e) => {
    setEmailInput(e.target.value);
  };

  const handleAssign = async () => {
    if (!selectedTaskId) {
      setError("Por favor, selecciona una tarea para asignar un responsable.");
      setIsDropdownOpen(false);
      return;
    }

    if (!emailInput) {
      setError("Por favor, ingresa un correo válido.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/admin/tasks/${selectedTaskId}/assign`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ assignedTo: emailInput }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al asignar el responsable.");
      }

      alert("Responsable asignado con éxito.");
      setIsDropdownOpen(false);
      setEmailInput("");
      setError("");
      fetchTareas();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleCancel = () => {
    setIsDropdownOpen(false);
    setEmailInput("");
    setError("");
  };

  const handleOpenComments = (taskId) => {
    setSelectedTaskId(taskId);
    setIsCommentsOpen(true);
  };

  const handleCloseComments = () => {
    setIsCommentsOpen(false);
    setSelectedTaskId(null);
  };

  return (
    <div className="h-full w-320 p-7 bg-gray-900 text-white rounded-lg shadow-xl">
      <h1 className="text-2xl font-bold mb-6 text-purple-300">Gestión de Tareas</h1>

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
          onClick={() => {
            setIsEditing(false);
            setIsModalOpen(true);
          }}
        >
          Agregar Tarea
        </button>

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
          className="text-gray-700 font-semibold py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
          onClick={handleEditTask}
        >
          Editar
        </button>

        <button
          className="text-gray-700 font-semibold py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
          onClick={handleDeleteTask}
        >
          Eliminar
        </button>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="text-gray-700 font-semibold py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
            disabled={!selectedTaskId}
          >
            Asignar Responsable
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-md shadow-lg p-4 z-10 border border-purple-500 border-opacity-30">
              <label htmlFor="emailInput" className="text-sm ml-2 text-gray-300">
                Escribe el correo del responsable
              </label>
              <input
                type="email"
                id="emailInput"
                value={emailInput}
                onChange={handleEmailChange}
                className="ml-2 mt-1 border-b-2 text-white border-gray-600 bg-gray-700 focus:outline-none focus:border-purple-600 transition duration-200 p-2 w-60"
                placeholder="Correo del responsable"
              />
              <div className="flex justify-end space-x-2 mt-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="text-white hover:bg-gray-700 transition-colors mt-1 border border-gray-600 p-1 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAssign}
                  className="text-white hover:bg-purple-700 transition-colors mt-1 border border-purple-600 p-1 rounded-md"
                >
                  Asignar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="w-full text-left bg-gray-800 rounded-lg overflow-hidden">
          <thead className="bg-gray-700 text-gray-200">
            <tr>
              <th className="p-3 w-12"></th>
              <th className="p-3">Título</th>
              <th className="p-3">Descripción</th>
              <th className="p-3">Fecha de Vencimiento</th>
              <th className="p-3">Prioridad</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Responsable</th>
              <th className="p-3">Comentarios</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-600">
            {tareas.map((tarea) => (
              <tr key={tarea.id} className="hover:bg-gray-700 transition-colors">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedTaskId === tarea.id}
                    onChange={() => handleCheckboxChange(tarea.id)}
                    className="rounded border-gray-500"
                  />
                </td>
                <td className="p-3">{tarea.title}</td>
                <td className="p-3">{tarea.description}</td>
                <td className="p-3">
                  {tarea.dueDate ? new Date(tarea.dueDate).toLocaleDateString() : "-"}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      tarea.priority === "alta"
                        ? "bg-red-700 text-red-100"
                        : tarea.priority === "media"
                        ? "bg-yellow-700 text-yellow-100"
                        : "bg-green-700 text-green-100"
                    }`}
                  >
                    {tarea.priority}
                  </span>
                </td>
                <td className="p-3">{tarea.status || "Pendiente"}</td>
                <td className="p-3">
                  {tarea.assignedTo ? `${tarea.assignedFirstName} ${tarea.assignedLastName}` : "Sin asignar"}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => handleOpenComments(tarea.id)}
                    className="text-gray-400 hover:text-purple-300 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 10h8m-4-4v8m9-4a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full border border-purple-500 border-opacity-30">
            <h2 className="text-xl font-bold mb-4 text-purple-300">
              {isEditing ? "Editar Tarea" : "Agregar Nueva Tarea"}
            </h2>
            {error && (
              <p className="text-red-400 mb-4 p-2 bg-red-900 bg-opacity-40 rounded">{error}</p>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Título</label>
                <input
                  type="text"
                  name="title"
                  value={newTask.title}
                  onChange={handleChangeTask}
                  className="mt-1 p-2 w-full border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-700 text-white placeholder-gray-400"
                  placeholder="Ingresa el título de la tarea"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Descripción</label>
                <textarea
                  name="description"
                  value={newTask.description}
                  onChange={handleChangeTask}
                  className="mt-1 p-2 w-full border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-700 text-white placeholder-gray-400"
                  placeholder="Ingresa una descripción"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Fecha de Vencimiento</label>
                <input
                  type="date"
                  name="dueDate"
                  value={newTask.dueDate}
                  onChange={handleChangeTask}
                  className="mt-1 p-2 w-full border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-700 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Prioridad</label>
                <select
                  name="priority"
                  value={newTask.priority}
                  onChange={handleChangeTask}
                  className="mt-1 p-2 w-full border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-700 text-white"
                >
                  <option value="Baja">Baja</option>
                  <option value="Media">Media</option>
                  <option value="Alta">Alta</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveTask}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                {isEditing ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <CommentsPanel
        isOpen={isCommentsOpen}
        onClose={handleCloseComments}
        taskId={selectedTaskId}
      />
    </div>
  );
}