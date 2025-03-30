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
    <header className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10">
      <h1 className="text-2xl ml-26  font-bold text-purple-600 cursor-pointer">
        XYZ
      </h1>

      <div className="flex items-center space-x-4 relative">
        {/* Ícono de notificaciones con dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="cursor-pointer relative"
          >
            <animated-icons
              src="https://animatedicons.co/get-icon?name=notification&style=minimalistic&token=2a8c285f-a7a0-4f4d-b2c3-acccc136c454"
              trigger="hover"
              attributes='{"variationThumbColour":"#536DFE","variationName":"Two Tone","variationNumber":2,"numberOfGroups":2,"backgroundIsGroup":false,"strokeWidth":1,"defaultColours":{"group-1":"#000000","group-2":"#536DFE","background":"#FFFFFF"}}'
              height="30"
              width="30"
            ></animated-icons>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown de notificaciones */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 shadow-md rounded-lg p-2 max-h-96 overflow-y-auto">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Notificaciones</h3>
              {notifications.length === 0 ? (
                <p className="text-sm text-gray-500">No hay notificaciones.</p>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-2 mb-1 rounded-md ${
                      notif.read ? "bg-gray-100" : "bg-purple-50"
                    } flex justify-between items-start`}
                  >
                    <div>
                      <p className="text-sm font-medium">{notif.taskTitle}</p>
                      <p className="text-xs text-gray-600">{notif.message}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(notif.date).toLocaleString()}
                      </p>
                    </div>
                    {!notif.read && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="text-xs text-purple-600 hover:underline"
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

        <animated-icons
          src="https://animatedicons.co/get-icon?name=Light%20Mode&style=minimalistic&token=5f4d2675-67d4-4c5e-9139-8226e36723ae"
          trigger="hover"
          attributes='{"variationThumbColour":"#000000","variationName":"Dark","variationNumber":4,"numberOfGroups":2,"strokeWidth":1.5,"backgroundIsGroup":true,"defaultColours":{"group-1":"#E6E9EC","group-2":"#000000","background":"#000000"}}'
          height="35"
          width="35"
        ></animated-icons>

        <button>
          <img
            className="h-5 w-5"
            src="/src/assets/barra-de-puntos.png"
            alt="Barra de puntos"
          />
        </button>

        {/* Icono de usuario con dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="cursor-pointer"
          >
            <animated-icons
              src="https://animatedicons.co/get-icon?name=user%20profile&style=minimalistic&token=9b327b61-1433-451f-a476-148402217e82"
              trigger="hover"
              attributes='{"variationThumbColour":"#536DFE","variationName":"Two Tone","variationNumber":2,"numberOfGroups":2,"backgroundIsGroup":false,"strokeWidth":1,"defaultColours":{"group-1":"#000000","group-2":"#536DFE","background":"#FFFFFF"}}'
              height="35"
              width="35"
            ></animated-icons>
          </button>

          {/* Ventana emergente (dropdown) */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 shadow-md rounded-lg p-2">
              <button
                onClick={handleLogout}
                className="w-full text-left text-red-500 font-semibold py-2 px-4 rounded-md hover:bg-gray-100"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// Validación de props
Header.propTypes = {
  handleLogout: PropTypes.func.isRequired,
};