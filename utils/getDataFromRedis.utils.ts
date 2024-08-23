import { client } from ".."

export const getDataFromRedis = async (key: string) => { const data = await client.get(key); if (!data) return; return JSON.parse(data) }