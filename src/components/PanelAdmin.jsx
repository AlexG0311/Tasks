import { useState } from "react";
import { GestionUsuarios } from "./GestionUsuarios";
import { GestionTareas } from "./GestionTareas";
import MoonSVG from './undraw_to-the-moon_w1wa.svg';

export function PanelAdmin() {
  const [vistaActual, setVistaActual] = useState(null); // Estado para controlar la vista actual

  // Función para regresar a la vista inicial
  const handleGoHome = () => {
    setVistaActual(null);
  };

  return (
    <main
      className="flex-1 min-h-screen"
      style={{
        backgroundImage: `
          radial-gradient(
            circle at 50% 100%, 
             rgba(94, 150, 241, 0.2) 10%, 
            rgba(62, 39, 189, 0.15) 35%, 
            rgba(97, 117, 233, 0.1) 40%, 
            rgb(12, 24, 56) 55%,
            rgba(4, 7, 39, 0.99) 65%
          )
        `,
        backgroundSize: "100% 100%",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      {vistaActual ? (
        <div className="h-190 w-250 ml-60 p-0 rounded-lg mt-20 flex flex-col items-center justify-center">
          {/* Mostrar el componente según la vista actual */}
          {vistaActual === "usuarios" && <GestionUsuarios handleGoHome={handleGoHome} />}
          {vistaActual === "tareas" && <GestionTareas handleGoHome={handleGoHome} />}
        </div>
      ) : (
        <div className="flex items-center justify-center mt-8 h-170 shadow-md h-auto">
          <div className="relative w-290 mt-12 h-300 rounded-lg shadow-2xl p-6 h-[calc(100vh-4rem)] flex flex-col items-center overflow-hidden bg-gray-900 border border-purple-500 border-opacity-30">
            {/* Fondo con grid */}
            <div
              className="absolute inset-0 z-0"
              style={{
                backgroundImage: `
                  linear-gradient(0deg, transparent 49%, rgba(139, 92, 246, 0.15) 50%, transparent 51%),
                  linear-gradient(90deg, transparent 49%, rgba(139, 92, 246, 0.15) 50%, transparent 51%)
                `,
                backgroundSize: "40px 40px",
                opacity: 0.5,
              }}
            ></div>

            {/* Contenido */}
            <div className="z-10 w-full max-w-3xl">
              <h2 className="text-5xl text-center  font-bold mb-6 mb-20 mt-20 ml-0 drop-shadow-lg highlight">
                Bienvenido Administrador
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card 1: Gestión de Usuarios */}
                <div
                  className="bg-gray-800 p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 cursor-pointer border border-purple-500 border-opacity-30"
                  onClick={() => setVistaActual("usuarios")}
                >
                  <div className="text-purple-300 mb-4">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-8 h-8"
                    >
                      <path d="M4.5 9.5V5.5C4.5 4.94772 4.94772 4.5 5.5 4.5H9.5C10.0523 4.5 10.5 4.94772 10.5 5.5V9.5C10.5 10.0523 10.0523 10.5 9.5 10.5H5.5C4.94772 10.5 4.5 10.0523 4.5 9.5Z" />
                      <path d="M13.5 18.5V14.5C13.5 13.9477 13.9477 13.5 14.5 13.5H18.5C19.0523 13.5 19.5 13.9477 19.5 14.5V18.5C19.5 19.0523 19.0523 19.5 18.5 19.5H14.5C13.9477 19.5 13.5 19.0523 13.5 18.5Z" />
                      <path d="M4.5 19.5L7.5 13.5L10.5 19.5H4.5Z" />
                      <path d="M16.5 4.5C18.1569 4.5 19.5 5.84315 19.5 7.5C19.5 9.15685 18.1569 10.5 16.5 10.5C14.8431 10.5 13.5 9.15685 13.5 7.5C13.5 5.84315 14.8431 4.5 16.5 4.5Z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    Gestión de Usuarios
                  </h3>
                  <p className="text-gray-300 mt-2">Administra usuarios.</p>
                  <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 opacity-20 rounded-tl-xl"></div>
                </div>

                {/* Card 2: Gestión de Tareas */}
                <div
                  className="bg-gray-800 p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 cursor-pointer border border-purple-500 border-opacity-30"
                  onClick={() => setVistaActual("tareas")}
                >
                  <div className="text-purple-300 mb-4">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-8 h-8"
                    >
                      <path d="M4.5 9.5V5.5C4.5 4.94772 4.94772 4.5 5.5 4.5H9.5C10.0523 4.5 10.5 4.94772 10.5 5.5V9.5C10.5 10.0523 10.0523 10.5 9.5 10.5H5.5C4.94772 10.5 4.5 10.0523 4.5 9.5Z" />
                      <path d="M13.5 18.5V14.5C13.5 13.9477 13.9477 13.5 14.5 13.5H18.5C19.0523 13.5 19.5 13.9477 19.5 14.5V18.5C19.5 19.0523 19.0523 19.5 18.5 19.5H14.5C13.9477 19.5 13.5 19.0523 13.5 18.5Z" />
                      <path d="M4.5 19.5L7.5 13.5L10.5 19.5H4.5Z" />
                      <path d="M16.5 4.5C18.1569 4.5 19.5 5.84315 19.5 7.5C19.5 9.15685 18.1569 10.5 16.5 10.5C14.8431 10.5 13.5 9.15685 13.5 7.5C13.5 5.84315 14.8431 4.5 16.5 4.5Z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    Gestión de Tareas
                  </h3>
                  <p className="text-gray-300 mt-2">
                    Asigna y gestiona las tareas.
                  </p>
                  <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 opacity-20 rounded-tl-xl"></div>
                </div>
                <img src={MoonSVG} alt="To the moon" className="w-100 ml-147 h-100" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estilo CSS para el degradado del texto */}
      <style>{`
        .highlight {
          background: linear-gradient(90deg, #f472b6 0%, #a78bfa 50%, #60a5fa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 700;
        }
      `}</style>
    </main>
  );
}