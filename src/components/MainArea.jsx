import { useState, useEffect } from "react";
import BoardList from "./BoardList";
import TaskCard from "./TaskCard";
import PropTypes from "prop-types";
import Tabs from "./Tabs";
import TaskTable from "./TasksTable";
import PanelWorkSpace from "./PanelWorkSpace";

export default function MainArea({
  selectedWorkspace,
  boards,
  selectedBoard,
  handleSelectBoard,
  viewMode,
  setViewMode,
  setIsModalOpen,
}) {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/workspaces", {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setWorkspaces(data.workspaces);
          if (!selectedWorkspace || !selectedWorkspace.id) {
            if (data.workspaces.length > 0) {
              handleSelectBoard(data.workspaces[0].id);
            }
          }
        } else {
          console.error("Error al obtener workspaces:", await response.json());
        }
      } catch (err) {
        console.error("Error al obtener workspaces:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, [selectedWorkspace, handleSelectBoard]);

  if (loading || (!selectedWorkspace && workspaces.length === 0)) {
    return <PanelWorkSpace />;
  }

  const effectiveWorkspace =
    selectedWorkspace && selectedWorkspace.id
      ? selectedWorkspace
      : workspaces.length > 0
      ? workspaces[0]
      : null;

  if (!effectiveWorkspace) {
    return <PanelWorkSpace />;
  }

  console.log("effectiveWorkspace:", effectiveWorkspace);

  return (
    <main className="flex-1 p-6">
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800">{effectiveWorkspace.name}</h2>
        <div className="flex space-x-2 mb-4">
          <div className="w-282 bg-white mt-3 rounded-sm shadow-md p-4 h-[calc(100vh-4rem)]">
            <Tabs workspaceId={effectiveWorkspace.id} />
          </div>
        </div>
      </div>
    </main>
  );
}

MainArea.propTypes = {
  selectedWorkspace: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
  }),
  boards: PropTypes.object.isRequired,
  selectedBoard: PropTypes.number,
  handleSelectBoard: PropTypes.func.isRequired,
  viewMode: PropTypes.oneOf(["tabla", "targets"]).isRequired,
  setViewMode: PropTypes.func.isRequired,
  setIsModalOpen: PropTypes.func.isRequired,
};