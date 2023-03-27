import { CommentModel, CommentModelWithCreator } from "../types"

export interface GetCommentsInputDTO {
    token: string | undefined
    postId: string
}

export type GetCommentsOutputDTO = CommentModelWithCreator[]

export interface CreateCommentInputDTO {
    token: string | undefined,
    postId: string,
    content: unknown
}

export interface EditCommentInputDTO {
    idToEdit: string
    token: string | undefined,
    content: unknown
}

export interface DeleteCommentInputDTO {
    idToDelete: string
    token: string | undefined,
}

export interface LikeOrDislikeCommentInputDTO {
    idToLikeOrDislike: string,
    token: string | undefined,
    like: unknown
}