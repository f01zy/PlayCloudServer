export class Variables {
  public static readonly JWT_ACCESS_SECRET: string = process.env.JWT_ACCESS_SECRET!
  public static readonly JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET!

  public static readonly DATABASE_URL: string = process.env.DATABASE_URL!
  public static readonly MODE: "development" | "production" = process.env.MODE! as "development" | "production"
  public static readonly PORT: string = process.env.PORT!
  public static readonly SERVER_URL: string = `${this.MODE === "development" ? process.env.DEVELOPMENT_URL : process.env.PRODUCTION_URL}:5050`
  public static readonly CLIENT_URL: string = `${this.MODE === "development" ? process.env.DEVELOPMENT_URL : process.env.PRODUCTION_URL}:3000`
}