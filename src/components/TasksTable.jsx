import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import SeleccionarEstado from "./SeleccionarEstado";
import CommentsPanel from "./CommentsPanel"; // Importar el nuevo componente

const statusColors = {
  "Pendiente": "bg-gray-400",
  "En Progreso": "bg-yellow-400",
  "Completada": "bg-green-400",
};

const TasksTable = ({ tasks, onSelectionChange, onTasksUpdate }) => {
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [openStatusDropdownId, setOpenStatusDropdownId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [openCommentsTaskId, setOpenCommentsTaskId] = useState(null); // Estado para controlar el panel de comentarios
  const statusButtonRefs = useRef({});
  const tableContainerRef = useRef(null);

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

  const toggleStatusDropdown = (taskId) => {
    if (openStatusDropdownId === taskId) {
      setOpenStatusDropdownId(null);
    } else {
      setOpenStatusDropdownId(taskId);
      const button = statusButtonRefs.current[taskId];
      const tableContainer = tableContainerRef.current;
      if (button && tableContainer) {
        const buttonRect = button.getBoundingClientRect();
        const tableRect = tableContainer.getBoundingClientRect();
        setDropdownPosition({
          top: buttonRect.bottom - tableRect.top + tableContainer.scrollTop,
          left: buttonRect.left - tableRect.left + tableContainer.scrollLeft,
        });
      }
    }
  };

  const handleStatusChange = async (taskId, newStatus, workspaceId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/workspaces/${workspaceId}/tasks/${taskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar el estado");
      }

      const data = await response.json();
      const updatedTask = data.task;

      // Actualizar las tareas localmente
      const updatedTasks = tasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      );

      if (onTasksUpdate) {
        onTasksUpdate(updatedTasks);
      }

      setOpenStatusDropdownId(null);
    } catch (err) {
      console.error("Error al actualizar el estado:", err);
      alert("Error al actualizar el estado: " + err.message);
    }
  };

  // Función para abrir/cerrar el panel de comentarios
  const toggleCommentsPanel = (taskId) => {
    if (openCommentsTaskId === taskId) {
      setOpenCommentsTaskId(null);
    } else {
      setOpenCommentsTaskId(taskId);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".status-dropdown") &&
        !event.target.closest(".status-button") &&
        !event.target.closest(".comments-panel") // Evitar cerrar el panel de comentarios
      ) {
        setOpenStatusDropdownId(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (openStatusDropdownId) {
        const button = statusButtonRefs.current[openStatusDropdownId];
        const tableContainer = tableContainerRef.current;
        if (button && tableContainer) {
          const buttonRect = button.getBoundingClientRect();
          const tableRect = tableContainer.getBoundingClientRect();
          setDropdownPosition({
            top: buttonRect.bottom - tableRect.top + tableContainer.scrollTop,
            left: buttonRect.left - tableRect.left + tableContainer.scrollLeft,
          });
        }
      }
    };

    const tableContainer = tableContainerRef.current;
    if (tableContainer) {
      tableContainer.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (tableContainer) {
        tableContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, [openStatusDropdownId]);

  return (
    <div className="relative">
      <div className="overflow-x-auto">
        <div
          ref={tableContainerRef}
          className="max-h-[400px] overflow-y-auto relative"
        >
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th></th>
                <th className="py-2 px-4 border-b text-left">Título</th>
                <th className="py-2 px-4 border-b text-left">Descripción</th>
                <th className="py-2 px-4 border-b text-left">Fecha de Vencimiento</th>
                <th className="py-2 px-4 border-b text-left">Prioridad</th>
                <th className="py-2 px-4 border-b text-left">Estado</th>
                <th className="py-2 px-4 border-b text-left">Responsable</th>
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
                    <td className="py-2 px-4 border-b">
                      <div className="flex items-center space-x-2">
                        <button
                          ref={(el) => (statusButtonRefs.current[task.id] = el)}
                          className={`status-button p-1 rounded-md transition-colors ${
                            statusColors[task.status] || "bg-gray-400"
                          } text-white flex-1 text-center`}
                          onClick={() => toggleStatusDropdown(task.id)}
                        >
                          {task.status}
                        </button>
                        <div className="flex-shrink-0">
                          <script src="https://animatedicons.co/scripts/embed-animated-icons.js"></script>
                          <animated-icons
                            src="https://animatedicons.co/get-icon?name=Feedback&style=minimalistic&token=1c51c7cf-4171-47da-8a99-9ad866be3701"
                            trigger="click"
                            attributes='{"variationThumbColour":"#FFFFFF","variationName":"Normal","variationNumber":1,"numberOfGroups":1,"backgroundIsGroup":false,"strokeWidth":1,"defaultColours":{"group-1":"#000000","background":"#FFFFFF"}}'
                            height="30"
                            width="30"
                            onClick={() => toggleCommentsPanel(task.id)} // Abrir el panel al hacer clic
                          ></animated-icons>
                        </div>
                      </div>
                    </td>
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
      </div>
      {openStatusDropdownId && (
        <div
          className="status-dropdown absolute z-10 w-48 bg-white border border-gray-200 rounded-md shadow-lg"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
        >
          <SeleccionarEstado
            value={tasks.find((task) => task.id === openStatusDropdownId)?.status}
            onChange={(newStatus) =>
              handleStatusChange(
                openStatusDropdownId,
                newStatus,
                tasks.find((task) => task.id === openStatusDropdownId)?.workspaceId
              )
            }
          />
        </div>
      )}
      {openCommentsTaskId && (
        <CommentsPanel
          isOpen={!!openCommentsTaskId}
          onClose={() => setOpenCommentsTaskId(null)}
          taskId={openCommentsTaskId}
        />
      )}
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
      assignedFirstName: PropTypes.string,
      assignedLastName: PropTypes.string,
      workspaceId: PropTypes.number,
    })
  ).isRequired,
  onSelectionChange: PropTypes.func,
  onTasksUpdate: PropTypes.func,
};

export default TasksTable;