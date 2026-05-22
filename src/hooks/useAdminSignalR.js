import { useEffect } from "react";
import { getSignalRConnection } from "../services/signalrService";

export const useAdminSignalR = ({ setUsers, fetchUsers }) => {
    useEffect(() => {
        const conn = getSignalRConnection();

        if (!conn) return;

        // ROLE CHANGE → user update
        conn.on("RoleChanged", async (data) => {
            console.log("RoleChanged:", data);

            if (data?.token) {
                // optional token update logic
            }

            await fetchUsers(); // simplest + safest
        });

        // GLOBAL REFRESH
        conn.on("UsersUpdated", async () => {
            console.log("UsersUpdated event received");
            await fetchUsers();
        });

        return () => {
            conn.off("RoleChanged");
            conn.off("UsersUpdated");
        };
    }, [setUsers, fetchUsers]);
};