import { useState } from "react";


export default function BuscarMiembros() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
      >
        Buscar miembros 
      </button>
       {/* Ventana emergente (dropdown) */}
       {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 shadow-md rounded-lg p-2">
              <button
                
                className="w-full text-left text-red-500 font-semibold py-2 px-4 rounded-md hover:bg-gray-100"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
    </div>
  );
}
