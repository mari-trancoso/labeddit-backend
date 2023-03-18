import { UserDB, USER_ROLES } from "../../src/types";
import { BaseDatabase } from "../../src/database/BaseDatabase";

export class UserDatabaseMock extends BaseDatabase {
    public static TABLE_USERS = "users"

    public insert = async(userDB: UserDB) : Promise<void>=> {
        
    }

    public findByEmail = async(email: string) :Promise<UserDB | undefined> => {
        switch (email) {
            case "normal@email.com":
                return {
                    id: "id-mock",
                    nickname: "Normal Mock",
                    email: "normal@email.com",
                    password: "hash-bananinha",
                    created_at: new Date().toISOString(),
                    role: USER_ROLES.NORMAL
                }
            case "admin@email.com":
                return {
                    id: "id-mock",
                    nickname: "Admin Mock",
                    email: "admin@email.com",
                    password: "hash-bananinha",
                    created_at: new Date().toISOString(),
                    role: USER_ROLES.ADMIN
                }
            default:
                return undefined
    }}

}