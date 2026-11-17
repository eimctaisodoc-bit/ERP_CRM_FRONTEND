import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { logoutUser } from "../../api/auth.api";
import socket from "../../socket_client/scoket";

export const useOnlineUsersSocket = () => {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    const token = sessionStorage.getItem("Token");

    if (!token) {
      setIsConnected(false);
      return;
    }

    socket.auth = { token };

    if (!socket.connected) {
      socket.connect();
    }

    const handleUserStatus = (data) => {
      // console.log("📡 Users received:", data);

      const formattedUsers = data.map(([id, user]) => ({
        id,
        ...user
      }));

      queryClient.setQueryData(["onlineUsers"], formattedUsers);
    };

    const handleDisconnect = async (reason) => {
      // console.log(" Socket disconnected");

      setIsConnected(false);
      queryClient.setQueryData(["onlineUsers"], []);

      if (reason === "io server disconnect") {
        try {
          await logoutUser();
        } catch (error) {
          if (error?.response?.status !== 401) {
            console.error("Automatic logout error:", error);
          }
        }

        if (!sessionStorage.getItem("IsAutoLogOut")) {
          sessionStorage.setItem(
            "IsAutoLogOut",
            "Your session is no longer valid. Please log in again."
          );
        }
        sessionStorage.removeItem("Token");
        sessionStorage.removeItem("isToken");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        window.location.replace("/");
      }
    };

    const handleConnectError = async (error) => {
      if (error.message !== "Account disabled") return;

      try {
        await logoutUser();
      } catch (logoutError) {
        if (logoutError?.response?.status !== 401) {
          console.error("Automatic logout error:", logoutError);
        }
      }

      sessionStorage.removeItem("Token");
      sessionStorage.removeItem("isToken");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      window.location.replace("/");
    };

    const handleConnect = () => setIsConnected(true);

    const handleStaticNotifications = (notifications) => {
      queryClient.setQueryData(["notifications"], notifications);
    };

    const handleNotification = (notification) => {
      queryClient.setQueryData(["notifications"], (current = []) => [
        notification,
        ...current,
      ]);
    };

    socket.on("user:status", handleUserStatus);

    socket.on("notification:static", handleStaticNotifications);
    socket.on("notification:received", handleNotification);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("user:status", handleUserStatus);
      socket.off("notification:static", handleStaticNotifications);
      socket.off("notification:received", handleNotification);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
    };
  }, [queryClient]);

  return { isConnected };
};