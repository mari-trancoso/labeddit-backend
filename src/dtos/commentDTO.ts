import { CommentModel } from "../types"

export interface GetCommentsInputDTO {
    token: string | undefined
}

export type GetCommentsOutputDTO = CommentModel[]

export interface CreateCommentInputDTO {
    token: string | undefined
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