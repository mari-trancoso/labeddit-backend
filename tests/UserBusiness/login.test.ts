import {UserBusiness} from "../../src/business/UserBusiness"
import { LoginInputDTO, SignupInputDTO } from "../../src/dtos/userDTO"
import { BadRequestError } from "../../src/errors/BadRequestError"
import { NotFoundError } from "../../src/errors/NotFoundError"
import { HashManagerMock } from "../mocks/HashManagerMock"
import { IdGeneratorMock } from "../mocks/IdGeneratorMock"
import { TokenManagerMock } from "../mocks/TokenManagerMock"
import { UserDatabaseMock } from "../mocks/UserDatabaseMock"

describe("login", () => {
    const userBusiness = new UserBusiness(
        new UserDatabaseMock(),
        new IdGeneratorMock(),
        new TokenManagerMock(),
        new HashManagerMock()
    )

    test("deve disparar erro caso email não seja uma string", async() => {
        expect.assertions(2)

        try{
            const input: LoginInputDTO = {
                email: null,
                password: "bananinha"
            }
            await userBusiness.login(input)

        }catch(error){
            if(error instanceof BadRequestError){
                expect(error.message).toBe("'email' deve ser string")
                expect(error.statusCode).toBe(400)
            }

        }
    })

    test("deve disparar erro caso password não seja uma string", async() => {
        expect.assertions(2)

        try{
            const input: LoginInputDTO = {
                email: "example@email.com",
                password: null
            }
            await userBusiness.login(input)

        }catch(error){
            if(error instanceof BadRequestError){
                expect(error.message).toBe("'password' deve ser string")
                expect(error.statusCode).toBe(400)
            }

        }
    })

    test("deve disparar erro caso o email não seja encontrado", async () => {
        expect.assertions(1)
        try{
            const input: LoginInputDTO = {
                email: "null@email.com",
                password: "bananinha"
            }

            await userBusiness.login(input)

        }catch(error){
            if(error instanceof NotFoundError){
                expect(error.message).toBe("'email' não cadastrado")
            }
        }
    })

    test("deve disparar erro caso a password esteja errada", async () => {
        expect.assertions(1)
        try{
            const input: LoginInputDTO = {
                email: "normal@email.com",
                password: "bananinhaerrado"
            }

            await userBusiness.login(input)

        }catch(error){
            if(error instanceof BadRequestError){
                expect(error.message).toBe("'password' incorreto")
            }
        }
    })
})