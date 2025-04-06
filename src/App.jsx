import { useState, useEffect } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import MainArea from "./components/MainArea";
import Modal from "./components/Modals/Modal";
import RegisterForm from "./components/Auth/RegisterForm";
import LoginForm from "./components/Auth/LoginForm";
import { PanelAdmin } from "./components/PanelAdmin";

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
    <div
      className="min-h-screen flex font-sans relative"
      style={{
        backgroundColor: "#060c1c", // --darker-navy
        backgroundImage: `
          radial-gradient(
            circle at 50% 100%, 
            rgba(3, 16, 255, 0.28) 10%, 
            rgba(23, 2, 147, 0.15) 35%, 
            rgba(8, 33, 175, 0.1) 40%, 
            rgba(0, 26, 96, 0.68) 64%,
rgba(11, 20, 193, 0.3) 65%,
rgba(1, 3, 35, 0.99) 85%
          )
        `,
      }}
    >
      {/* Pseudo-elemento ::before para el patrón de cuadrícula */}
      <div
        className="absolute inset-0 z-[-1]"
        style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 49%, rgba(30, 58, 138, 0.05) 50%, transparent 51%),
            linear-gradient(90deg, transparent 49%, rgba(30, 58, 138, 0.05) 50%, transparent 51%)
          `,
          backgroundSize: "40px 40px",
          opacity: 0.4,
        }}
      />
      {user ? (
        user.role === "Administrador" ? (
          // 🚀 Si el usuario es ADMIN, solo muestra Header y PanelAdmin
          <>
            <Header handleLogout={handleLogout} />
            <PanelAdmin />
          </>
        ) : (
          // 👤 Si es usuario normal, muestra Sidebar + MainArea
          <>
            <Header handleLogout={handleLogout} />
            <Sidebar
              user={user}
              isDropdownOpen={isDropdownOpen}
              setIsDropdownOpen={setIsDropdownOpen}
              selectedWorkspace={selectedWorkspace}
              handleSelectWorkspace={handleSelectWorkspace}
              setIsModalOpen={setIsModalOpen}
              workspaces={workspaces}
              setWorkspaces={setWorkspaces}
            />
            <MainArea
              user={user}
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
        )
      ) : (
        <div className="flex-1 p-0 flex items-center justify-center bg-black/30">
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