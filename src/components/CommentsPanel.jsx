import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import io from "socket.io-client";

const CommentsPanel = ({ isOpen, onClose, taskId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [socket, setSocket] = useState(null);

  // Cargar comentarios y conectar a Socket.IO
  useEffect(() => {
    if (isOpen) {
      // Cargar comentarios iniciales
      const fetchComments = async () => {
        try {
          const response = await fetch(
            `http://localhost:5000/api/tasks/${taskId}/comments`,
            {
              method: "GET",
              credentials: "include",
            }
          );

          if (response.ok) {
            const data = await response.json();
            setComments(data.comments || []);
          } else {
            console.error("Error al cargar comentarios:", await response.json());
            setComments([]);
          }
        } catch (err) {
          console.error("Error al cargar comentarios:", err);
          setComments([]);
        }
      };

      fetchComments();

      // Conectar a Socket.IO
      const newSocket = io("http://localhost:5000", {
        withCredentials: true,
      });

      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("Conectado a Socket.IO");
        newSocket.emit("join_task", taskId);
      });

      newSocket.on("new_comment", (comment) => {
        setComments((prevComments) => [...prevComments, comment]);
      });

      newSocket.on("disconnect", () => {
        console.log("Desconectado de Socket.IO");
      });

      newSocket.on("connect_error", (error) => {
        console.error("Error de conexión con Socket.IO:", error);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isOpen, taskId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/tasks/${taskId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ text: newComment }),
        }
      );

      if (response.ok) {
        // No necesitamos agregar el comentario manualmente aquí porque Socket.IO lo hará
        setNewComment("");
      } else {
        console.error("Error al agregar comentario:", await response.json());
        alert("Error al agregar el comentario.");
      }
    } catch (err) {
      console.error("Error al agregar comentario:", err);
      alert("Error al conectar con el servidor.");
    }
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="p-4 h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Comentarios</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto mb-4">
          {comments.length === 0 ? (
            <p className="text-gray-500">No hay comentarios todavía.</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="mb-3 p-3 bg-gray-100 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm">{comment.user}</span>
                  <span className="text-xs text-gray-500">{comment.date}</span>
                </div>
                <p className="text-sm mt-1">{comment.text}</p>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleAddComment} className="flex flex-col space-y-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escribe un comentario..."
            className="p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows="3"
          />
          <button
            type="submit"
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
          >
            Agregar Comentario
          </button>
        </form>
      </div>
    </div>
  );
};

CommentsPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  taskId: PropTypes.number.isRequired,
};

export default CommentsPanel;