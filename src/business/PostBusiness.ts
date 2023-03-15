import { PostDatabase } from "../database/PostDatabase";
import { CreatePostsInputDTO, EditPostsInputDTO, GetPostsInputDTO, GetPostsOutputDTO } from "../dtos/postDTO";
import { BadRequestError } from "../errors/BadRequestError";
import { NotFoundError } from "../errors/NotFoundError";
import { Post } from "../models/Post";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";
import { PostDB, PostsWithCreatorDB } from "../types";

export class PostBusiness {
    constructor(
        private postDatabase: PostDatabase,
        private idGenerator: IdGenerator,
        private tokenManager: TokenManager
    ){}

    public getPosts = async(input: GetPostsInputDTO) :Promise<GetPostsOutputDTO> => {
        const {token} = input

        if(token === undefined){
            throw new BadRequestError("'token' ausente")
        }

        const payload = this.tokenManager.getPayload(token)

        if(payload === null){
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

    public createPost = async(input: CreatePostsInputDTO) :Promise<void> => {
        const {token, content} = input

        if(content === undefined){
            throw new BadRequestError("'content' deve ser string")
        }

        if(token === undefined){
            throw new BadRequestError("'token' ausente")
        }

        const payload = this.tokenManager.getPayload(token)

        if(payload === null){
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

    public editPost = async(input: EditPostsInputDTO) :Promise<void> => {
        const {token, content, idToEdit} = input

        if(typeof content !== "string"){
            throw new BadRequestError("'content' deve ser string")
        }

        if(token === undefined){
            throw new BadRequestError("'token' ausente")
        }

        const payload = this.tokenManager.getPayload(token)

        if(payload === null){
            throw new BadRequestError("'token' inválido")
        }

        const postDB: PostDB | undefined = await this.postDatabase.findById(idToEdit)

        if(!postDB){
            throw new NotFoundError("'id' não encontrado")
        }

        const creatorId = payload.id
        const creatorNickname = payload.nickname

        if(postDB.creator_id !== creatorId){
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
}