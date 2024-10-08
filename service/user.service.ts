import { userModel } from "../models/user.model"
import { MailService } from "./mail.service"
import { TokenService } from "./token.service"
import { ApiError } from "../exceptions/api.exception"
import bcrypt from "bcrypt"
import { Document } from "mongoose"
import { IUser } from "../interfaces/user.interface"
import crypto from "crypto"
import { Variables } from "../env/variables.env"
import { FileArray, UploadedFile } from "express-fileupload"
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

    await mailService.sendActivationMail(email, Variables.SERVER_URL + "/auth/activate/" + activationLink)

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

  public async put(files: FileArray | null | undefined, body: any, refreshToken: string) {
    const user = await tokenService.getUserByRefreshToken(refreshToken)
    const filesArray = ["avatar", "banner"]

    const username = body.username
    const description = body.description
    const links: Array<string> = []

    if (files) {
      filesArray.map(fileArray => {
        const file = files[fileArray] as UploadedFile

        if (file) {
          const pathname = path.join('static', fileArray, `${user._id}.jpg`)
          file.mv(pathname);
          (user as any)[fileArray] = true
        }
      })
    }

    if (username) {
      if (username.length < 3) throw ApiError.BadRequest("Username error")

      const candidate = await userModel.findOne({ username })

      if (candidate) {
        throw ApiError.BadRequest("A user with this username already exists")
      }

      user.username = username
    }

    if (description) user.description = description

    for (let i = 0; i < 4; i++) {
      const link = body[`links[${i}]`]

      if (typeof link === "string" && link.trim().length > 0) {
        links.push(link)
      } else {
        break
      }
    }

    user.links = links

    return user.save()
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