import React, { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useUserContext } from "./Usercontext";
import { showInfo } from "../components/ToastMessage";

const SocketContext = createContext();

export const useSocketContext = () => useContext(SocketContext);

const SOCKET_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "");

export const SocketProvider = ({ children }) => {
  const { user } = useUserContext();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("order-status-updated", (data) => {
      showInfo(data.message || `Order status updated to: ${data.status}`);
      window.dispatchEvent(new CustomEvent("order-updated", { detail: data }));
    });

    socket.on("new-order", (data) => {
      showInfo(data.message || "New order received!");
      window.dispatchEvent(new CustomEvent("new-order", { detail: data }));
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
};
