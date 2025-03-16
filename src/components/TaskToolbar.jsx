import PropTypes from "prop-types";

const TaskToolbar = ({ setIsModalOpen }) => {
  const handleAddTask = () => {
    setIsModalOpen(true); // Abrir el modal al hacer clic en "Agregar tarea"
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
      <button
        className="text-gray-700 font-semibold py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
      >
        Filtrar
      </button>
    </div>
  );
};

TaskToolbar.propTypes = {
  setIsModalOpen: PropTypes.func.isRequired, // Añadimos la prop para abrir el modal
  onAddTask: PropTypes.func,
  onSearch: PropTypes.func,
  onFilter: PropTypes.func,
};

export default TaskToolbar; 