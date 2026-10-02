// src/hooks/useAuth.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMe, loginUser, logoutUser, userById } from "../../api/auth.api";
import { socket } from "../../socket_client/scoket";

export const useAuth = (userId) => {

    const queryClient = useQueryClient();

    const isHomePage = location.pathname === '/'
    // console.log(isHomePage)
    const useMe = useQuery({
        queryKey: ["me"],
        queryFn: getMe,
        retry: false,
        staleTime: 0,
        enabled: !isHomePage,
        refetchOnReconnect: true, // automatically refetch after network loss
        refetchOnWindowFocus: true,
    });


    const login = useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            queryClient.setQueryData(["auth-user"], data.user);
        },
    });

    // 🚪 Logout
    const logout = useMutation({
        mutationFn: logoutUser,
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ["me"] });
            queryClient.clear(); // clear all cached data
            socket.disconnect();
        },
    });

    const MewithID = useQuery({
        queryKey: ["user", userId],
        queryFn: () => userById(userId),
        retry: false,
        staleTime: 5 * 60 * 1000,
        enabled: Boolean(userId) && !isHomePage,
        refetchOnReconnect: true, // automatically refetch after network loss
        refetchOnWindowFocus: true,
    });
    return {
        useMe,
        isAuthLoading: useMe.isLoading,
        login,
        logout,
        MewithID
    };
};
