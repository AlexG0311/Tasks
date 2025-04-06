import PropTypes from "prop-types";
import { useState } from "react";

const TaskToolbar = ({ setIsModalOpen, selectedTaskIds, onDelete, onEdit, onAssign, onSearch }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddTask = () => {
    setIsModalOpen(true);
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
      onEdit(selectedTaskIds[0]);
    } else if (selectedTaskIds.length > 1) {
      alert("Solo puedes editar una tarea a la vez.");
    } else {
      alert("Selecciona una tarea para editar.");
    }
  };

  const handleEmailChange = (e) => {
    setEmailInput(e.target.value);
  };

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (onSearch) {
      onSearch(term);
    }
  };

  const handleAssign = () => {
    if (!emailInput || !emailInput.trim()) {
      alert("Por favor, ingresa un correo válido.");
      return;
    }
    if (selectedTaskIds.length > 0 && onAssign) {
      selectedTaskIds.forEach((taskId) => {
        onAssign(taskId, emailInput);
      });
      setIsDropdownOpen(false);
      setEmailInput("");
    }
  };

  const handleCancel = () => {
    setIsDropdownOpen(false);
    setEmailInput("");
  };

  return (
    <div className="flex items-center space-x-4 p-2 bg-gray-900 border-b border-gray-600">
      {/* Botón "Agregar tarea" */}
      <button
        onClick={handleAddTask}
        className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors shadow-lg"
      >
        Agregar tarea
      </button>

      {/* Campo de búsqueda */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar"
          value={searchTerm}
          onChange={handleSearchChange}
          className="pl-10 pr-4 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-700 text-white placeholder-gray-400"
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
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

      {/* Botón "Editar" */}
      <button
        onClick={handleEdit}
        className={`font-semibold py-2 px-4 border border-gray-600 rounded-md transition-colors ${
          selectedTaskIds.length !== 1
            ? "bg-gray-700 text-gray-400 opacity-50 cursor-not-allowed"
            : "bg-gray-700 text-white hover:bg-gray-600"
        }`}
        disabled={selectedTaskIds.length !== 1}
      >
        Editar
      </button>

      {/* Botón "Eliminar" */}
      <button
        onClick={handleDelete}
        className={`font-semibold py-2 px-4 border border-gray-600 rounded-md transition-colors ${
          selectedTaskIds.length === 0
            ? "bg-gray-700 text-gray-400 opacity-50 cursor-not-allowed"
            : "bg-gray-700 text-white hover:bg-gray-600"
        }`}
        disabled={selectedTaskIds.length === 0}
      >
        Eliminar
      </button>

      {/* Botón "Asignar responsable" */}
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`font-semibold py-2 px-4 border border-gray-600 rounded-md transition-colors ${
            selectedTaskIds.length === 0
              ? "bg-gray-700 text-gray-400 opacity-50 cursor-not-allowed"
              : "bg-gray-700 text-white hover:bg-gray-600"
          }`}
          disabled={selectedTaskIds.length === 0}
        >
          Asignar Responsable
        </button>

        {/* Dropdown para ingresar el correo */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-md shadow-lg p-4 z-10 border border-gray-600">
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
  onAssign: PropTypes.func,
  onSearch: PropTypes.func,
};

export default TaskToolbar;