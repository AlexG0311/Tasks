import PropTypes from "prop-types";

const statusColors = {
  "Pendiente": "bg-gray-400",
  "En Progreso": "bg-yellow-400",
  "Completada": "bg-green-400",
};

const SeleccionarEstado = ({ value, onChange }) => {
  const statuses = ["Pendiente", "En Progreso", "Completada"];

  return (
    <div className="relative">
      <div className="w-48 bg-gray border rounded-lg shadow-lg">
        {statuses.map((estado, index) => (
          <div
            key={index}
            className={`px-4 py-2 hover:bg-gray-400 cursor-pointer ${
              estado === value ? statusColors[estado] : ""
            } text-black    transition-colors`}
            onClick={() => onChange(estado)}
          >
            {estado}
          </div>
        ))}
      </div>
    </div>
  );
};

SeleccionarEstado.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default SeleccionarEstado;