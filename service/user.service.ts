import { userModel } from "../models/user.model"
import { MailService } from "./mail.service"
import { TokenService } from "./token.service"
import { ApiError } from "../exceptions/api.exception"
import bcrypt from "bcrypt"
import { UserDto } from "../dtos/user.dto"
import { Document, Schema } from "mongoose"
import { IUser } from "../interfaces/user.interface"

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
    const activationLink = email

    const user = await userModel.create({ username, email, password: hashPassword, activationLink })

    await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`)

    const dto = new UserDto(await this.populate(user))
    const tokens = await tokenService.generateTokens({ ...dto })
    await tokenService.saveToken(dto._id, tokens.refreshToken)

    return {
      ...tokens,
      user: dto
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

    const dto = new UserDto(await this.populate(user))
    const tokens = await tokenService.generateTokens({ ...dto })
    await tokenService.saveToken(dto._id, tokens.refreshToken)

    return {
      ...tokens,
      user: dto
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

    const dto = new UserDto(await this.populate(user))
    const tokens = await tokenService.generateTokens({ ...dto })
    await tokenService.saveToken(dto._id, tokens.refreshToken)

    return {
      ...tokens,
      user: dto,
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