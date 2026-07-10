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

        conn.on("CommentAdded", (data) => {

            setPosts(prev =>
                prev.map(post => {

                    if (post.id !== data.postId)
                        return post;

                    if ((post.comments || []).some(c => c.id === data.comment.id))
                        return post;

                    return {
                        ...post,
                        commentCount: data.commentCount,
                        comments: [...(post.comments || []), data.comment]
                    };
                })
            );

        });
        conn.on("CommentDeleted", (data) => {

            setPosts(prev =>
                prev.map(post =>
                    post.id === data.postId
                        ? {
                            ...post,
                            commentCount: data.commentCount,
                            comments: (post.comments || []).filter(
                                c => c.id !== data.commentId
                            )
                        }
                        : post
                )
            );

        });

        conn.on("CommentLikeChanged", (data) => {

            setPosts(prev =>
                prev.map(post => ({
                    ...post,
                    comments: (post.comments || []).map(comment =>
                        comment.id === data.commentId
                            ? {
                                ...comment,
                                likeCount: data.likeCount
                            }
                            : comment
                    )
                }))
            );

            if (data.userId === currentId) {

                setLikedComments(prev => {

                    if (data.isLiked) {

                        if (prev.some(x => x.commentId === data.commentId))
                            return prev;

                        return [
                            ...prev,
                            {
                                commentId: data.commentId
                            }
                        ];
                    }

                    return prev.filter(x => x.commentId !== data.commentId);

                });

            }

        });

        return () => {

            conn.off("PostAdded");
            conn.off("PostDeleted");
            conn.off("PostLikeChanged");

            conn.off("CommentAdded");
            conn.off("CommentDeleted");
            conn.off("CommentLikeChanged");
        };

    }, [currentId]);

};