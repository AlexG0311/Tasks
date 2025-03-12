import BoardList from "./BoardList";
import TaskTable from "./TaskTable";
import TaskCard from "./TaskCard";
import PropTypes from "prop-types";

export default function MainArea({
  selectedWorkspace,
  boards,
  selectedBoard,
  handleSelectBoard,
  viewMode,
  setViewMode,
  setIsModalOpen,
}) {
  if (!selectedWorkspace) {
    return (
      <main className="flex-1 p-6">
        <div className="flex items-center b-blue-100 justify-center h-full">
          <div className="w-250 bg-white mt-14  rounded-sm shadow-md p-4 h-[calc(100vh-4rem)] "></div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6">
      <div className="space-y-4">
       
        <h2 className="text-xl font-bold text-gray-800">{selectedWorkspace}</h2>
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setViewMode("tabla")}
            className={`px-4 py-2 rounded-md ${viewMode === "tabla" ? "bg-pink-200" : "bg-gray-200"}`}
          >
            Tabla
          </button>
          <button
            onClick={() => setViewMode("targets")}
            className={`px-4 py-2 rounded-md ${viewMode === "targets" ? "bg-pink-200" : "bg-gray-200"}`}
          >
            Targets
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-black text-white rounded-md"
          >
            Agregar tarea
          </button>
          <input type="text" placeholder="Buscar" className="px-4 py-2 border rounded-md" />
          <select className="px-4 py-2 border rounded-md">
            <option>Filtrar</option>
          </select>
          <select className="px-4 py-2 border rounded-md">
            <option>Ordenar</option>
          </select>
        </div>
        {selectedBoard && boards[selectedWorkspace]?.find((b) => b.id === selectedBoard) && (
          <div>
            {viewMode === "tabla" ? (
              <TaskTable
                tasks={boards[selectedWorkspace].find((b) => b.id === selectedBoard).tasks}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {boards[selectedWorkspace]
                  .find((b) => b.id === selectedBoard)
                  .tasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
              </div>
            )}
          </div>
        )}
        <BoardList
          boards={boards[selectedWorkspace] || []}
          selectedBoard={selectedBoard}
          handleSelectBoard={handleSelectBoard}
        />
      </div>
    </main>
    );
}

MainArea.propTypes = {
  selectedWorkspace: PropTypes.string,
  boards: PropTypes.object.isRequired,
  selectedBoard: PropTypes.number,
  handleSelectBoard: PropTypes.func.isRequired,
  viewMode: PropTypes.oneOf(["tabla", "targets"]).isRequired,
  setViewMode: PropTypes.func.isRequired,
  setIsModalOpen: PropTypes.func.isRequired,
};