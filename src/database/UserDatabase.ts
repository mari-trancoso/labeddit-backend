import { UserDB } from "../types";
import { BaseDatabase } from "./BaseDatabase";

export class UserDatabase extends BaseDatabase {
    public static TABLE_USERS = "users"

    public insert = async(userDB: UserDB) : Promise<void>=> {
        await BaseDatabase
            .connection(UserDatabase.TABLE_USERS)
            .insert(userDB)
    }


    public findByEmail = async(email: string) :Promise<UserDB | undefined> => {
        const result: UserDB[] = await BaseDatabase
            .connection(UserDatabase.TABLE_USERS)
            .select()
            .where({email})

        return result[0]
    }

    // public getAllUsers = async () => {
    //     const result: UserDB[] = await BaseDatabase
    //         .connection(UserDatabase.TABLE_USERS)
    //         .select()
            

    //         return result
    // }

    public async getAllUsers(q: string | undefined): Promise<UserDB[]> {
        if(q) {
            const result: UserDB[] = await BaseDatabase
                .connection(UserDatabase.TABLE_USERS)
                .where("name", "LIKE", `%${q}%`)
                .orWhere("id", "LIKE", `%${q}%`)
                return result
        } else {
            const result: UserDB[] = await BaseDatabase
                .connection(UserDatabase.TABLE_USERS)
            return result
        }
    }

}