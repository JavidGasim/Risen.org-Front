import { useEffect } from "react";
import { getCookie } from "../utils/cookie";
import { startFriendSignalRConnection } from "../services/signalrService";

export const useFriendSignalR = ({ refreshFriendships }) => {
    useEffect(() => {
        let conn;

        const init = async () => {
            const token = getCookie("risen_token");
            if (!token) return;

            conn = await startFriendSignalRConnection(token);

            conn.on("FriendRequestReceived", refreshFriendships);
            conn.on("FriendRequestAccepted", refreshFriendships);
            conn.on("FriendRequestRejected", refreshFriendships);
            conn.on("FriendRemoved", refreshFriendships);
        };

        init();

        return () => {
            if (conn) {
                conn.off("FriendRequestReceived", refreshFriendships);
                conn.off("FriendRequestAccepted", refreshFriendships);
                conn.off("FriendRequestRejected", refreshFriendships);
                conn.off("FriendRemoved", refreshFriendships);
            }
        };
    }, [refreshFriendships]);
};