import { CommentBusiness } from "../business/CommentBusiness";
import { CreateCommentInputDTO, DeleteCommentInputDTO, GetCommentsInputDTO } from "../dtos/commentDTO";
import { Request, Response } from "express";
import { BaseError } from "../errors/BaseError";

export class CommentController {
    constructor(
        private commentBusiness: CommentBusiness
    ) { }

    public getComments = async (req: Request, res: Response) => {
        try {
            const input: GetCommentsInputDTO = {
                token: req.headers.authorization,
                id: req.params.id
            }

            const output = await this.commentBusiness.getComments(input)

            res.status(200).send(output)

        } catch (error) {
            console.log(error)
            if (error instanceof BaseError) {
                res.status(error.statusCode).send(error.message)
            } else {
                res.status(500).send("Erro inesperado")
            }
        }
    }

    public createComments = async (req: Request, res: Response) => {
        try {
            const input: CreateCommentInputDTO = {
                token: req.headers.authorization,
                postId: req.params.id,
                content: req.body.content
            }

            await this.commentBusiness.createComments(input)

            res.status(201).end()

        } catch (error) {
            console.log(error)
            if (error instanceof BaseError) {
                res.status(error.statusCode).send(error.message)
            } else {
                res.status(500).send("Erro inesperado")
            }
        }
    }

    public deleteComments = async (req: Request, res: Response) => {
        try {
            const input: DeleteCommentInputDTO = {
                token: req.headers.authorization,
                idToDelete: req.params.id,
            }

            await this.commentBusiness.deleteComments(input)

            res.status(200).end()

        } catch (error) {
            console.log(error)
            if (error instanceof BaseError) {
                res.status(error.statusCode).send(error.message)
            } else {
                res.status(500).send("Erro inesperado")
            }
        }
    }
}