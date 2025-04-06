import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import SeleccionarEstado from "./SeleccionarEstado";
import CommentsPanel from "./CommentsPanel";

const statusColors = {
  "Pendiente": "bg-gray-500",
  "En Progreso": "bg-yellow-600",
  "Completada": "bg-green-600",
};

const TasksTable = ({ tasks, onSelectionChange, onTasksUpdate }) => {
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [openStatusDropdownId, setOpenStatusDropdownId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [openCommentsTaskId, setOpenCommentsTaskId] = useState(null);
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
        !event.target.closest(".comments-panel")
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
      <div className="overflow-x-auto rounded-lg shadow-md">
        <div
          ref={tableContainerRef}
          className="max-h-[400px] overflow-y-auto relative"
        >
          <table className="min-w-full bg-gray-800 border border-gray-600 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-700 text-gray-200">
                <th className="py-2 px-4 border-b border-gray-600 text-left w-12"></th>
                <th className="py-2 px-4 border-b border-gray-600 text-left">Título</th>
                <th className="py-2 px-4 border-b border-gray-600 text-left">Descripción</th>
                <th className="py-2 px-4 border-b border-gray-600 text-left">Fecha de Vencimiento</th>
                <th className="py-2 px-4 border-b border-gray-600 text-left">Prioridad</th>
                <th className="py-2 px-4 border-b border-gray-600 text-left">Estado</th>
                <th className="py-2 px-4 border-b border-gray-600 text-left">Responsable</th>
                <th className="py-2 px-4 border-b border-gray-600 text-left">Comentarios</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-4 px-4 text-center text-gray-400">
                    No hay tareas disponibles.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-700 transition-colors">
                    <td className="py-2 px-4 border-b border-gray-600">
                      <input
                        type="checkbox"
                        checked={selectedTasks.has(task.id)}
                        onChange={() => handleCheckboxChange(task.id)}
                        className="rounded border-gray-500 text-purple-600 focus:ring-purple-500"
                      />
                    </td>
                    <td className="py-2 px-4 border-b border-gray-600 text-white">{task.title}</td>
                    <td className="py-2 px-4 border-b border-gray-600 text-gray-200">
                      {task.description || "Sin descripción"}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-600 text-gray-200">
                      {task.dueDate || "Sin fecha"}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-600 text-gray-200">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          task.priority === "Alta"
                            ? "bg-red-700 text-red-100"
                            : task.priority === "Media"
                            ? "bg-yellow-700 text-yellow-100"
                            : "bg-green-700 text-green-100"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b  border-gray-600">
                      <div className="flex items-center space-x-2">
                        <button
                          ref={(el) => (statusButtonRefs.current[task.id] = el)}
                          className={`status-button p-1 rounded-md transition-colors ${
                            statusColors[task.status] || "bg-gray-500"
                          } text-white flex-1 text-center text-sm`}
                          onClick={() => toggleStatusDropdown(task.id)}
                        >
                          {task.status}
                        </button>
                        <div className="flex-shrink-0">
                         
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-4 border-b border-gray-600 text-gray-200">
                      {task.assignedFirstName && task.assignedLastName
                        ? `${task.assignedFirstName} ${task.assignedLastName}`
                        : "No asignado"}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-600">
                      <button
                        onClick={() => toggleCommentsPanel(task.id)}
                        className="text-gray-400 hover:text-purple-300 transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 10h8m-4-4v8m9-4a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </button>
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
          className="status-dropdown absolute z-10 w-48 bg-gray-800 border border-gray-600 rounded-md shadow-lg"
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