import { elastic } from "..";
import { IMusic } from "../interfaces/music.interface";
import { musicModel } from "../models/music.model";

export class ElasticService {
  private readonly pageSize = 100

  public async music() {
    let i = 0

    const array = await musicModel.find()

    for (const music of array) {
      await elastic.index({ document: music, index: "music" })
      i++
      console.log(`[INFO] music \`${music._id}\` is loaded`)
    }
  }
}