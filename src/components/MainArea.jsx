import PropTypes from "prop-types";
import Tabs from "./Tabs";
import PanelWorkSpace from "./PanelWorkSpace";
import { PanelAdmin } from "./PanelAdmin";

export default function MainArea({
  user,
  selectedWorkspace,
  boards,
  selectedBoard,
  handleSelectBoard,
  viewMode,
  setViewMode,
  setIsModalOpen,
}) {
  // Si el usuario es administrador, mostrar el área del admin
  if (user?.role === "Administrador") {
    return <PanelAdmin />;
  }

  // Si no hay un selectedWorkspace, mostrar PanelWorkSpace
  if (!selectedWorkspace) {
    return <PanelWorkSpace />;
  }

  // Si hay un selectedWorkspace, renderizar el contenido con Tabs
  return (
    <main className="flex-1 p-6 mt-11 bg-transparent">
      <div className="space-y-4">
        <div className="flex space-x-2 mb-4">
          <div className="w-282 bg-black/30 mt-3 rounded-lg shadow-md p-4 h-[calc(100vh-4rem)] border border-gray-600">
            <Tabs workspaceId={selectedWorkspace.id} />
          </div>
        </div>
      </div>
    </main>
  );
}

MainArea.propTypes = {
  user: PropTypes.shape({
    email: PropTypes.string,
    role: PropTypes.oneOf(["admin", "member"]).isRequired,
  }).isRequired,
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