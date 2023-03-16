import { CommentDatabase } from "../database/CommentDatabase";
import { GetCommentsInputDTO, GetCommentsOutputDTO } from "../dtos/commentDTO";
import { BadRequestError } from "../errors/BadRequestError";
import { Comment } from "../models/Comment";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";
import { CommentDB } from "../types";

export class CommentBusiness {
    constructor(
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
}