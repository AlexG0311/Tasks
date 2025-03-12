import PropTypes from "prop-types";

export default function BoardList({ boards, selectedBoard, handleSelectBoard }) {
  return (
    <div className="flex space-x-4 overflow-x-auto">
      {boards.map((board) => (
        <button
          key={board.id}
          onClick={() => handleSelectBoard(board.id)}
          className={`bg-pink-200 rounded-lg p-4 w-64 cursor-pointer ${
            selectedBoard === board.id ? "border-2 border-blue-500" : ""
          }`}
        >
          <h3 className="text-lg font-medium">{board.name}</h3>
          <button className="mt-2 text-pink-600 hover:text-pink-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </button>
      ))}
    </div>
  );
}

BoardList.propTypes = {
  boards: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      tasks: PropTypes.array,
    })
  ).isRequired,
  selectedBoard: PropTypes.number,
  handleSelectBoard: PropTypes.func.isRequired,
};