import { Request, Response } from "express";
import { MusicService } from "../service/music.service";
import { TokenService } from "../service/token.service";
import { PlaylistService } from "../service/playlist.service";
import { ApiError } from "../exceptions/api.exception";
import { Types } from "mongoose";

const musicService = new MusicService()
const tokenService = new TokenService()
const playlistService = new PlaylistService()

export class PlaylistController {
  public async create(req: Request, res: Response, next: Function) {
    try {
      const { name, description, tracks } = req.body

      console.log(name, description, tracks)

      if (!name || !description || !tracks) throw ApiError.BadRequest("Аргументы не были указанны")

      return

      const { refreshToken } = req.cookies

      const playlist = await playlistService.create(refreshToken, name, description, tracks)

      return res.json(await playlistService.populate(playlist))
    } catch (e) {
      next(e)
    }
  }
}