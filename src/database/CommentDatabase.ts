import { CommentDB, CommentDBWithCreator, COMMENT_LIKE, LikeDislikeCommentDB, LikeDislikeDB, PostDB } from "../types"
import { BaseDatabase } from "./BaseDatabase"

export class CommentDatabase extends BaseDatabase {
    public static TABLE_COMMENTS = "comments"
    public static TABLE_POSTS = "posts"
    public static TABLE_USERS = "users"
    public static TABLE_COMMENTS_LIKES_DISLIKES = "comment_likes_dislikes"
    
    public async findCommentsByPostId(postId: string | undefined) : Promise<CommentDB[]> {
        const result: CommentDB[] = await BaseDatabase.connection(CommentDatabase.TABLE_COMMENTS)
            .where({  post_id: postId })
            console.log(result)

        return result
    }

    public commentsWithCreator = async (postId: string | undefined) : Promise<CommentDBWithCreator[]> => {
        const result: CommentDBWithCreator[] = await BaseDatabase
            .connection(CommentDatabase.TABLE_COMMENTS)
            .where({  post_id: postId })
            .select(
                "comments.id",
                "comments.creator_id",
                "comments.post_id",
                "comments.content",
                "comments.likes",
                "comments.dislikes",
                "comments.created_at",
                "comments.updated_at",
                "users.nickname AS creator_nickname"
            )
            .join("users", "comments.creator_id", "=", "users.id")

            // console.log(result)
            return result
    }

    public findById = async(postId: string): Promise<PostDB | undefined> => {
        const result = await BaseDatabase
            .connection(CommentDatabase.TABLE_POSTS)
            .select()
            .where({id: postId})
        
        console.log(postId)
        console.log(result)
        
        return result[0]
    }

    public findCommentsById = async(postId: string): Promise<CommentDB | undefined> => {
        const result = await BaseDatabase
            .connection(CommentDatabase.TABLE_COMMENTS)
            .select()
            .where({id: postId})
        
        console.log(postId)
        console.log(result)
        
        return result[0]
    }

    public findCommentsByIdToLikeOrDislike = async(idToLikeOrDislike: string): Promise<CommentDB | undefined> => {
        const result = await BaseDatabase
            .connection(CommentDatabase.TABLE_COMMENTS)
            .select()
            .where({id: idToLikeOrDislike})
        
        console.log(idToLikeOrDislike)
        console.log(result)
        
        return result[0]
    }

    public commentsWithPost = async () => {
        const result: CommentDB[] = await BaseDatabase
            .connection(CommentDatabase.TABLE_COMMENTS)
            .select(
                "comments.id",
                "comments.creator_id",
                "comments.post_id",
                "comments.content",
                "comments.likes",
                "comments.dislikes",
                "comments.created_at",
                "comments.updated_at",
                "users.nickname AS creator_nickname",
                "posts.id AS post_id"
            )
            .join("users", "comments.creator_id", "=", "users.id")
            .join("posts", "comments.post_id", "=", "posts.id")

            return result
    }

    public insert = async (commentDB: CommentDB): Promise<void> => {
        await BaseDatabase
            .connection(CommentDatabase.TABLE_COMMENTS)
            .insert(commentDB)
    }

    public delete = async(postIdToDelete: string) :Promise<void> => {
        await BaseDatabase
            .connection(CommentDatabase.TABLE_COMMENTS)
            .delete()
            .where({id: postIdToDelete})
    }

    public likeOrDislikeComment = async(likeDislike: LikeDislikeCommentDB) :Promise<void> => {
        await BaseDatabase
            .connection(CommentDatabase.TABLE_COMMENTS_LIKES_DISLIKES)
            .insert(likeDislike)
    }

    public findLikeDislike = async(likeDislikeDBtoFind: LikeDislikeCommentDB) :Promise<COMMENT_LIKE | null> => {
        const [likeDislikeDB]: LikeDislikeCommentDB[] = await BaseDatabase
            .connection(CommentDatabase.TABLE_COMMENTS_LIKES_DISLIKES)
            .select()
            .where({
                user_id: likeDislikeDBtoFind.user_id,
                comment_id: likeDislikeDBtoFind.comment_id
            })
        
        if(likeDislikeDB){
            return likeDislikeDB.like === 1 ? COMMENT_LIKE.ALREADY_LIKED : COMMENT_LIKE.ALREADY_DISLIKED
        } else{
            return null
        }
    }

    public removeLike = async (likeDislike: LikeDislikeCommentDB) : Promise<void>=> {
        await BaseDatabase
            .connection(CommentDatabase.TABLE_COMMENTS_LIKES_DISLIKES)
            .delete()
            .where({
                user_id: likeDislike.user_id,
                comment_id: likeDislike.comment_id
            })
    }

    public updateLikeDislike = async(likeDislike: LikeDislikeCommentDB) : Promise<void>=> {
        await BaseDatabase
            .connection(CommentDatabase.TABLE_COMMENTS_LIKES_DISLIKES)
            .update(likeDislike)
            .where({
                user_id: likeDislike.user_id,
                comment_id: likeDislike.comment_id
            })
    }

    public update = async(idToEdit: string, commentDB: CommentDB) :Promise<void> => {
        await BaseDatabase
            .connection(CommentDatabase.TABLE_COMMENTS)
            .update(commentDB)
            .where({id: idToEdit})
    }
}