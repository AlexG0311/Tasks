import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import TasksTable from "./TasksTable";
import TaskCard from "./TaskCard";
import TaskToolbar from "./TaskToolBar";
import Modal from "./Modals/Modal";
import EditModal from "./Modals/EditModal";

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
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]); // Tareas filtradas para "Tabla"
  const [filteredAssignedTasks, setFilteredAssignedTasks] = useState([]); // Tareas filtradas para "Mis Tareas Asignadas"
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // Estado para el término de búsqueda

  // Cargar tareas del espacio de trabajo
  useEffect(() => {
    const fetchTasks = async () => {
      console.log("Fetching tasks for workspaceId:", workspaceId);
      if (!workspaceId || isNaN(workspaceId)) {
        console.log("workspaceId no válido:", workspaceId);
        setTasks([]);
        setFilteredTasks([]);
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
          console.log(
            "Tareas recibidas para workspaceId",
            workspaceId,
            ":",
            data.tasks
          );
          setTasks(data.tasks || []);
          setFilteredTasks(data.tasks || []); // Inicializar las tareas filtradas
        } else {
          const errorData = await response.json();
          console.error(
            "Error al obtener tareas para workspaceId",
            workspaceId,
            ":",
            errorData
          );
          alert(
            `Error al obtener tareas: ${errorData.error || "Error desconocido"}`
          );
          setTasks([]);
          setFilteredTasks([]);
        }
      } catch (err) {
        console.error(
          "Error al obtener tareas para workspaceId",
          workspaceId,
          ":",
          err
        );
        alert(
          "Error al conectar con el servidor. Revisa la consola para más detalles."
        );
        setTasks([]);
        setFilteredTasks([]);
      }
    };

    fetchTasks();
  }, [workspaceId]);

  // Cargar tareas asignadas al usuario
  useEffect(() => {
    const fetchAssignedTasks = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/my-assigned-tasks`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Tareas asignadas recibidas:", data.tasks);
          setAssignedTasks(data.tasks || []);
          setFilteredAssignedTasks(data.tasks || []); // Inicializar las tareas asignadas filtradas
        } else {
          const errorData = await response.json();
          console.error("Error al obtener tareas asignadas:", errorData);
          alert(
            `Error al obtener tareas asignadas: ${
              errorData.error || "Error desconocido"
            }`
          );
          setAssignedTasks([]);
          setFilteredAssignedTasks([]);
        }
      } catch (err) {
        console.error("Error al obtener tareas asignadas:", err);
        alert(
          "Error al conectar con el servidor. Revisa la consola para más detalles."
        );
        setAssignedTasks([]);
        setFilteredAssignedTasks([]);
      }
    };

    fetchAssignedTasks();
  }, []);

  // Filtrar tareas cuando cambie el término de búsqueda
  useEffect(() => {
    const filterTasks = (tasksList) => {
      if (!searchTerm.trim()) {
        return tasksList; // Si no hay término de búsqueda, mostrar todas las tareas
      }

      const term = searchTerm.toLowerCase();
      return tasksList.filter((task) => {
        return (
          (task.title && task.title.toLowerCase().includes(term)) ||
          (task.description && task.description.toLowerCase().includes(term)) ||
          (task.dueDate && task.dueDate.toLowerCase().includes(term)) ||
          (task.priority && task.priority.toLowerCase().includes(term)) ||
          (task.status && task.status.toLowerCase().includes(term)) ||
          (task.assignedFirstName && task.assignedFirstName.toLowerCase().includes(term)) ||
          (task.assignedLastName && task.assignedLastName.toLowerCase().includes(term))
        );
      });
    };

    setFilteredTasks(filterTasks(tasks));
    setFilteredAssignedTasks(filterTasks(assignedTasks));
  }, [searchTerm, tasks, assignedTasks]);

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

  // Función para manejar la actualización de tareas
  const handleTasksUpdate = (updatedTasks) => {
    if (activeTab === "profile") {
      setTasks(updatedTasks);
      setFilteredTasks(updatedTasks); // Actualizar las tareas filtradas
    } else if (activeTab === "assigned") {
      setAssignedTasks(updatedTasks);
      setFilteredAssignedTasks(updatedTasks); // Actualizar las tareas asignadas filtradas
    }
  };

  const tabs = [
    {
      id: "profile",
      label: "Tabla",
      content: (
        <TasksTable
          tasks={filteredTasks} // Pasar las tareas filtradas
          onSelectionChange={setSelectedTaskIds}
          onTasksUpdate={handleTasksUpdate}
        />
      ),
    },
    {
      id: "assigned",
      label: "Mis Tareas Asignadas",
      content: (
        <TasksTable
          tasks={filteredAssignedTasks} // Pasar las tareas asignadas filtradas
          onSelectionChange={setSelectedTaskIds}
          onTasksUpdate={handleTasksUpdate}
        />
      ),
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
      const response = await fetch(
        `http://localhost:5000/api/workspaces/${workspaceId}/tasks`,
        {
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
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error al guardar la tarea");
      }

      const updatedTasks = [...tasks, data.task];
      setTasks(updatedTasks);
      setFilteredTasks(updatedTasks); // Actualizar las tareas filtradas

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
        alert(
          "El espacio de trabajo no existe o no tienes permisos. Verifica el ID."
        );
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
        const updatedTasks = tasks.filter((task) => !taskIds.includes(task.id));
        setTasks(updatedTasks);
        setFilteredTasks(updatedTasks);

        const updatedAssignedTasks = assignedTasks.filter(
          (task) => !taskIds.includes(task.id)
        );
        setAssignedTasks(updatedAssignedTasks);
        setFilteredAssignedTasks(updatedAssignedTasks);

        setSelectedTaskIds([]);
      } else {
        const errorData = await response.json();
        alert(
          `Error al eliminar tareas: ${errorData.error || "Error desconocido"}`
        );
      }
    } catch (err) {
      console.error("Error al eliminar tareas:", err);
      alert(
        "Error al conectar con el servidor. Revisa la consola para más detalles."
      );
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

      const updatedTask = data.task;
      const updatedTasks = tasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      );
      setTasks(updatedTasks);
      setFilteredTasks(updatedTasks);

      const updatedAssignedTasks = assignedTasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      );
      setAssignedTasks(updatedAssignedTasks);
      setFilteredAssignedTasks(updatedAssignedTasks);

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

      const updatedTask = data.task;
      const updatedTasks = tasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      );
      setTasks(updatedTasks);
      setFilteredTasks(updatedTasks);

      const updatedAssignedTasks = assignedTasks.some(
        (task) => task.id === updatedTask.id
      )
        ? assignedTasks.map((task) =>
            task.id === updatedTask.id ? updatedTask : task
          )
        : [...assignedTasks, updatedTask];
      setAssignedTasks(updatedAssignedTasks);
      setFilteredAssignedTasks(updatedAssignedTasks);
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
        onSearch={setSearchTerm} // Pasar la función para actualizar el término de búsqueda
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