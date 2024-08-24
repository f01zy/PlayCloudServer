import { client } from ".."

export const setDataToRedis = async (key: string, value: any) => { await client.set(key, JSON.stringify(value), { EX: 60, NX: true }) }