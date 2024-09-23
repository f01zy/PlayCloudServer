import { userModel } from "../models/user.model"
import { MailService } from "./mail.service"
import { TokenService } from "./token.service"
import { ApiError } from "../exceptions/api.exception"
import bcrypt from "bcrypt"
import { Document } from "mongoose"
import { IUser } from "../interfaces/user.interface"
import crypto from "crypto"
import { Variables } from "../env/variables.env"
import { UploadedFile } from "express-fileupload"
import path from "path"
import fs from "fs"

const mailService = new MailService()
const tokenService = new TokenService()

export class UserService {
  public async register(username: string, email: string, password: string) {
    const candidateEmail = await userModel.findOne({ email })

    if (candidateEmail) {
      throw ApiError.BadRequest("A user with this email already exists")
    }

    const candidateUsername = await userModel.findOne({ username })

    if (candidateUsername) {
      throw ApiError.BadRequest("A user with this username already exists")
    }

    const hashPassword = await bcrypt.hash(password, 3)
    const activationLink = crypto.randomBytes(10).toString('hex').slice(0, 10);

    try { await mailService.sendActivationMail(email, Variables.SERVER_URL + "/auth/activate/" + activationLink) } catch { console.log("Error: mail not sended", activationLink) }

    const user = await userModel.create({ username, email, password: hashPassword, activationLink })

    const tokens = await tokenService.generateTokens(user.id)
    await tokenService.saveToken(user.id, tokens.refreshToken)

    return {
      ...tokens,
      user: await this.populate(user)
    }
  }

  public async login(email: string, password: string) {
    const user = await userModel.findOne({ email })

    if (!user) {
      throw ApiError.BadRequest("The user with this email was not found")
    }

    const isPass = await bcrypt.compare(password, user.password)

    if (!isPass) {
      throw ApiError.BadRequest("Incorrect password")
    }

    const tokens = await tokenService.generateTokens(user.id)
    await tokenService.saveToken(user.id, tokens.refreshToken)

    return {
      ...tokens,
      user: await this.populate(user)
    }
  }

  public async logout(refreshToken: string) {
    const token = await tokenService.removeToken(refreshToken)
    return token
  }

  public async activate(activationLink: string) {
    const user = await userModel.findOne({ activationLink })

    if (!user) {
      throw ApiError.BadRequest("Non-direct activation link")
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
      user: await this.populate(user)
    }
  }

  public async editBanner(banner: UploadedFile, refreshToken: string) {
    const user = await tokenService.getUserByRefreshToken(refreshToken)
    const pathname = path.join("static", "banner", `${user._id}.jpg`)

    banner.mv(pathname)

    user.banner = true
    user.save()

    return user
  }

  public async editAvatar(avatar: UploadedFile, refreshToken: string) {
    const user = await tokenService.getUserByRefreshToken(refreshToken)
    const pathname = path.join('static', "avatar", `${user._id}.jpg`)

    avatar.mv(pathname)

    user.avatar = true
    user.save()

    return user
  }

  public async editUsername(username: string, refreshToken: string) {
    const user = await tokenService.getUserByRefreshToken(refreshToken)
    const candidate = await userModel.findOne({ username })

    if (candidate) throw ApiError.BadRequest("A user with this username already exists")

    user.username = username
    user.save()

    return user
  }

  public async populate(user: Document<unknown, {}, IUser> & IUser) {
    return await user.populate([
      { path: "tracks", populate: "author" },
      { path: "likes", populate: "author" },
      { path: "history", populate: "author" },
      { path: "playlists", populate: [{ path: "author" }, { path: "tracks", populate: "author" }] }
    ])
  }
}