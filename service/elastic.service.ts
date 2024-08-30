import { elastic } from "..";
import { IMusic } from "../interfaces/music.interface";
import { musicModel } from "../models/music.model";

export class ElasticService {
  private readonly pageSize = 100

  private async getMusic(page: number) {
    const skip = (page - 1) * this.pageSize

    const music = await musicModel.find()
      .skip(skip)
      .limit(this.pageSize)

    return music;
  }

  public async music() {
    let i = 0
    let page = 1;
    let count = 0;

    do {
      const data: Array<IMusic> = []
      const res = await this.getMusic(page)

      for (const music of res) { data.push(music) }

      count = res.length;

      try {
        const operations = data.flatMap(doc => [{ index: { _index: 'music' } }, doc])
        const pr = await elastic.bulk({ refresh: true, operations })
        Promise.all([pr])
        console.log(`[INFO] music pack number ${i} is loaded, ${pr.items.length} objects in ${res.length}`)
      } catch (error) { console.log(error) }
      i++
      page++
    } while (count === this.pageSize);
  }
}