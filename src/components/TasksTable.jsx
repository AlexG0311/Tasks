import { useState } from "react";
import PropTypes from "prop-types";
import SeleccionarEstado from "./SeleccionarEstado";
import BuscarMiembros from "./BuscarMiembros";

const TasksTable = ({ tasks, onSelectionChange }) => {
  const [selectedTasks, setSelectedTasks] = useState(new Set());

  const handleCheckboxChange = (taskId) => {
    const newSelectedTasks = new Set(selectedTasks);
    if (newSelectedTasks.has(taskId)) {
      newSelectedTasks.delete(taskId);
    } else {
      newSelectedTasks.add(taskId);
    }
    setSelectedTasks(newSelectedTasks);
    if (onSelectionChange) {
      onSelectionChange(Array.from(newSelectedTasks));
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th></th>
            <th className="py-2 px-4 border-b text-left">Título</th>
            <th className="py-2 px-4 border-b text-left">Descripción</th>
            <th className="py-2 px-4 border-b text-left">Fecha de Vencimiento</th>
            <th className="py-2 px-4 border-b text-left">Prioridad</th>
            <th className="py-2 px-4 border-b text-left">Estado</th>
            <th className="py-2 px-4 border-b text-left">Responsable</th> {/* Cambiado de "Responsable (ID)" */}
          </tr>
        </thead>
        <tbody>
          {tasks.length === 0 ? (
            <tr>
              <td colSpan="7" className="py-4 px-4 text-center text-gray-500">
                No hay tareas disponibles.
              </td>
            </tr>
          ) : (
            tasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">
                  <input
                    type="checkbox"
                    checked={selectedTasks.has(task.id)}
                    onChange={() => handleCheckboxChange(task.id)}
                  />
                </td>
                <td className="py-2 px-4 border-b">{task.title}</td>
                <td className="py-2 px-4 border-b">
                  {task.description || "Sin descripción"}
                </td>
                <td className="py-2 px-4 border-b">
                  {task.dueDate || "Sin fecha"}
                </td>
                <td className="py-2 px-4 border-b">{task.priority}</td>
                <td className="py-2 px-4 border-b"><button className="bg-gray-400 transition-colors p-1 rounded-md">{task.status}</button></td>
                <td className="py-2 px-4 border-b">
                  {task.assignedFirstName && task.assignedLastName
                    ? `${task.assignedFirstName} ${task.assignedLastName}`
                    : "No asignado"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

TasksTable.propTypes = {
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      title: PropTypes.string,
      description: PropTypes.string,
      dueDate: PropTypes.string,
      priority: PropTypes.string,
      status: PropTypes.string,
      assignedTo: PropTypes.number,
      assignedFirstName: PropTypes.string, // Nuevo campo
      assignedLastName: PropTypes.string,  // Nuevo campo
    })
  ).isRequired,
  onSelectionChange: PropTypes.func,
};

export default TasksTable;