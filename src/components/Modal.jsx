import PropTypes from "prop-types";

const Modal = ({
  isOpen,
  setIsOpen,
  newTask,
  handleChangeTask,
  handleSaveTask,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Agregar Nueva Tarea</h2>
        <form className="space-y-4">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Título</label>
            <input
              type="text"
              name="title"
              value={newTask.title}
              onChange={handleChangeTask}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ingresa el título de la tarea"
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              name="description"
              value={newTask.description}
              onChange={handleChangeTask}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ingresa una descripción"
              rows="3"
            />
          </div>

          {/* Fecha de Vencimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha de Vencimiento</label>
            <input
              type="date"
              name="dueDate"
              value={newTask.dueDate}
              onChange={handleChangeTask}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Prioridad */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Prioridad</label>
            <select
              name="priority"
              value={newTask.priority}
              onChange={handleChangeTask}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
            </select>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Estado</label>
            <select
              name="status"
              value={newTask.status}
              onChange={handleChangeTask}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="Pendiente">Pendiente</option>
              <option value="En Progreso">En Progreso</option>
              <option value="Completada">Completada</option>
            </select>
          </div>

          {/* Responsable (Asignado a) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Responsable</label>
            <input
              type="email"
              name="assignedTo"
              value={newTask.assignedTo || ""}
              onChange={handleChangeTask}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ingresa el email del responsable"
              required
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveTask}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  newTask: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    dueDate: PropTypes.string,
    priority: PropTypes.string,
    status: PropTypes.string,
    assignedTo: PropTypes.string, // Añadido para el email del responsable
  }),
  handleChangeTask: PropTypes.func,
  handleSaveTask: PropTypes.func,
};

export default Modal;