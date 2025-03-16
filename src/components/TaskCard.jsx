import { useState } from "react";
import PropTypes from "prop-types";

const TaskCard = ({ title, date, status, responsible, width = "w-60", height = "h-auto" }) => {
  const [isSelected, setIsSelected] = useState(false);

  const handleClick = () => {
    console.log("Clic detectado, isSelected:", !isSelected);
    setIsSelected(!isSelected);
  };

  return (
    <div
      onClick={handleClick}
      className={`bg-gray-100 rounded-lg p-4 shadow-md transition-all duration-300 
        ${width} ${height} 
        hover:shadow-lg hover:bg-gray-200 hover:scale-105 hover:border hover:border-blue-300 
        ${isSelected ? "bg-blue-200 border-2 border-blue-500" : ""}`}
    >
      <div className="space-y-3">
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700">
            Título de la tarea
          </label>
          <div className="mt-1 p-2 bg-gray-200 rounded-md text-gray-800">
            {title || "Sin título"}
          </div>
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700">Fecha</label>
          <div className="mt-1 p-2 bg-gray-200 rounded-md text-gray-800">
            {date || "Sin fecha"}
          </div>
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700">Estado</label>
          <div className="mt-1 p-2 bg-gray-200 rounded-md text-gray-800">
            {status || "Sin estado"}
          </div>
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700">
            Responsable
          </label>
          <div className="mt-1 p-2 bg-gray-200 rounded-md text-gray-800">
            {responsible || "Sin responsable"}
          </div>
        </div>
      </div>
    </div>
  );
};

TaskCard.propTypes = {
  title: PropTypes.string,
  date: PropTypes.string,
  status: PropTypes.string,
  responsible: PropTypes.string,
  width: PropTypes.string, // Nueva prop para el ancho
  height: PropTypes.string, // Nueva prop para el alto
};

export default TaskCard;