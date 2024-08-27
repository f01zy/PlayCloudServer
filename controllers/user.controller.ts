import { ApiError } from "../exceptions/api.exception"
import { UserService } from "../service/user.service"
import { validationResult } from "express-validator"
import { Request, Response } from "express"
import { Types } from "mongoose";
import { Variables } from "../env/variables.env";
import { userModel } from "../models/user.model";
import { getDataFromRedis } from "../utils/getDataFromRedis.utils";
import { setDataToRedis } from "../utils/setDataToRedis.utils";
import { UploadedFile } from "express-fileupload";

interface IAuthRequestBody {
  username: string;
  email: string;
  password: string;
}

interface RequestBodyId {
  id: string,
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
      res.cookie("refreshToken", userData.refreshToken, { maxAge: 1000 * 60 * 60 * 24 * 30, httpOnly: true, secure: Variables.MODE == "development" ? false : false })
      return res.json(userData)
    } catch (e) {
      next(e)
    }
  }

  public async login(req: Request<{}, {}, Omit<IAuthRequestBody, "username">>, res: Response, next: Function) {
    try {
      const { email, password } = req.body
      const userData = await userService.login(email, password)
      res.cookie("refreshToken", userData.refreshToken, { maxAge: 1000 * 60 * 60 * 24 * 30, httpOnly: true, secure: Variables.MODE == "development" ? false : false })
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

      return res.redirect(Variables.CLIENT_URL)
    } catch (e) {
      next(e)
    }
  }

  public async refresh(req: Request, res: Response, next: Function) {
    try {
      const { refreshToken } = req.cookies
      const userData = await userService.refresh(refreshToken)
      res.cookie("refreshToken", userData.refreshToken, { maxAge: 1000 * 60 * 60 * 24 * 30, httpOnly: true, secure: Variables.MODE == "development" ? false : false })
      return res.json(userData)
    } catch (e) {
      next(e)
    }
  }

  public async getUserById(req: Request<RequestBodyId, {}, {}>, res: Response, next: Function) {
    try {
      const { id } = req.params

      if (!Types.ObjectId.isValid(id)) throw ApiError.NotFound()

      const redisData = await getDataFromRedis(id)
      if (redisData) return res.json(redisData)

      const user = await userModel.findById(id)

      if (!user) throw ApiError.NotFound()

      await setDataToRedis(id, await userService.populate(user))

      return res.json(await getDataFromRedis(id))
    } catch (e) {
      next(e)
    }
  }

  public async edit(req: Request, res: Response, next: Function) {
    try {
      if (!req.files || Object.keys(req.files).length === 0) return next(ApiError.BadRequest("Файлы не были переданы"))

      const { files } = req.files
      const { username } = req.body
      const { refreshToken } = req.cookies
      if (!username) throw ApiError.BadRequest("username не был передан")

      const user = await userService.edit(files as UploadedFile[], username, refreshToken)

      return res.json(user)
    } catch (e) {
      next(e)
    }
  }
}