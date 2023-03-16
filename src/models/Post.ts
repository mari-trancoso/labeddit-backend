import { PostDB, PostModel } from "../types";

export class Post {
    constructor(
        private id: string,
        private content: string,
        private likes: number,
        private dislikes: number,
        private createdAt: string,
        private updatedAt: string,
        private comments: number,
        private creatorId: string,
        private creatorNickname: string
    ) {}

    public getId(): string {
        return this.id
    }
    public setId(value: string): void {
        this.id = value
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
    public getComments(): number {
        return this.comments
    }
    public setComments(value: number): void {
        this.comments = value
    }
    public addComments(){
        this.comments += 1
    }
    public removeComments(){
        this.comments -= 1
    }
    public getCreatorId(): string {
        return this.creatorId
    }
    public setCreatorId(value: string): void {
        this.creatorId = value
    }
    public getCreatorNickname(): string {
        return this.creatorNickname
    }
    public setCreatorNickname(value: string): void {
        this.creatorNickname = value
    }

    public toDBModel() : PostDB {
        return {
            id: this.id,
            creator_id: this.creatorId,
            content: this.content,
            likes: this.likes,
            dislikes: this.dislikes,
            created_at: this.createdAt,
            updated_at: this.updatedAt,
            comments: this.comments
        }
    }

    public toBusinessModel() : PostModel{
        return {
            id: this.id,
            content: this.content,
            likes: this.likes,
            dislikes: this.dislikes,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            comments: this.comments,
            creator: {
                id: this.creatorId,
                nickname: this.creatorNickname
            }
        }
    }
}