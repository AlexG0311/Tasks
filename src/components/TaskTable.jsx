import PropTypes from "prop-types";

export default function TaskTable({ tasks }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse bg-white shadow-md rounded-lg">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Título</th>
            <th className="border p-2">Descripción</th>
            <th className="border p-2">Fecha de vencimiento</th>
            <th className="border p-2">Estado</th>
            <th className="border p-2">Responsable</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="border">
              <td className="border p-2">{task.title}</td>
              <td className="border p-2">{task.description}</td>
              <td className="border p-2">{task.dueDate}</td>
              <td className="border p-2">{task.status}</td>
              <td className="border p-2">{task.assignedTo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

TaskTable.propTypes = {
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      dueDate: PropTypes.string,
      status: PropTypes.string,
      assignedTo: PropTypes.string,
    })
  ).isRequired,
};