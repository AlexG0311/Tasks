import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import TasksTable from "./TasksTable";
import TaskCard from "./TaskCard";
import TaskToolbar from "./TaskToolBar";
import Modal from "./Modal";
import EditModal from "./EditModal";

const Tabs = ({ defaultTabId = "profile", workspaceId }) => {
  const [activeTab, setActiveTab] = useState(defaultTabId);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "Media",
  });
  const [tasks, setTasks] = useState([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [taskToEdit, setTaskToEdit] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      console.log("Fetching tasks for workspaceId:", workspaceId);
      if (!workspaceId || isNaN(workspaceId)) {
        console.log("workspaceId no válido:", workspaceId);
        setTasks([]);
        return;
      }
      try {
        const response = await fetch(
          `http://localhost:5000/api/workspaces/${workspaceId}/tasks`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Tareas recibidas para workspaceId", workspaceId, ":", data.tasks);
          setTasks(data.tasks || []);
        } else {
          const errorData = await response.json();
          console.error("Error al obtener tareas para workspaceId", workspaceId, ":", errorData);
          alert(`Error al obtener tareas: ${errorData.error || "Error desconocido"}`);
          setTasks([]);
        }
      } catch (err) {
        console.error("Error al obtener tareas para workspaceId", workspaceId, ":", err);
        alert("Error al conectar con el servidor. Revisa la consola para más detalles.");
        setTasks([]);
      }
    };

    fetchTasks();
  }, [workspaceId]);

  useEffect(() => {
    if (isCreateModalOpen) {
      setNewTask({
        title: "",
        description: "",
        dueDate: "",
        priority: "Media",
      });
    }
  }, [isCreateModalOpen]);

  const tabs = [
    {
      id: "profile",
      label: "Tabla",
      content: (
        <TasksTable
          tasks={tasks}
          onSelectionChange={setSelectedTaskIds}
        />
      ),
    },
    {
      id: "dashboard",
      label: "Targe",
      content: <TaskCard />,
    },
  ];

  const activeClasses =
    "text-purple-600 hover:text-purple-600 dark:text-purple-500 dark:hover:text-purple-500 border-purple-600 dark:border-purple-500";
  const inactiveClasses =
    "text-gray-500 hover:text-gray-600 dark:text-gray-400 border-gray-100 hover:border-gray-300 dark:border-gray-700 dark:hover:text-gray-300";

  const handleChangeTask = (e) => {
    const { name, value } = e.target;
    setNewTask({ ...newTask, [name]: value });
  };

  const handleSaveTask = async () => {
    if (!newTask.title || !newTask.title.trim()) {
      alert("Por favor, completa el título.");
      return;
    }
    if (!workspaceId || isNaN(workspaceId)) {
      alert("El ID del espacio de trabajo no es válido.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/workspaces/${workspaceId}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description,
          dueDate: newTask.dueDate,
          priority: newTask.priority,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error al guardar la tarea");
      }

      const tasksResponse = await fetch(`http://localhost:5000/api/workspaces/${workspaceId}/tasks`, {
        method: "GET",
        credentials: "include",
      });

      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        setTasks(tasksData.tasks);
      } else {
        console.error("Error al recargar tareas:", await tasksResponse.json());
        setTasks([]);
      }

      setNewTask({
        title: "",
        description: "",
        dueDate: "",
        priority: "Media",
      });
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error("Error al guardar la tarea:", err);
      if (err.message.includes("Espacio de trabajo no encontrado")) {
        alert("El espacio de trabajo no existe o no tienes permisos. Verifica el ID.");
      } else {
        alert("Error al guardar la tarea: " + err.message);
      }
    }
  };

  const handleDelete = async (taskIds) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/workspaces/${workspaceId}/tasks`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ taskIds }),
        }
      );

      if (response.ok) {
        const tasksResponse = await fetch(`http://localhost:5000/api/workspaces/${workspaceId}/tasks`, {
          method: "GET",
          credentials: "include",
        });
        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json();
          setTasks(tasksData.tasks);
          setSelectedTaskIds([]);
        }
      } else {
        const errorData = await response.json();
        alert(`Error al eliminar tareas: ${errorData.error || "Error desconocido"}`);
      }
    } catch (err) {
      console.error("Error al eliminar tareas:", err);
      alert("Error al conectar con el servidor. Revisa la consola para más detalles.");
    }
  };

  const handleEdit = async () => {
    if (selectedTaskIds.length !== 1) {
      alert("Selecciona exactamente una tarea para editar.");
      return;
    }

    const taskId = selectedTaskIds[0];
    const taskToEdit = tasks.find((task) => task.id === taskId);
    if (taskToEdit) {
      console.log("Tarea a editar:", taskToEdit);
      setTaskToEdit(taskToEdit);
      setIsEditModalOpen(true);
    } else {
      alert("Tarea no encontrada.");
    }
  };

  const handleSaveEdit = async (editedTask) => {
    if (!workspaceId || isNaN(workspaceId)) {
      alert("El ID del espacio de trabajo no es válido.");
      return;
    }

    if (!editedTask.title || !editedTask.title.trim()) {
      alert("El título es obligatorio.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/workspaces/${workspaceId}/tasks/${taskToEdit.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            title: editedTask.title,
            dueDate: editedTask.dueDate,
            description: editedTask.description,
            priority: editedTask.priority,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar la tarea");
      }

      const tasksResponse = await fetch(`http://localhost:5000/api/workspaces/${workspaceId}/tasks`, {
        method: "GET",
        credentials: "include",
      });

      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        setTasks(tasksData.tasks);
      } else {
        console.error("Error al recargar tareas:", await tasksResponse.json());
        setTasks([]);
      }

      setTaskToEdit(null);
      setIsEditModalOpen(false);
      setSelectedTaskIds([]);
    } catch (err) {
      console.error("Error al actualizar la tarea:", err);
      alert("Error al actualizar la tarea: " + err.message);
    }
  };

  const handleAssignTask = async (taskId, email) => {
    if (!workspaceId || isNaN(workspaceId)) {
      alert("El ID del espacio de trabajo no es válido.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/workspaces/${workspaceId}/tasks/${taskId}/assign`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            assignedTo: email,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error al asignar el responsable");
      }

      const tasksResponse = await fetch(`http://localhost:5000/api/workspaces/${workspaceId}/tasks`, {
        method: "GET",
        credentials: "include",
      });

      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        setTasks(tasksData.tasks);
      } else {
        console.error("Error al recargar tareas:", await tasksResponse.json());
        setTasks([]);
      }
    } catch (err) {
      console.error("Error al asignar el responsable:", err);
      alert("Error al asignar el responsable: " + err.message);
    }
  };

  return (
    <div className="mb-4 border-gray-200 dark:border-gray-700">
      <ul
        className="flex flex-wrap -mb-px text-sm font-medium text-center"
        id="default-styled-tab"
        role="tablist"
      >
        {tabs.map((tab) => (
          <li className="me-2" key={tab.id} role="presentation">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === tab.id ? activeClasses : inactiveClasses
              }`}
              id={`${tab.id}-styled-tab`}
              onClick={() => setActiveTab(tab.id)}
              type="button"
              role="tab"
              aria-controls={tab.id}
              aria-selected={activeTab === tab.id}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
      <TaskToolbar
        setIsModalOpen={setIsCreateModalOpen}
        selectedTaskIds={selectedTaskIds}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onAssign={handleAssignTask}
      />
      <div id="default-styled-tab-content">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`p-4 ${activeTab === tab.id ? "" : "hidden"}`}
            id={`styled-${tab.id}`}
            role="tabpanel"
            aria-labelledby={`${tab.id}-tab`}
          >
            {tab.content}
          </div>
        ))}
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        setIsOpen={setIsCreateModalOpen}
        newTask={newTask}
        handleChangeTask={handleChangeTask}
        handleSaveTask={handleSaveTask}
      />
      <EditModal
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        task={taskToEdit || {}}
        onSave={handleSaveEdit}
      />
    </div>
  );
};

Tabs.propTypes = {
  defaultTabId: PropTypes.string,
  workspaceId: PropTypes.number,
};

export default Tabs;