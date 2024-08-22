import { userModel } from "../models/user.model"
import { MailService } from "./mail.service"
import { TokenService } from "./token.service"
import { ApiError } from "../exceptions/api.exception"
import bcrypt from "bcrypt"
import { UserDto } from "../dtos/user.dto"
import { Document } from "mongoose"
import { IUser } from "../interfaces/user.interface"
import uuid from "uuid"
import { Variables } from "../env/variables.env"

const mailService = new MailService()
const tokenService = new TokenService()

export class UserService {
  public async register(username: string, email: string, password: string) {
    const candidateEmail = await userModel.findOne({ email })

    if (candidateEmail) {
      throw ApiError.BadRequest("Пользователь с таким email уже сушествует")
    }

    const candidateUsername = await userModel.findOne({ username })

    if (candidateUsername) {
      throw ApiError.BadRequest("Пользователь с таким username уже сушествует")
    }

    const hashPassword = await bcrypt.hash(password, 3)
    const activationLink = uuid.v4()

    try { await mailService.sendActivationMail(email, Variables.SERVER_URL + "/auth/activate/" + activationLink) } catch { }

    const user = await userModel.create({ username, email, password: hashPassword, activationLink })

    const tokens = await tokenService.generateTokens(user.id)
    await tokenService.saveToken(user.id, tokens.refreshToken)

    return {
      ...tokens,
      user: new UserDto(await this.populate(user))
    }
  }

  public async login(email: string, password: string) {
    const user = await userModel.findOne({ email })

    if (!user) {
      throw ApiError.BadRequest("Пользователь с таким email не найден")
    }

    const isPass = await bcrypt.compare(password, user.password)

    if (!isPass) {
      throw ApiError.BadRequest("Неверный пароль")
    }

    const tokens = await tokenService.generateTokens(user.id)
    await tokenService.saveToken(user.id, tokens.refreshToken)

    return {
      ...tokens,
      user: new UserDto(await this.populate(user))
    }
  }

  public async logout(refreshToken: string) {
    const token = await tokenService.removeToken(refreshToken)
    return token
  }

  public async activate(activationLink: string) {
    const user = await userModel.findOne({ activationLink })

    if (!user) {
      throw ApiError.BadRequest("Неккоректная ссылка активации")
    }

    user.isActivated = true
    await user.save()
  }

  public async refresh(refreshToken: string) {
    const user = await tokenService.getUserByRefreshToken(refreshToken)

    const tokens = await tokenService.generateTokens(user.id)
    await tokenService.saveToken(user.id, tokens.refreshToken)

    return {
      ...tokens,
      user: new UserDto(await this.populate(user))
    }
  }

  public async populate(user: Document<unknown, {}, IUser> & IUser) {
    return await user.populate([
      { path: "music", populate: "author" },
      { path: "liked", populate: "author" },
      { path: "history", populate: "author" }
    ])
  }
}