import { useEffect } from "react";
import { getCommunitySignalRConnection } from "../services/signalrService";

export const useCommunitySignalR = ({
    setPosts,
    setLikedPosts,
    setLikedComments,
    currentId
}) => {

    useEffect(() => {

        const conn = getCommunitySignalRConnection();

        if (!conn) return;

        // NEW POST
        conn.on("PostAdded", (post) => {

            setPosts(prev => {

                if (prev.some(x => x.id === post.id))
                    return prev;

                return [post, ...prev];
            });

        });

        // DELETE POST
        conn.on("PostDeleted", ({ postId }) => {

            setPosts(prev =>
                prev.filter(x => x.id !== postId)
            );

        });

        // LIKE / DISLIKE POST
        conn.on("PostLikeChanged", (data) => {

            setPosts(prev =>
                prev.map(post =>
                    post.id === data.postId
                        ? {
                            ...post,
                            likeCount: data.likeCount
                        }
                        : post
                )
            );

            if (data.userId === currentId) {

                setLikedPosts(prev => {

                    if (data.isLiked) {

                        if (prev.some(x => x.postId === data.postId))
                            return prev;

                        return [
                            ...prev,
                            {
                                postId: data.postId
                            }
                        ];
                    }

                    return prev.filter(x => x.postId !== data.postId);

                });

            }

        });

        return () => {

            conn.off("PostAdded");
            conn.off("PostDeleted");
            conn.off("PostLikeChanged");

        };

    }, [currentId]);

};