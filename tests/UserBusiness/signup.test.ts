import {UserBusiness} from "../../src/business/UserBusiness"
import { SignupInputDTO } from "../../src/dtos/userDTO"
import { BadRequestError } from "../../src/errors/BadRequestError"
import { HashManagerMock } from "../mocks/HashManagerMock"
import { IdGeneratorMock } from "../mocks/IdGeneratorMock"
import { TokenManagerMock } from "../mocks/TokenManagerMock"
import { UserDatabaseMock } from "../mocks/UserDatabaseMock"

describe("signup", () => {
    const userBusiness = new UserBusiness(
        new UserDatabaseMock(),
        new IdGeneratorMock(),
        new TokenManagerMock(),
        new HashManagerMock()
    )

    test("cadastro bem-sucedido retorna token", async () => {
        const input: SignupInputDTO = {
            email: "example@email.com",
            nickname: "Example Mock",
            password: "bananinha"
        }

        const response = await userBusiness.signup(input)
        expect(response.token).toBe("token-mock-normal")
    })

    test("deve disparar erro caso email não seja uma string", async() => {
        expect.assertions(2)

        try{
            const input: SignupInputDTO = {
                email: null,
                nickname: "Example Mock",
                password: "bananinha"
            }
            await userBusiness.signup(input)

        }catch(error){
            if(error instanceof BadRequestError){
                expect(error.message).toBe("'email' deve ser string")
                expect(error.statusCode).toBe(400)
            }

        }
    })

    test("deve disparar erro caso nickname não seja uma string", async() => {
        expect.assertions(2)

        try{
            const input: SignupInputDTO = {
                email: "example@email.com",
                nickname: null,
                password: "bananinha"
            }
            await userBusiness.signup(input)

        }catch(error){
            if(error instanceof BadRequestError){
                expect(error.message).toBe("'nickname' deve ser string")
                expect(error.statusCode).toBe(400)
            }

        }
    })

    test("deve disparar erro caso password não seja uma string", async() => {
        expect.assertions(2)

        try{
            const input: SignupInputDTO = {
                email: "example@email.com",
                nickname: "Example Mock",
                password: null
            }
            await userBusiness.signup(input)

        }catch(error){
            if(error instanceof BadRequestError){
                expect(error.message).toBe("'password' deve ser string")
                expect(error.statusCode).toBe(400)
            }

        }
    })
})