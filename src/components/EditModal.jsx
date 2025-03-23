import { useState, useEffect } from "react"; // Añadimos useEffect
import PropTypes from "prop-types";

const EditModal = ({ isOpen, setIsOpen, task, onSave }) => {
  const [editedTask, setEditedTask] = useState({
    title: task.title || "",
    dueDate: task.dueDate || "",
    description: task.description || "",
    priority: task.priority || "Media",
  });

  // Actualizamos el estado editedTask cuando el prop task cambia (al abrir el modal)
  useEffect(() => {
    setEditedTask({
      title: task.title || "",
      dueDate: task.dueDate || "",
      description: task.description || "",
      priority: task.priority || "Media",
    });
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(editedTask);
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-60 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Editar Tarea</h2>
        <input
          type="text"
          name="title"
          value={editedTask.title}
          onChange={handleChange}
          placeholder="Título"
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="date"
          name="dueDate"
          value={editedTask.dueDate}
          onChange={handleChange}
          className="w-full p-2 mb-2 border rounded"
        />
        <textarea
          name="description"
          value={editedTask.description}
          onChange={handleChange}
          placeholder="Descripción"
          className="w-full p-2 mb-2 border rounded"
        />
        <select
          name="priority"
          value={editedTask.priority}
          onChange={handleChange}
          className="w-full p-2 mb-2 border rounded"
        >
          <option value="Media">Media</option>
          <option value="Baja">Baja</option>
          <option value="Alta">Alta</option>
        </select>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-purple-600 text-white rounded"
          >
            Actualizar
          </button>
        </div>
      </div>
    </div>
  );
};

EditModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  task: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    dueDate: PropTypes.string,
    description: PropTypes.string,
    priority: PropTypes.string,
    status: PropTypes.string,
    assignedTo: PropTypes.number,
  }).isRequired,
  onSave: PropTypes.func.isRequired,
};

export default EditModal;