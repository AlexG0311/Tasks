import PropTypes from "prop-types";
import SeleccionarEstado from "./SeleccionarEstado";
import BuscarMiembros from "./BuscarMiembros";


const TasksTable = ({ tasks }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b text-left">Título</th>
            <th className="py-2 px-4 border-b text-left">Descripción</th>
            <th className="py-2 px-4 border-b text-left">
              Fecha de Vencimiento
            </th>
            <th className="py-2 px-4 border-b text-left">Prioridad</th>
            <th className="py-2 px-4 border-b text-left">Estado</th>
            <th className="py-2 px-4 border-b text-left">
              Responsable (email)
            </th>
          </tr>
        </thead>
        <tbody>
          {tasks.length === 0 ? (
            <tr>
              <td colSpan="6" className="py-4 px-4 text-center text-gray-500">
                No hay tareas disponibles.
              </td>
            </tr>
          ) : (
            tasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{task.title}</td>
                <td className="py-2 px-4 border-b">
                  {task.description || "Sin descripción"}
                </td>
                <td className="py-2 px-4 border-b">
                  {task.dueDate || "Sin fecha"}
                </td>
                <td className="py-2 px-4 border-b">{task.priority}</td>
                <td className="py-2 px-4 border-b">{task.status}</td>
                <td className="py-2 px-4 border-b">
                  {task.assignedTo || "No asignado"}
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
      due_date: PropTypes.string,
      priority: PropTypes.string,
      status: PropTypes.string,
      assigned_to_email: PropTypes.string,
    })
  ).isRequired,
};

export default TasksTable;
