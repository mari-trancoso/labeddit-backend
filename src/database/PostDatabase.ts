import { LikeOrDislikeCommentInputDTO } from "../dtos/commentDTO";
import { LikeDislikeDB, PostDB, PostsWithCreatorDB, POST_LIKE } from "../types";
import { BaseDatabase } from "./BaseDatabase";

export class PostDatabase extends BaseDatabase {
    public static TABLE_POSTS = "posts"
    public static TABLE_POST_LIKES_DISLIKES = "post_likes_dislikes"

    public postsWithCreator = async () => {
        const result: PostsWithCreatorDB[] = await BaseDatabase
            .connection(PostDatabase.TABLE_POSTS)
            .select(
                "posts.id",
                "posts.creator_id",
                "posts.content",
                "posts.likes",
                "posts.dislikes",
                "posts.created_at",
                "posts.updated_at",
                "posts.comments",
                "users.nickname AS creator_nickname"
            )
            .join("users", "posts.creator_id", "=", "users.id")

            return result
    }

    public insert = async (postDB: PostDB): Promise<void> => {
        await BaseDatabase
            .connection(PostDatabase.TABLE_POSTS)
            .insert(postDB)
    }

    public findById = async(id: string): Promise<PostDB | undefined> => {
        const result: PostDB[] = await BaseDatabase
            .connection(PostDatabase.TABLE_POSTS)
            .select()
            .where({id})

        return result[0]
    }

    public update = async(idToEdit: string, postDB: PostDB) :Promise<void> => {
        await BaseDatabase
            .connection(PostDatabase.TABLE_POSTS)
            .update(postDB)
            .where({id: idToEdit})
    }

    public delete = async(idToDelete: string) :Promise<void> => {
        await BaseDatabase
            .connection(PostDatabase.TABLE_POSTS)
            .delete()
            .where({id: idToDelete})
    }

    public likeOrDislikePost = async(likeDislike: LikeDislikeDB) :Promise<void> => {
        await BaseDatabase
            .connection(PostDatabase.TABLE_POST_LIKES_DISLIKES)
            .insert(likeDislike)
    }

    public findPostsWithCreator = async (postId: string) :Promise<PostsWithCreatorDB | undefined>=> {
        const result: PostsWithCreatorDB[] = await BaseDatabase
            .connection(PostDatabase.TABLE_POSTS)
            .select(
                "posts.id",
                "posts.creator_id",
                "posts.content",
                "posts.likes",
                "posts.dislikes",
                "posts.created_at",
                "posts.updated_at",
                "posts.comments",
                "users.nickname AS creator_nickname"
            )
            .join("users", "posts.creator_id", "=", "users.id")
            .where("posts.id", postId)

            return result[0]
    }

    public findLikeDislike = async(likeDislikeDBtoFind: LikeDislikeDB) :Promise<POST_LIKE | null> => {
        const [likeDislikeDB]: LikeDislikeDB[] = await BaseDatabase
            .connection(PostDatabase.TABLE_POST_LIKES_DISLIKES)
            .select()
            .where({
                user_id: likeDislikeDBtoFind.user_id,
                post_id: likeDislikeDBtoFind.post_id
            })
        
        if(likeDislikeDB){
            return likeDislikeDB.like === 1 ? POST_LIKE.ALREADY_LIKED : POST_LIKE.ALREADY_DISLIKED
        } else{
            return null
        }
    }

    public removeLike = async (likeDislike: LikeDislikeDB) : Promise<void>=> {
        await BaseDatabase
            .connection(PostDatabase.TABLE_POST_LIKES_DISLIKES)
            .delete()
            .where({
                user_id: likeDislike.user_id,
                post_id: likeDislike.post_id
            })
    }

    public updateLikeDislike = async(likeDislike: LikeDislikeDB) : Promise<void>=> {
        await BaseDatabase
            .connection(PostDatabase.TABLE_POST_LIKES_DISLIKES)
            .update(likeDislike)
            .where({
                user_id: likeDislike.user_id,
                post_id: likeDislike.post_id
            })
    }

}
