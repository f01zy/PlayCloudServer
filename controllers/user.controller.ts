import { ApiError } from "../exceptions/api.exception"
import { UserService } from "../service/user.service"
import { validationResult } from "express-validator"
import { Request, Response } from "express"
import { Schema } from "mongoose";

interface IAuthRequestBody {
  username: string;
  email: string;
  password: string;
}

interface IAddToHistory {
  music: string
}

const userService = new UserService()

export class UserController {
  public async register(req: Request<{}, {}, IAuthRequestBody>, res: Response, next: Function) {
    try {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest("Ошибка валидации", errors.array()))
      }

      const { username, email, password } = req.body
      const userData = await userService.register(username, email, password)
      res.cookie("refreshToken", userData.refreshToken, { maxAge: 1000 * 60 * 60 * 24 * 30, httpOnly: false })
      return res.json(userData)
    } catch (e) {
      next(e)
    }
  }

  public async login(req: Request<{}, {}, Omit<IAuthRequestBody, "username">>, res: Response, next: Function) {
    try {
      const { email, password } = req.body
      const userData = await userService.login(email, password)
      res.cookie("refreshToken", userData.refreshToken, { maxAge: 1000 * 60 * 60 * 24 * 30, httpOnly: false })
      return res.json(userData)
    } catch (e) {
      next(e)
    }
  }

  public async logout(req: Request, res: Response, next: Function) {
    try {
      const { refreshToken } = req.cookies
      const token = await userService.logout(refreshToken)
      res.clearCookie("refreshToken")
      return res.json(token)
    } catch (e) {
      next(e)
    }
  }

  public async activate(req: Request, res: Response, next: Function) {
    try {
      const activationLink = req.params.link
      await userService.activate(activationLink)

      return res.json("success");
    } catch (e) {
      next(e)
    }
  }

  public async refresh(req: Request, res: Response, next: Function) {
    try {
      const { refreshToken } = req.cookies
      const userData = await userService.refresh(refreshToken)
      res.cookie("refreshToken", userData.refreshToken, { maxAge: 1000 * 60 * 60 * 24 * 30, httpOnly: false })
      return res.json(userData)
    } catch (e) {
      next(e)
    }
  }

  public async addToHistory(req: Request<{}, {}, IAddToHistory>, res: Response, next: Function) {
    try {
      const { refreshToken } = req.cookies
      const { music } = req.body
      const user = await userService.addToHistory(music as unknown as Schema.Types.ObjectId, refreshToken)
      return res.json(user)
    } catch (e) {
      next(e)
    }
  }
}