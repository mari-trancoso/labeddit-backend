import { PostDatabase } from "../database/PostDatabase";
import { CreatePostsInputDTO, DeletePostsInputDTO, EditPostsInputDTO, GetPostsInputDTO, GetPostsOutputDTO, LikeOrDislikePostInputDTO } from "../dtos/postDTO";
import { BadRequestError } from "../errors/BadRequestError";
import { NotFoundError } from "../errors/NotFoundError";
import { Post } from "../models/Post";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";
import { LikeDislikeDB, PostDB, PostsWithCreatorDB, POST_LIKE } from "../types";

export class PostBusiness {
    constructor(
        private postDatabase: PostDatabase,
        private idGenerator: IdGenerator,
        private tokenManager: TokenManager
    ) { }

    public getPosts = async (input: GetPostsInputDTO): Promise<GetPostsOutputDTO> => {
        const { token } = input

        if (token === undefined) {
            throw new BadRequestError("'token' ausente")
        }

        const payload = this.tokenManager.getPayload(token)

        if (payload === null) {
            throw new BadRequestError("'token' inválido")
        }

        const postsWithCreatorDB: PostsWithCreatorDB[] = await this.postDatabase.postsWithCreator()

        const posts = postsWithCreatorDB.map((postWithCreatorDB) => {
            const post = new Post(
                postWithCreatorDB.id,
                postWithCreatorDB.content,
                postWithCreatorDB.likes,
                postWithCreatorDB.dislikes,
                postWithCreatorDB.created_at,
                postWithCreatorDB.updated_at,
                postWithCreatorDB.comments,
                postWithCreatorDB.creator_id,
                postWithCreatorDB.creator_nickname
            )

            return post.toBusinessModel()
        })

        const output: GetPostsOutputDTO = posts

        return output
    }

    public createPost = async (input: CreatePostsInputDTO): Promise<void> => {
        const { token, content } = input

        if (content === undefined) {
            throw new BadRequestError("'content' deve ser string")
        }

        if (token === undefined) {
            throw new BadRequestError("'token' ausente")
        }

        const payload = this.tokenManager.getPayload(token)

        if (payload === null) {
            throw new BadRequestError("'token' inválido")
        }

        const id = this.idGenerator.generate()
        const createdAt = new Date().toISOString()
        const updatedAt = new Date().toISOString()
        const creatorId = payload.id
        const creatorNickname = payload.nickname

        const post = new Post(
            id,
            content,
            0,
            0,
            createdAt,
            updatedAt,
            0,
            creatorId,
            creatorNickname

        )

        const postDB = post.toDBModel()

        await this.postDatabase.insert(postDB)
    }

    public editPost = async (input: EditPostsInputDTO): Promise<void> => {
        const { token, content, idToEdit } = input

        if (typeof content !== "string") {
            throw new BadRequestError("'content' deve ser string")
        }

        if (token === undefined) {
            throw new BadRequestError("'token' ausente")
        }

        const payload = this.tokenManager.getPayload(token)

        if (payload === null) {
            throw new BadRequestError("'token' inválido")
        }

        const postDB: PostDB | undefined = await this.postDatabase.findById(idToEdit)

        if (!postDB) {
            throw new NotFoundError("'id' não encontrado")
        }

        const creatorId = payload.id
        const creatorNickname = payload.nickname

        if (postDB.creator_id !== creatorId) {
            throw new BadRequestError("Somente quem criou o post pode editá-lo.")
        }

        const post = new Post(
            postDB.id,
            postDB.content,
            postDB.likes,
            postDB.dislikes,
            postDB.created_at,
            postDB.updated_at,
            postDB.comments,
            creatorId,
            creatorNickname
        )

        post.setContent(content)
        post.setUpdatedAt(new Date().toISOString())

        const updatedPostDB = post.toDBModel()

        await this.postDatabase.update(idToEdit, updatedPostDB)

    }

    public deletePost = async (input: DeletePostsInputDTO): Promise<void> => {
        const { token, idToDelete } = input

        if (token === undefined) {
            throw new BadRequestError("'token' ausente")
        }

        const payload = this.tokenManager.getPayload(token)

        if (payload === null) {
            throw new BadRequestError("'token' inválido")
        }

        const postDB: PostDB | undefined = await this.postDatabase.findById(idToDelete)

        if (!postDB) {
            throw new NotFoundError("'id' não encontrado")
        }

        const creatorId = payload.id

        if (postDB.creator_id !== creatorId) {
            throw new BadRequestError("Somente quem criou o post pode deletá-lo.")
        }

        await this.postDatabase.delete(idToDelete)

    }

    public likeOrDislikePost = async (input: LikeOrDislikePostInputDTO): Promise<void> => {
        const { token, like, idToLikeOrDislike } = input

        if (token === undefined) {
            throw new BadRequestError("'token' ausente")
        }

        const payload = this.tokenManager.getPayload(token)

        if (payload === null) {
            throw new BadRequestError("'token' inválido")
        }

        if (typeof like !== "boolean") {
            throw new BadRequestError("'like' deve ser booleano")
        }

        const postWithCreatorDB = await this.postDatabase.findPostsWithCreator(idToLikeOrDislike)

        if (!postWithCreatorDB) {
            throw new NotFoundError("'id' não encontrado")
        }

        const userId = payload.id
        const likeSQLite = like ? 1 : 0

        const likeDislike: LikeDislikeDB = {
            user_id: userId,
            post_id: postWithCreatorDB.id,
            like: likeSQLite
        }

        const postLikedOrDisliked = await this.postDatabase.findLikeDislike(likeDislike)

        const post = new Post(
            postWithCreatorDB.id,
            postWithCreatorDB.content,
            postWithCreatorDB.likes,
            postWithCreatorDB.dislikes,
            postWithCreatorDB.created_at,
            postWithCreatorDB.updated_at,
            postWithCreatorDB.comments,
            postWithCreatorDB.creator_id,
            postWithCreatorDB.creator_nickname
        )

        if (postLikedOrDisliked === POST_LIKE.ALREADY_LIKED) {
            if (like) {
                await this.postDatabase.removeLike(likeDislike)
                post.removeLikes()

            } else {
                await this.postDatabase.updateLikeDislike
                    (likeDislike)
                post.removeLikes()
                post.addDislikes()
            }
        } else if (postLikedOrDisliked === POST_LIKE.ALREADY_DISLIKED) {
            if (like) {
                await this.postDatabase.updateLikeDislike
                    (likeDislike)
                post.removeLikes()
                post.addLikes()

            } else {
                await this.postDatabase.removeLike(likeDislike)
                post.removeDislikes()

            }

        } else {
            await this.postDatabase.likeOrDislikePost(likeDislike)

            like ? post.addLikes() : post.addDislikes()

        }

        const updatPost = post.toDBModel()
        console.log("chegou na business")

        await this.postDatabase.update(idToLikeOrDislike, updatPost)


    }
}