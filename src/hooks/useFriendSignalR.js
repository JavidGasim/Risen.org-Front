import { useEffect } from "react";
import { getFriendSignalRConnection } from "../services/signalrService";

export const useFriendSignalR = ({ refreshFriendships }) => {
    useEffect(() => {
        const conn = getFriendSignalRConnection();

        if (!conn) return;

        const onFriendRequestReceived = (data) => {
            console.log("FriendRequestReceived", data);
            refreshFriendships();
        };

        const onFriendRequestSent = (data) => {
            console.log("FriendRequestSent", data);
            refreshFriendships();
        };

        const onFriendRequestAccepted = (data) => {
            console.log("FriendRequestAccepted", data);
            refreshFriendships();
        };

        const onFriendRequestRejected = () => {
            console.log("FriendRequestRejected");
            refreshFriendships();
        };

        const onFriendRemoved = () => {
            console.log("FriendRemoved");
            refreshFriendships();
        };

        conn.on("FriendRequestReceived", onFriendRequestReceived);
        conn.on("FriendRequestSent", onFriendRequestSent);
        conn.on("FriendRequestAccepted", onFriendRequestAccepted);
        conn.on("FriendRequestRejected", onFriendRequestRejected);
        conn.on("FriendRemoved", onFriendRemoved);

        return () => {
            conn.off("FriendRequestReceived", onFriendRequestReceived);
            conn.off("FriendRequestSent", onFriendRequestSent);
            conn.off("FriendRequestAccepted", onFriendRequestAccepted);
            conn.off("FriendRequestRejected", onFriendRequestRejected);
            conn.off("FriendRemoved", onFriendRemoved);
        };
    }, [refreshFriendships]);
};