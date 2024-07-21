import { Request, Response } from "express";
import { ApiError } from "../exceptions/api.exception";
import { MusicService } from "../service/music.service";
import { UploadedFile } from "express-fileupload"
import { musicModel } from "../models/music.model";

interface RequestBodyCreate {
  name: string,
  refreshToken: string
}

interface RequestBodyDelete {
  id: string,
}

interface RequestBodyGet {
  id: string,
}

const musicService = new MusicService()

export class MusicController {
  public async create(req: Request<{}, {}, RequestBodyCreate>, res: Response, next: Function) {
    try {
      if (!req.files || Object.keys(req.files).length === 0)
        return next(ApiError.BadRequest("Файлы не были переданы"))

      const { files } = req.files

      const name = req.body.name

      if (!name) return next(ApiError.BadRequest("Поле name не было указанно"))

      const { refreshToken } = req.cookies

      const user = await musicService.create(files as UploadedFile[], name, refreshToken)

      return res.json(user)
    } catch (e) {
      next(e)
    }
  }

  public async delete(req: Request<{}, {}, RequestBodyDelete>, res: Response, next: Function) {
    try {
      const id = req.body.id
      const { refreshToken } = req.cookies

      if (!id) return next(ApiError.BadRequest("id песни не был указан"))

      const user = await musicService.delete(id, refreshToken)

      return res.json(user)
    } catch (e) {
      next(e)
    }
  }

  public async getOneMusic(req: Request<RequestBodyGet, {}, {}>, res: Response, next: Function) {
    try {
      const id = req.params.id

      if (!id) return next(ApiError.BadRequest("id песни не был указан"))

      const music = await musicModel.findById(id)

      if (!music) return next(ApiError.BadRequest("Песни с указанным id не существует"))

      return res.json(music)
    } catch (e) {
      next(e)
    }
  }

  public async getAllMusic(req: Request, res: Response, next: Function) {
    try {
      const music = await musicModel.find()

      return res.json(music)
    } catch (e) {
      next(e)
    }
  }
}