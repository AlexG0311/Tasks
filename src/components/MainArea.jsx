import PropTypes from "prop-types";
import Tabs from "./Tabs";
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
  // Si no hay un selectedWorkspace, mostrar PanelWorkSpace
  if (!selectedWorkspace) {
    return <PanelWorkSpace />;
  }

  // Si hay un selectedWorkspace, renderizar el contenido con Tabs
  return (
    <main className="flex-1 p-6">
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800">{selectedWorkspace.name}</h2>
        <div className="flex space-x-2 mb-4">
          <div className="w-282 bg-white mt-3 rounded-sm shadow-md p-4 h-[calc(100vh-4rem)]">
            <Tabs workspaceId={selectedWorkspace.id} />
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