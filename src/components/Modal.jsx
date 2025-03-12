import PropTypes from "prop-types";

export default function Modal({
  isOpen,
  setIsOpen,
  newBoard,
  setNewBoard,
  handleAddBoard,
  selectedBoard,
  newTask,
  handleChangeTask,
  handleSaveTask,
  teamMembers,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        {selectedBoard ? (
          <>
            <h2 className="text-xl font-bold mb-4">Agregar Nueva Tarea</h2>
            <div className="space-y-4">
              <input
                type="text"
                name="title"
                value={newTask.title}
                onChange={handleChangeTask}
                placeholder="Título de la tarea"
                className="w-full p-2 border rounded-md"
              />
              <textarea
                name="description"
                value={newTask.description}
                onChange={handleChangeTask}
                placeholder="Descripción"
                className="w-full p-2 border rounded-md"
              />
              <input
                type="date"
                name="dueDate"
                value={newTask.dueDate}
                onChange={handleChangeTask}
                className="w-full p-2 border rounded-md"
              />
              <select
                name="priority"
                value={newTask.priority}
                onChange={handleChangeTask}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Selecciona prioridad</option>
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
              </select>
              <select
                name="assignedTo"
                value={newTask.assignedTo}
                onChange={handleChangeTask}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Asignar a...</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.name}>
                    {member.name}
                  </option>
                ))}
              </select>
              <select
                name="status"
                value={newTask.status}
                onChange={handleChangeTask}
                className="w-full p-2 border rounded-md"
              >
                <option value="Listo">Listo</option>
                <option value="En Proceso">En Proceso</option>
                <option value="Terminado">Terminado</option>
              </select>
            </div>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={() => {
                  setIsOpen(false);
                  // No usamos setSelectedBoard aquí, solo lo limpiamos en App.jsx
                }}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveTask}
                className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
              >
                Guardar
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4">Agregar Nuevo Tablero</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={newBoard}
                onChange={(e) => setNewBoard(e.target.value)}
                placeholder="Nombre del tablero"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddBoard}
                className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
              >
                Guardar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  newBoard: PropTypes.string.isRequired,
  setNewBoard: PropTypes.func.isRequired,
  handleAddBoard: PropTypes.func.isRequired,
  selectedBoard: PropTypes.number,
  newTask: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    dueDate: PropTypes.string,
    priority: PropTypes.string,
    assignedTo: PropTypes.string,
    status: PropTypes.string,
  }).isRequired,
  handleChangeTask: PropTypes.func.isRequired,
  handleSaveTask: PropTypes.func.isRequired,
  teamMembers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
};