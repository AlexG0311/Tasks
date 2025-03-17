import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import TasksTable from "./TasksTable";
import TaskCard from "./TaskCard";
import TaskToolbar from "./TaskToolBar";
import Modal from "./Modal";

const Tabs = ({ defaultTabId = "profile", workspaceId }) => {
  const [activeTab, setActiveTab] = useState(defaultTabId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "Media",
    status: "Pendiente",
    assignedTo: "",
  });
  const [tasks, setTasks] = useState([]);

  // Obtener las tareas al montar el componente
  useEffect(() => {
    const fetchTasks = async () => {
      if (!workspaceId) return;
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
          setTasks(data.tasks);
        } else {
          console.error("Error al obtener tareas:", await response.json());
          setTasks([]);
        }
      } catch (err) {
        console.error("Error al obtener tareas:", err);
        setTasks([]);
      }
    };

    fetchTasks();
  }, [workspaceId]);

  // Restablecer el formulario cada vez que se abra el modal
  useEffect(() => {
    if (isModalOpen) {
      setNewTask({
        title: "",
        description: "",
        dueDate: "",
        priority: "Media",
        status: "Pendiente",
        assignedTo: "",
      });
    }
  }, [isModalOpen]);

  const tabs = [
    {
      id: "profile",
      label: "Tabla",
      content: <TasksTable tasks={tasks} />,
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
    if (!newTask.title || !newTask.assignedTo) {
      alert("Por favor, completa el título y asigna un responsable.");
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
          status: newTask.status,
          assignedTo: newTask.assignedTo,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error al guardar la tarea");
      }

      // Recargar las tareas desde el servidor
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
        status: "Pendiente",
        assignedTo: "",
      });
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error al guardar la tarea:", err);
      if (err.message.includes("Espacio de trabajo no encontrado")) {
        alert("El espacio de trabajo no existe o no tienes permisos. Verifica el ID.");
      } else if (err.message.includes("Usuario no encontrado")) {
        alert("El email del responsable no está registrado. Por favor, verifica.");
      } else {
        alert("Error al guardar la tarea: " + err.message);
      }
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
      <TaskToolbar setIsModalOpen={setIsModalOpen} />
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
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        newTask={newTask}
        handleChangeTask={handleChangeTask}
        handleSaveTask={handleSaveTask}
      />
    </div>
  );
};

Tabs.propTypes = {
  defaultTabId: PropTypes.string,
  workspaceId: PropTypes.number,
};

export default Tabs;