import { Request, Response } from "express";
import { PlaylistService } from "../service/playlist.service";
import { ApiError } from "../exceptions/api.exception";
import { Types } from "mongoose";
import { getDataFromRedis } from "../utils/getDataFromRedis.utils";
import { playlistModel } from "../models/playlist.model";
import { setDataToRedis } from "../utils/setDataToRedis.utils";
import { UserService } from "../service/user.service";

const userService = new UserService()
const playlistService = new PlaylistService()

export class PlaylistController {
  public async create(req: Request, res: Response, next: Function) {
    try {
      const { name, description, tracks } = req.body

      if (!name) throw ApiError.BadRequest("The name field is required")
      if (!description) throw ApiError.BadRequest("The description field is required")
      if (!tracks) throw ApiError.BadRequest("The tracks field is required")

      const { refreshToken } = req.cookies

      const playlist = await playlistService.create(refreshToken, name, description, tracks)

      return res.json(await playlistService.populate(playlist))
    } catch (e) {
      next(e)
    }
  }

  public async getOne(req: Request, res: Response, next: Function) {
    try {
      const { id } = req.params

      if (!Types.ObjectId.isValid(id)) throw ApiError.NotFound()

      const redisData = await getDataFromRedis(id)
      if (redisData) return res.json(redisData)

      const playlist = await playlistModel.findById(id)

      if (!playlist) throw ApiError.NotFound()

      await setDataToRedis(id, await playlistService.populate(playlist))

      return res.json(await getDataFromRedis(id))
    } catch (e) {
      next(e)
    }
  }

  public async save(req: Request, res: Response, next: Function) {
    try {
      const { id } = req.body
      const { refreshToken } = req.cookies

      if (!Types.ObjectId.isValid(id)) throw ApiError.NotFound()

      const playlist = await playlistService.save(refreshToken, id)

      return res.json(await playlistService.populate(playlist))
    } catch (e) {
      next(e)
    }
  }
}