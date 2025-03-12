import { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import MainArea from "./components/MainArea";
import Modal from "./components/Modal";
 // Opcional: archivo CSS para estilos globales

export function App() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState("");
  const [newBoard, setNewBoard] = useState("");
  const [workspaces, setWorkspaces] = useState([]);
  const [boards, setBoards] = useState({});
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "",
    assignedTo: "",
    status: "Listo",
  });
  const [viewMode, setViewMode] = useState("tabla");

  const teamMembers = [
    { id: 1, name: "Juan Pérez" },
    { id: 2, name: "María Gómez" },
    { id: 3, name: "Carlos López" },
  ];

  const handleAddWorkspace = (newWorkspaceName) => {
    if (newWorkspaceName.trim() && !workspaces.includes(newWorkspaceName)) {
      setWorkspaces([...workspaces, newWorkspaceName]);
      setIsDropdownOpen(false);
    } else {
      alert("Por favor, ingresa un nombre válido para el espacio de trabajo.");
    }
  };

  const handleSelectWorkspace = (workspace) => {
    setSelectedWorkspace(workspace);
    setIsDropdownOpen(false);
  };

  const handleAddBoard = () => {
    if (newBoard.trim() && selectedWorkspace) {
      setBoards((prevBoards) => ({
        ...prevBoards,
        [selectedWorkspace]: [
          ...(prevBoards[selectedWorkspace] || []),
          { id: Date.now(), name: newBoard, tasks: [] },
        ],
      }));
      setNewBoard("");
      setIsModalOpen(false);
    } else {
      alert("Por favor, ingresa un nombre para el tablero.");
    }
  };

  const handleSelectBoard = (boardId) => {
    setSelectedBoard(boardId);
    setViewMode("tabla");
  };

  const handleChangeTask = (e) => {
    const { name, value } = e.target;
    setNewTask({ ...newTask, [name]: value });
  };

  const handleSaveTask = () => {
    if (!newTask.title || !newTask.assignedTo || !selectedBoard) {
      alert("Por favor, completa el título, asigna un responsable y selecciona un tablero.");
      return;
    }

    setBoards((prevBoards) => {
      const updatedBoards = { ...prevBoards };
      const workspaceBoards = updatedBoards[selectedWorkspace] || [];
      const boardIndex = workspaceBoards.findIndex((b) => b.id === selectedBoard);
      if (boardIndex !== -1) {
        workspaceBoards[boardIndex].tasks.push({
          id: Date.now(),
          ...newTask,
        });
        updatedBoards[selectedWorkspace] = workspaceBoards;
      }
      return updatedBoards;
    });

    setNewTask({
      title: "",
      description: "",
      dueDate: "",
      priority: "",
      assignedTo: "",
      status: "Listo",
    });
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">
      <Header />
      <Sidebar
        isDropdownOpen={isDropdownOpen}
        setIsDropdownOpen={setIsDropdownOpen}
        selectedWorkspace={selectedWorkspace}
        handleSelectWorkspace={handleSelectWorkspace}
        setIsModalOpen={setIsModalOpen}
        workspaces={workspaces}
        handleAddWorkspace={handleAddWorkspace}
      />
      <MainArea
        selectedWorkspace={selectedWorkspace}
        boards={boards}
        selectedBoard={selectedBoard}
        handleSelectBoard={handleSelectBoard}
        viewMode={viewMode}
        setViewMode={setViewMode}
        setIsModalOpen={setIsModalOpen}
      />
      <Modal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        newBoard={newBoard}
        setNewBoard={setNewBoard}
        handleAddBoard={handleAddBoard}
        selectedBoard={selectedBoard}
        newTask={newTask}
        handleChangeTask={handleChangeTask}
        handleSaveTask={handleSaveTask}
        teamMembers={teamMembers}
      />
    </div>
  );
}

