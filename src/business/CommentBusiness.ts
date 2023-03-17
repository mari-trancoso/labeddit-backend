import { CommentDatabase } from "../database/CommentDatabase";
import { PostDatabase } from "../database/PostDatabase";
import { CreateCommentInputDTO, DeleteCommentInputDTO, GetCommentsInputDTO, GetCommentsOutputDTO } from "../dtos/commentDTO";
import { BadRequestError } from "../errors/BadRequestError";
import { NotFoundError } from "../errors/NotFoundError";
import { Comment } from "../models/Comment";
import { Post } from "../models/Post";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";
import { CommentDB } from "../types";

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

}