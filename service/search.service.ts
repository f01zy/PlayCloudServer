import { elastic } from "..";
import { IMusic } from "../interfaces/music.interface";

export class SearchService {
  public async music(q: string) {
    const res = await elastic.search<IMusic>({
      index: "place",
      query: {
        bool: {
          should: q.split(' ').map(word => ({
            wildcard: {
              name: `*${word}*`
            }
          })
          ),
          minimum_should_match: 1
        }
      },
    })

    return res.hits.hits
  }
}