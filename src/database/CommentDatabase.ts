import { CommentDB, PostDB } from "../types"
import { BaseDatabase } from "./BaseDatabase"

export class CommentDatabase extends BaseDatabase {
    public static TABLE_COMMENTS = "comments"
    public static TABLE_POSTS = "posts"
    public static TABLE_USERS = "users"
    public static TABLE_COMMENTS_LIKES_DISLIKES = "comment_likes_dislikes"

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
}