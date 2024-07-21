import jwt from "jsonwebtoken"
import { tokenModel } from "../models/token.model"
import { IUser } from "../interfaces/user.interface"
import { Document } from "mongoose"
import { Variables } from "../env/variables.env"
import { ApiError } from "../exceptions/api.exception"
import { userModel } from "../models/user.model"

export class TokenService {
  public validateAccess(token: string) {
    try {
      const userData = jwt.verify(token, Variables.JWT_ACCESS_SECRET)
      return userData
    } catch (e) {
      return null
    }
  }

  public validateRefresh(token: string): Document<unknown, {}, IUser> & IUser | null {
    try {
      const userData = jwt.verify(token, Variables.JWT_REFRESH_SECRET)
      return userData as Document<unknown, {}, IUser> & IUser
    } catch (e) {
      return null
    }
  }

  public async generateTokens(payload: string | Omit<IUser, "activationLink" | "password">) {
    const accessToken = jwt.sign(payload, Variables.JWT_ACCESS_SECRET, { expiresIn: "30m" })
    const refreshToken = jwt.sign(payload, Variables.JWT_REFRESH_SECRET, { expiresIn: "30d" })

    return {
      accessToken,
      refreshToken
    }
  }

  public async saveToken(userId: string, refreshToken: string) {
    const tokenData = await tokenModel.findOne({ user: userId })

    if (tokenData) {
      tokenData.refreshToken = refreshToken

      return tokenData.save()
    }

    const token = await tokenModel.create({ user: userId, refreshToken })

    return token
  }

  public async removeToken(refreshToken: string) {
    const token = await tokenModel.deleteOne({ refreshToken })
    return token
  }

  public async findToken(refreshToken: string) {
    const token = await tokenModel.findOne({ refreshToken })
    return token
  }

  public async getUserByRefreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError()
    }

    const userData = this.validateRefresh(refreshToken)
    const tokenDb = await this.findToken(refreshToken)

    if (!tokenDb || !userData) {
      throw ApiError.UnauthorizedError()
    }

    const user = await userModel.findById(userData._id)

    if (!user) {
      throw ApiError.BadRequest("Неверный токен")
    }

    return user
  }
}