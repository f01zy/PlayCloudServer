import { Request, Response } from "express";
import { ApiError } from "../exceptions/api.exception";
import { SearchService } from "../service/search.service";

const searchService = new SearchService()

export class SearchController {
  public async search(req: Request, res: Response, next: Function) {
    try {
      const { q, page, size } = req.query
      if (!q) throw ApiError.BadRequest("query не был указан")

      const music = await searchService.music(String(q), parseInt(String(page)), parseInt(String(size)))

      return res.json({ results: music.results, total: music.length })
    } catch (e) {
      next(e)
    }
  }
}