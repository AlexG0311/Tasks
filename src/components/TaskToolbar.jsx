import PropTypes from "prop-types";
import { useState } from "react";

const TaskToolbar = ({ setIsModalOpen, selectedTaskIds, onDelete, onEdit, onAssign }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [emailInput, setEmailInput] = useState(""); // Estado para el correo ingresado

  const handleAddTask = () => {
    setIsModalOpen(true); // Abrir el modal al hacer clic en "Agregar tarea"
  };

  const handleDelete = () => {
    if (selectedTaskIds.length > 0 && onDelete) {
      onDelete(selectedTaskIds);
    } else {
      alert("Selecciona al menos una tarea para eliminar.");
    }
  };

  const handleEdit = () => {
    if (selectedTaskIds.length === 1 && onEdit) {
      onEdit(selectedTaskIds[0]); // Pasamos el ID de la tarea seleccionada para editar
    } else if (selectedTaskIds.length > 1) {
      alert("Solo puedes editar una tarea a la vez.");
    } else {
      alert("Selecciona una tarea para editar.");
    }
  };

  const handleEmailChange = (e) => {
    setEmailInput(e.target.value); // Actualizar el estado del correo
  };

  const handleAssign = () => {
    if (!emailInput || !emailInput.trim()) {
      alert("Por favor, ingresa un correo válido.");
      return;
    }
    if (selectedTaskIds.length > 0 && onAssign) {
      selectedTaskIds.forEach((taskId) => {
        onAssign(taskId, emailInput); // Llamar a onAssign para cada tarea seleccionada
      });
      setIsDropdownOpen(false); // Cerrar el dropdown
      setEmailInput(""); // Limpiar el input
    }
  };

  const handleCancel = () => {
    setIsDropdownOpen(false); // Cerrar el dropdown
    setEmailInput(""); // Limpiar el input
  };

  return (
    <div className="flex items-center space-x-4 p-2 bg-gray-50 border-b border-gray-200">
      {/* Botón "Agregar tarea" */}
      <button
        onClick={handleAddTask}
        className="bg-purple-700 text-white font-semibold py-2 px-4 rounded-md hover:bg-purple-800 transition-colors"
      >
        Agregar tarea
      </button>

      {/* Campo de búsqueda */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar"
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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

      {/* Botón "Filtrar" */}
      <button className="text-gray-700 font-semibold py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors">
        Filtrar
      </button>

      {/* Botón "Editar" */}
      <button
        onClick={handleEdit}
        className="text-gray-700 font-semibold py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
        disabled={selectedTaskIds.length !== 1}
      >
        Editar
      </button>

      {/* Botón "Eliminar" */}
      <button
        onClick={handleDelete}
        className="text-gray-700 font-semibold py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
        disabled={selectedTaskIds.length === 0}
      >
        Eliminar
      </button>

      {/* Botón "Asignar responsable" */}
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="text-gray-700 font-semibold py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
          disabled={selectedTaskIds.length === 0}
        >
          Asignar Responsable
        </button>

        {/* Dropdown para ingresar el correo */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-black rounded-md shadow-lg p-4 z-10">
            <label htmlFor="emailInput" className="text-sm ml-2 text-white">
              Escribe el correo del responsable
            </label>
            <input
              type="email"
              id="emailInput"
              value={emailInput}
              onChange={handleEmailChange}
              className="ml-2 mt-1 border-b-2 text-white border-gray-300 focus:outline-none focus:border-purple-600 transition duration-200 p-2 w-60"
              placeholder="Correo del responsable"
            />
            <div className="flex justify-end space-x-2 mt-3">
              <button
                type="button"
                onClick={handleCancel}
                className="text-white hover:bg-purple-700 transition-colors mt-1 border p-1 rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={handleAssign}
                className="text-white hover:bg-purple-800 transition-colors mt-1 border p-1 rounded-md"
              >
                Asignar Responsable
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

TaskToolbar.propTypes = {
  setIsModalOpen: PropTypes.func.isRequired,
  selectedTaskIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  onAssign: PropTypes.func, // Nueva prop para manejar la asignación
};

export default TaskToolbar;