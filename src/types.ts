export enum USER_ROLES {
    NORMAL = "NORMAL",
    ADMIN = "ADMIN"
}

export interface TokenPayload {
    id: string,
	nickname: string,
    role: USER_ROLES
}

export interface PostModel {
    id: string,
    content: string,
    likes: number,
    dislikes: number,
    createdAt: string,
    updatedAt: string,
    comments: number,
    creator: {
        id: string,
        nickname: string
    }
}

export interface PostDB {
    id: string,
    creator_id: string,
    content: string,
    likes: number,
    dislikes: number,
    created_at: string,
    updated_at: string,
    comments: number
}

export interface PostsWithCreatorDB {
    id: string,
    creator_id: string,
    content: string,
    likes: number,
    dislikes: number,
    created_at: string,
    updated_at: string,
    comments: number,
    creator_nickname: string
}

export interface UserModel {
    id: string,
    nickname: string,
    email: string,
    password: string,
    role: USER_ROLES,
    createdAt: string
}

export interface UserDB {
    id: string,
    nickname: string,
    email: string,
    password: string,
    role: USER_ROLES,
    created_at: string
}

export interface CommentDB {
    id: string,
    creator_id: string,
    post_id: string,
    content: string,
    likes: number,
    dislikes: number,
    created_at: string,
    updated_at: string
}

export interface CommentModel {
    id: string,
    creatorId: string,
    postId: string,
    content: string,
    likes: number,
    dislikes: number,
    createdAt: string,
    updatedAt: string
}

export interface LikeDislikeDB {
    user_id: string,
    post_id: string,
    like: number
}

export enum POST_LIKE {
    ALREADY_LIKED = "already liked",
    ALREADY_DISLIKED = "already disliked"
}

export interface LikeDislikeCommentDB {
    user_id: string,
    comment_id: string,
    like: number
}

export enum COMMENT_LIKE {
    ALREADY_LIKED = "already liked",
    ALREADY_DISLIKED = "already disliked"
}

