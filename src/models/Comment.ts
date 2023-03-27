import { CommentDB, CommentModel, CommentModelWithCreator } from "../types";

export class Comment {
    constructor(
        private id: string,
        private creatorId: string,
        private postId: string,
        private content: string,
        private likes: number,
        private dislikes: number,
        private createdAt: string,
        private updatedAt: string
    ) {}

    public getId(): string {
        return this.id
    }
    public setId(value: string): void {
        this.id = value
    }
    public getCreatorId(): string {
        return this.creatorId
    }
    public setCreatorId(value: string): void {
        this.creatorId = value
    }
    public getPostId(): string {
        return this.postId
    }
    public setPostId(value: string): void {
        this.postId = value
    }
    public getContent(): string {
        return this.content
    }
    public setContent(value: string): void {
        this.content = value
    }
    public getLikes(): number {
        return this.likes
    }
    public setLikes(value: number): void {
        this.likes = value
    }
    public addLikes(){
        this.likes += 1
    }
    public removeLikes(){
        this.likes -= 1
    }
    public addDislikes(){
        this.dislikes += 1
    }
    public removeDislikes(){
        this.dislikes -= 1
    }
    public getDislikes(): number {
        return this.dislikes
    }
    public setDislikes(value: number): void {
        this.dislikes = value
    }
    public getCreatedAt(): string {
        return this.createdAt
    }
    public setCreatedAt(value: string): void {
        this.createdAt = value
    }
    public getUpdatedAt(): string {
        return this.updatedAt
    }
    public setUpdatedAt(value: string): void {
        this.updatedAt = value
    }

    public toDBModel() : CommentDB {
        return {
            id: this.id,
            creator_id: this.creatorId,
            post_id: this.postId,
            content: this.content,
            likes: this.likes,
            dislikes: this.dislikes,
            created_at: this.createdAt,
            updated_at: this.updatedAt
        }
    }

    public toBusinessModel() : CommentModel {
        return {
            id: this.id,
            creatorId: this.creatorId,
            postId: this.postId,
            content: this.content,
            likes: this.likes,
            dislikes: this.dislikes,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        }
    }

}