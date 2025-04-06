import { useState, useEffect } from "react";
import PropTypes from "prop-types";

export default function Header({ handleLogout }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Función para cargar las notificaciones
  const fetchNotifications = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/notifications", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.notifications.filter((notif) => !notif.read).length);
      } else {
        console.error("Error al cargar notificaciones:", await response.json());
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Error al cargar notificaciones:", err);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  // Cargar notificaciones al montar el componente y cada 30 segundos
  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30000); // Cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  // Función para marcar una notificación como leída
  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      if (response.ok) {
        setNotifications(
          notifications.map((notif) =>
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        );
        setUnreadCount(unreadCount - 1);
      } else {
        console.error("Error al marcar notificación como leída:", await response.json());
      }
    } catch (err) {
      console.error("Error al marcar notificación como leída:", err);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-transparent backdrop-blur-sm h-16 flex items-center justify-between px-6 z-10 border-b border-purple-500 border-opacity-30">
      <h1 className="text-2xl ml-26 font-bold text-white cursor-pointer">
        <span className="highlight">XYZ</span>
      </h1>

      <div className="flex items-center space-x-4 relative">
        {/* Ícono de notificaciones con dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="cursor-pointer relative text-white hover:text-purple-300 transition-colors"
          >
            <script src="https://animatedicons.co/scripts/embed-animated-icons.js"></script>
              <animated-icons
                src="https://animatedicons.co/get-icon?name=notification&style=minimalistic&token=2a8c285f-a7a0-4f4d-b2c3-acccc136c454"
                trigger="click"
                attributes='{"variationThumbColour":"#000000","variationName":"Dark","variationNumber":4,"numberOfGroups":2,"strokeWidth":1.1800000000000002,"backgroundIsGroup":true,"defaultColours":{"group-1":"#E6E9EC","group-2":"#000000","background":"#000000"}}'
                height="40"
                width="40"
              ></animated-icons>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown de notificaciones */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-purple-500 border-opacity-30 shadow-lg rounded-lg p-2 max-h-96 overflow-y-auto">
              <h3 className="text-sm font-semibold text-purple-300 mb-2">Notificaciones</h3>
              {notifications.length === 0 ? (
                <p className="text-sm text-gray-400">No hay notificaciones.</p>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-2 mb-1 rounded-md ${
                      notif.read ? "bg-gray-800" : "bg-purple-900 bg-opacity-40"
                    } flex justify-between items-start`}
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{notif.taskTitle}</p>
                      <p className="text-xs text-gray-300">{notif.message}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(notif.date).toLocaleString()}
                      </p>
                    </div>
                    {!notif.read && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="text-xs text-purple-300 hover:text-purple-200 hover:underline"
                      >
                        Marcar como leída
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

       

        <button className="text-white">
          <img
            className="h-5 w-5 brightness-0 invert"
            src="/src/assets/barra-de-puntos.png"
            alt="Barra de puntos"
          />
        </button>

        {/* Icono de usuario con dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="cursor-pointer text-white"
          >
           <script src="https://animatedicons.co/scripts/embed-animated-icons.js"></script>
            <animated-icons
              src="https://animatedicons.co/get-icon?name=user%20profile&style=minimalistic&token=9b327b61-1433-451f-a476-148402217e82"
              trigger="click"
              attributes='{"variationThumbColour":"#000000","variationName":"Dark","variationNumber":4,"numberOfGroups":2,"strokeWidth":1.46,"backgroundIsGroup":true,"defaultColours":{"group-1":"#E6E9EC","group-2":"#000000","background":"#000000"}}'
              height="45"
              width="45"
            ></animated-icons>
          </button>

          {/* Ventana emergente (dropdown) */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-gray-900 border border-purple-500 border-opacity-30 shadow-lg rounded-lg p-2">
              <button
                onClick={handleLogout}
                className="w-full text-left text-red-400 font-semibold py-2 px-4 rounded-md hover:bg-gray-800"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Estilo CSS para el degradado del texto */}
      <style>{`
        .highlight {
          background: linear-gradient(90deg, #f472b6 0%, #a78bfa 50%, #60a5fa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 700;
        }
      `}</style>
    </header>
  );
}

// Validación de props
Header.propTypes = {
  handleLogout: PropTypes.func.isRequired,
};