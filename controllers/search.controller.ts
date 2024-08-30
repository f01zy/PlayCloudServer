import { Request, Response } from "express";
import { ApiError } from "../exceptions/api.exception";
import { SearchService } from "../service/search.service";

const searchService = new SearchService()

export class SearchController {
  public async search(req: Request, res: Response, next: Function) {
    try {
      const q = req.query.q as string
      if (!q) throw ApiError.BadRequest("query не был указан")

      const music = await searchService.music(q)

      return res.json({ music })
    } catch (e) {
      next(e)
    }
  }
}