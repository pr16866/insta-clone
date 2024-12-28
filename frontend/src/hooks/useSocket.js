import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_APIURL || "http://localhost:3000";

const useSocket = () => {
  const { user } = useSelector(store => store.auth);
  const socketRef = useRef(null); // Persist socket instance across renders

  useEffect(() => {
    if (user?._id) {
      if (!socketRef.current) {
        // Initialize the socket if not already initialized
        socketRef.current = io(SOCKET_URL, {
          withCredentials: true,
          autoConnect: false,
          query: { userId: user._id },
        });

        socketRef.current.connect();

        socketRef.current.on("connect", () => {
          console.log("Connected with Socket ID:", socketRef.current.id);
        });

        socketRef.current.on("connect_error", (err) => {
          console.error("Socket connection error:", err);
        });
      }

      // Ensure the socket is connected if user changes
      if (!socketRef.current.connected) {
        socketRef.current.connect();
      }

      return () => {
        // Disconnect socket only when the component using this hook unmounts
        if (socketRef.current) {
          socketRef.current.disconnect();
          console.log("Socket disconnected");
        }
      };
    }
  }, [user?._id]);

  return socketRef.current; // Return the persistent socket instance
};

export default useSocket;
