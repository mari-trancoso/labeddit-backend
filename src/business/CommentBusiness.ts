import { CommentDatabase } from "../database/CommentDatabase";
import { PostDatabase } from "../database/PostDatabase";
import { CreateCommentInputDTO, DeleteCommentInputDTO, GetCommentsInputDTO, GetCommentsOutputDTO, LikeOrDislikeCommentInputDTO } from "../dtos/commentDTO";
import { BadRequestError } from "../errors/BadRequestError";
import { NotFoundError } from "../errors/NotFoundError";
import { Comment } from "../models/Comment";
import { Post } from "../models/Post";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";
import { CommentDB, COMMENT_LIKE, LikeDislikeCommentDB, LikeDislikeDB } from "../types";

export class CommentBusiness {
    constructor(
        private postDatabase: PostDatabase,
        private commentDatabase: CommentDatabase,
        private idGenerator: IdGenerator,
        private tokenManager: TokenManager
    ) { }

    public getComments = async (input: GetCommentsInputDTO): Promise<GetCommentsOutputDTO> => {
        const { token, id } = input

        if (token === undefined) {
            throw new BadRequestError("'token' ausente")
        }

        const payload = this.tokenManager.getPayload(token)

        if (payload === null) {
            throw new BadRequestError("'token' inválido")
        }

        const commentsWithPostDB: CommentDB[] = await this.commentDatabase.commentsWithPost()

        const comments = commentsWithPostDB.map((commentWithPostDB) => {
            const comment = new Comment(
                commentWithPostDB.id,
                commentWithPostDB.creator_id,
                commentWithPostDB.post_id,
                commentWithPostDB.content,
                commentWithPostDB.likes,
                commentWithPostDB.dislikes,
                commentWithPostDB.created_at,
                commentWithPostDB.updated_at
            )

            return comment.toBusinessModel()
        })

        const output: GetCommentsOutputDTO = comments

        return output
    }

    public createComments = async (input: CreateCommentInputDTO): Promise<void> => {
        const { token, postId, content } = input

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

        const postExist = await this.commentDatabase.findById(postId)

        if(!postExist){
            throw new NotFoundError("'id' não encontrado")
        }

        const creatorIdPost = payload.id
        const creatorNickname = payload.nickname

        const post = new Post(
            postExist.id,
            postExist.content,
            postExist.likes,
            postExist.dislikes,
            postExist.created_at,
            postExist.updated_at,
            postExist.comments,
            creatorIdPost,
            creatorNickname
        )

        const id = this.idGenerator.generate()
        const createdAt = new Date().toISOString()
        const updatedAt = new Date().toISOString()
        const creatorId = payload.id

        const comment = new Comment(
            id,
            creatorId,
            postId,
            content,
            0,
            0,
            createdAt,
            updatedAt
        )

        const commentDB = comment.toDBModel()

        await this.commentDatabase.insert(commentDB)

        post.addComments()
        const updatedPostDB = post.toDBModel()

        await this.postDatabase.update(postId, updatedPostDB)
    }

    public deleteComments = async (input: DeleteCommentInputDTO): Promise<void> => {
        const { token, idToDelete } = input

        if (token === undefined) {
            throw new BadRequestError("'token' ausente")
        }

        const payload = this.tokenManager.getPayload(token)

        if (payload === null) {
            throw new BadRequestError("'token' inválido")
        }

        const commentsExist = await this.commentDatabase.findCommentsById(idToDelete)

        if(!commentsExist){
            throw new NotFoundError("'id' não encontrado")
        }

        const creatorId = payload.id

        if (commentsExist.creator_id !== creatorId) {
            throw new BadRequestError("Somente quem criou o comentário pode deletá-lo.")
        }

        await this.commentDatabase.delete(idToDelete)

        console.log(commentsExist)
        
        const postId = commentsExist.post_id

        const postExist = await this.commentDatabase.findById(postId)

        if(!postExist){
            throw new NotFoundError("'id' não encontrado")
        }

        const creatorIdPost = payload.id
        const creatorNickname = payload.nickname

        const post = new Post(
            postExist.id,
            postExist.content,
            postExist.likes,
            postExist.dislikes,
            postExist.created_at,
            postExist.updated_at,
            postExist.comments,
            creatorIdPost,
            creatorNickname
        )

        post.removeComments()
        const updatedPostDB = post.toDBModel()

        await this.postDatabase.update(postId, updatedPostDB)

    }

    public likeOrDislikeComment = async (input: LikeOrDislikeCommentInputDTO): Promise<void> => {
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

        const commentWithCreatorDB = await this.commentDatabase.findCommentsByIdToLikeOrDislike(idToLikeOrDislike)

        if (!commentWithCreatorDB) {
            throw new NotFoundError("'id' não encontrado")
        }

        const userId = payload.id
        const likeSQLite = like ? 1 : 0

        const likeDislike: LikeDislikeCommentDB = {
            user_id: userId,
            comment_id: idToLikeOrDislike,
            like: likeSQLite
        }

        const commentLikedOrDisliked = await this.commentDatabase.findLikeDislike(likeDislike)

        const comment = new Comment(
            commentWithCreatorDB.id,
            commentWithCreatorDB.creator_id,
            commentWithCreatorDB.post_id,
            commentWithCreatorDB.content,
            commentWithCreatorDB.likes,
            commentWithCreatorDB.dislikes,
            commentWithCreatorDB.created_at,
            commentWithCreatorDB.updated_at,
        )

        if (commentLikedOrDisliked === COMMENT_LIKE.ALREADY_LIKED) {
            if (like) {
                await this.commentDatabase.removeLike(likeDislike)
                comment.removeLikes()

            } else {
                await this.commentDatabase.updateLikeDislike
                    (likeDislike)
                comment.removeLikes()
                comment.addDislikes()
            }
        } else if (commentLikedOrDisliked === COMMENT_LIKE.ALREADY_DISLIKED) {
            if (like) {
                await this.commentDatabase.updateLikeDislike
                    (likeDislike)
                comment.removeLikes()
                comment.addLikes()

            } else {
                await this.commentDatabase.removeLike(likeDislike)
                comment.removeDislikes()

            }

        } else {
            await this.commentDatabase.likeOrDislikeComment(likeDislike)

            like ? comment.addLikes() : comment.addDislikes()

        }

        const updatComment = comment.toDBModel()
        console.log("chegou na business")

        await this.commentDatabase.update(idToLikeOrDislike, updatComment)


    }

}