import { useEffect } from "react";
import { getFriendSignalRConnection } from "../services/signalrService";

export const useFriendSignalR = ({ refreshFriendships }) => {
    useEffect(() => {
        console.log("Friend hook mounted");

        const conn = getFriendSignalRConnection();

        console.log(conn);


        if (!conn) return;



        const refresh = async () => {
            await refreshFriendships();
        };

        conn.on("FriendRequestReceived", refresh);
        conn.on("FriendRequestAccepted", refresh);
        conn.on("FriendRequestRejected", refresh);
        conn.on("FriendRemoved", refresh);

        return () => {
            conn.off("FriendRequestReceived", refresh);
            conn.off("FriendRequestAccepted", refresh);
            conn.off("FriendRequestRejected", refresh);
            conn.off("FriendRemoved", refresh);
        };
    }, [refreshFriendships]);
};