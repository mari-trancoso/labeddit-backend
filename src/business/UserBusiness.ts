import { UserDatabase } from "../database/UserDatabase"
import { LoginInputDTO, LoginOutputDTO, SignupInputDTO, SignupOutputDTO } from "../dtos/userDTO";
import { BadRequestError } from "../errors/BadRequestError";
import { NotFoundError } from "../errors/NotFoundError";
import { User } from "../models/User";
import { HashManager } from "../services/HashManager";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";
import { TokenPayload, UserDB, USER_ROLES } from "../types";

export class UserBusiness {
    constructor(
        private userDatabase: UserDatabase,
        private idGenerator: IdGenerator,
        private tokenManager: TokenManager,
        private hashManager: HashManager
    ) {}

    public signup = async (input: SignupInputDTO): Promise<SignupOutputDTO> => {
        const {nickname, email, password} = input

        if(typeof nickname !== "string"){
            throw new BadRequestError("'nickname' deve ser string")
        }
        if(typeof email !== "string"){
            throw new BadRequestError("'email' deve ser string")
        }
        if(typeof password !== "string"){
            throw new BadRequestError("'password' deve ser string")
        }

        const id = this.idGenerator.generate()

        const hashedPassword = await this.hashManager.hash(password)

        const newUser = new User(
            id,
            nickname,
            email,
            hashedPassword,
            USER_ROLES.NORMAL,
            new Date().toISOString()
        )

        const userDB = newUser.toDBModel()

        await this.userDatabase.insert(userDB)

        const payload: TokenPayload = {
            id: newUser.getId(),
            nickname: newUser.getNickname(),
            role: newUser.getRole()
        }

        const token = this.tokenManager.createToken(payload)

        const output: SignupOutputDTO = {
            token
        }

        return output
    }

    public login = async (input: LoginInputDTO): Promise<LoginOutputDTO> => {
        const { email, password} = input

        if(typeof email !== "string"){
            throw new BadRequestError("'email' deve ser string")
        }
        if(typeof password !== "string"){
            throw new BadRequestError("'password' deve ser string")
        }

        const userDB: UserDB | undefined = await this.userDatabase.findByEmail(email)

        if (!userDB){
            throw new NotFoundError("'email' não cadastrado")
        }

        const user = new User (
            userDB.id,
            userDB.nickname,
            userDB.email,
            userDB.password,
            userDB.role,
            userDB.created_at
        )
            
        const isPasswordCorrect = await this.hashManager
            .compare(password, user.getPassword())

        if(!isPasswordCorrect){
            throw new BadRequestError("'password' incorreto")
        }

        const payload: TokenPayload = {
            id: user.getId(),
            nickname: user.getNickname(),
            role: user.getRole()
        }

        const token = this.tokenManager.createToken(payload)

        const output: LoginOutputDTO = {
            token
        }

        return output
        
    }

    public getAllUsers = async (input: any)=> {
        
        const { q } = input

        const usersDB = await this.userDatabase.getAllUsers(q)

        const users: User[] = usersDB.map((userDB) => new User(
                userDB.id,
                userDB.nickname,
                userDB.email,
                userDB.password,
                userDB.role,
                userDB.created_at
        ))
    
        return users
    }

}