import { useEffect } from "react";
import { getCommunitySignalRConnection } from "../services/signalrService";

export const useCommunitySignalR = ({ loadFeed }) => {
    useEffect(() => {
        const conn = getCommunitySignalRConnection();

        if (!conn) return;

        conn.on("PostAdded", async () => {
            console.log("PostAdded");
            await loadFeed();
        });

        conn.on("PostDeleted", async () => {
            console.log("PostDeleted");
            await loadFeed();
        });

        conn.on("CommentAdded", async () => {
            console.log("CommentAdded");
            await loadFeed();
        });

        conn.on("CommentDeleted", async () => {
            console.log("CommentDeleted");
            await loadFeed();
        });

        conn.on("PostLikeChanged", async () => {
            console.log("PostLikeChanged");
            await loadFeed();
        });

        conn.on("CommentLikeChanged", async () => {
            console.log("CommentLikeChanged");
            await loadFeed();
        });

        return () => {
            conn.off("PostAdded");
            conn.off("PostDeleted");
            conn.off("CommentAdded");
            conn.off("CommentDeleted");
            conn.off("PostLikeChanged");
            conn.off("CommentLikeChanged");
        };
    }, [loadFeed]);
};