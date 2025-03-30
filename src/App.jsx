import { useState, useEffect } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import MainArea from "./components/MainArea";
import Modal from "./components/Modals/Modal";
import RegisterForm from "./components/Auth/RegisterForm";
import LoginForm from "./components/Auth/LoginForm";

export function App() {
  const [user, setUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [newBoard, setNewBoard] = useState("");
  const [workspaces, setWorkspaces] = useState([]);
  const [boards, setBoards] = useState({});
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "Media",
    status: "Pendiente",
    assignedTo: "",
  });
  const [viewMode, setViewMode] = useState("tabla");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/protected", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);

          const workspacesResponse = await fetch(
            "http://localhost:5000/api/workspaces",
            {
              method: "GET",
              credentials: "include",
            }
          );

          if (workspacesResponse.ok) {
            const workspacesData = await workspacesResponse.json();
            const loadedWorkspaces = workspacesData.workspaces || [];
            setWorkspaces(loadedWorkspaces);

            // Intentar restaurar el workspace seleccionado desde localStorage
            const savedWorkspaceId = localStorage.getItem("selectedWorkspaceId");
            if (savedWorkspaceId) {
              const savedWorkspace = loadedWorkspaces.find(
                (ws) => ws.id === parseInt(savedWorkspaceId)
              );
              if (savedWorkspace) {
                setSelectedWorkspace(savedWorkspace);
              }
            }
          } else {
            console.error(
              "Error al obtener workspaces:",
              await workspacesResponse.json()
            );
            setWorkspaces([]);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Error al verificar autenticación:", err);
        setUser(null);
      }
    };

    checkAuth();
  }, []);

  const handleSelectWorkspace = (workspace) => {
    console.log("Seleccionando workspace:", workspace);
    setSelectedWorkspace(workspace);
    setIsDropdownOpen(false);
    // Guardar el ID del workspace seleccionado en localStorage
    localStorage.setItem("selectedWorkspaceId", workspace.id);
  };

  const handleAddBoard = () => {
    if (newBoard.trim() && selectedWorkspace) {
      setBoards((prevBoards) => ({
        ...prevBoards,
        [selectedWorkspace.id]: [
          ...(prevBoards[selectedWorkspace.id] || []),
          { id: Date.now(), name: newBoard, tasks: [] },
        ],
      }));
      setNewBoard("");
      setIsModalOpen(false);
    } else {
      alert("Por favor, ingresa un nombre para el tablero.");
    }
  };

  const handleRegisterSuccess = () => {
    setIsRegistering(false);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsRegistering(false);
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      setSelectedWorkspace(null);
      setSelectedBoard(null);
      setWorkspaces([]);
      setBoards({});
      setViewMode("tabla");
      // Limpiar el workspace seleccionado de localStorage al cerrar sesión
      localStorage.removeItem("selectedWorkspaceId");
      console.log("Sesión cerrada exitosamente.");
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
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
    if (!newTask.title || !newTask.assignedTo) {
      alert("Por favor, completa el título y asigna un responsable.");
      return;
    }

    setBoards((prevBoards) => {
      const updatedBoards = { ...prevBoards };
      const workspaceBoards = updatedBoards[selectedWorkspace.id] || [];
      const boardIndex = workspaceBoards.findIndex(
        (b) => b.id === selectedBoard
      );
      if (boardIndex !== -1) {
        workspaceBoards[boardIndex].tasks.push({
          id: Date.now(),
          ...newTask,
        });
        updatedBoards[selectedWorkspace.id] = workspaceBoards;
      }
      return updatedBoards;
    });

    setNewTask({
      title: "",
      description: "",
      dueDate: "",
      priority: "Media",
      status: "Pendiente",
      assignedTo: "",
    });
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">
      {user ? (
        <>
          <Header handleLogout={handleLogout} />
          <Sidebar
            isDropdownOpen={isDropdownOpen}
            setIsDropdownOpen={setIsDropdownOpen}
            selectedWorkspace={selectedWorkspace}
            handleSelectWorkspace={handleSelectWorkspace}
            setIsModalOpen={setIsModalOpen}
            workspaces={workspaces}
            setWorkspaces={setWorkspaces}
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
          />
        </>
      ) : (
        <div className="flex-1 p-0 flex items-center justify-center bg-gray-50">
          {isRegistering ? (
            <RegisterForm
              onRegisterSuccess={handleRegisterSuccess}
              onToggleRegister={setIsRegistering}
            />
          ) : (
            <LoginForm
              onLoginSuccess={handleLoginSuccess}
              onToggleRegister={setIsRegistering}
            />
          )}
        </div>
      )}
    </div>
  );
}