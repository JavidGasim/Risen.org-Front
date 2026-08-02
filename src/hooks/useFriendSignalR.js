import { useEffect } from "react";
import { getFriendSignalRConnection } from "../services/signalrService";

export const useFriendSignalR = ({ refreshFriendships }) => {
    useEffect(() => {
        console.log("Friend hook mounted");

        let cleanup = null;
        let retryTimer = null;
        let canceled = false;

        const attachHandlers = (conn) => {
            if (!conn) return null;

            console.log("Friend SignalR connection available", conn);

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
        };

        const setupConnection = () => {
            const conn = getFriendSignalRConnection();

            if (!conn) {
                if (!canceled) {
                    retryTimer = window.setTimeout(setupConnection, 500);
                }
                return;
            }

            cleanup = attachHandlers(conn);
        };

        setupConnection();

        return () => {
            canceled = true;
            if (retryTimer) {
                window.clearTimeout(retryTimer);
            }
            if (cleanup) {
                cleanup();
            }
        };
    }, [refreshFriendships]);
};