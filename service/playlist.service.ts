import { Document } from "mongoose";
import { IMusic } from "../interfaces/music.interface";
import { IPlaylist } from "../interfaces/playlist.interface";
import { playlistModel } from "../models/playlist.model";
import { TokenService } from "./token.service";
import { ApiError } from "../exceptions/api.exception";

const tokenService = new TokenService()

export class PlaylistService {
  async create(refreshToken: string, name: string, description: string, tracks: Array<IMusic>) {
    const user = await tokenService.getUserByRefreshToken(refreshToken)
    const playlist = await playlistModel.create({ name, description, tracks, author: user })

    user.playlists.push(playlist.id)
    user.save()

    return playlist
  }

  async populate(playlist: Document<unknown, {}, IPlaylist> & IPlaylist) {
    return await playlist.populate([
      { path: "author" },
      { path: "tracks", populate: "author" },
    ])
  }
}