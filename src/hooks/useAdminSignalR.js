import { useEffect } from "react";
import { getNotificationSignalRConnection } from "../services/signalrService";

export const useAdminSignalR = ({ fetchUsers }) => {
    useEffect(() => {
        const conn = getNotificationSignalRConnection();

        if (!conn) return;

        conn.on("RoleChanged", async (data) => {
            console.log("RoleChanged:", data);

            if (data?.token) {
                // optional token update logic
            }

            await fetchUsers();
        });

        conn.on("UsersUpdated", async () => {
            console.log("UsersUpdated");
            await fetchUsers();
        });

        return () => {
            conn.off("RoleChanged");
            conn.off("UsersUpdated");
        };
    }, [fetchUsers]);
};