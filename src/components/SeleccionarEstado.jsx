import { useState } from "react";


export default function SeleccionarEstado() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
      >
        Seleccionar estado
      </button>
      {open && (
        <div className="absolute mt-2 w-48 bg-white border rounded-lg shadow-lg">
          {["No iniciada", "Pendiente", "En progreso", "Completada"].map(
            (estado, index) => (
              <div
                key={index}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                {estado}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
