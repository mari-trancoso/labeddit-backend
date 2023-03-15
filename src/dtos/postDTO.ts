import { PostModel } from "../types"

export interface GetPostsInputDTO {
    token: string | undefined
}

export type GetPostsOutputDTO = PostModel[]

export interface CreatePostsInputDTO {
    token: string | undefined,
    content: string | undefined
}

export interface EditPostsInputDTO {
    idToEdit: string
    token: string | undefined,
    content: unknown
}

export interface DeletePostsInputDTO {
    idToDelete: string
    token: string | undefined,
}

export interface LikeOrDislikePostInputDTO {
    idToLikeOrDislike: string,
    token: string | undefined,
    like: unknown
}