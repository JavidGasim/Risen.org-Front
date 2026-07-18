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

        conn.on("FriendRequestReceived", (data) => {
            console.log("FriendRequestReceived", data);
            refreshFriendships();
        });

        conn.on("FriendRequestSent", (data) => {
            console.log("FriendRequestSent", data);
            refreshFriendships();
        });

        conn.on("FriendRequestAccepted", (data) => {
            console.log("FriendRequestAccepted", data);
            refreshFriendships();
        });

        conn.on("FriendRequestRejected", () => {
            console.log("FriendRequestRejected");
            refreshFriendships();
        });

        conn.on("FriendRemoved", () => {
            console.log("FriendRemoved");
            refreshFriendships();
        });

        return () => {
            conn.off("FriendRequestReceived", refresh);
            conn.off("FriendRequestAccepted", refresh);
            conn.off("FriendRequestRejected", refresh);
            conn.off("FriendRemoved", refresh);
        };
    }, [refreshFriendships]);
};