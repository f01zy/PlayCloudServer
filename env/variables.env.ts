import { validate } from "../validation/variable.validation"

export class Variables {
  public static readonly SMTP_HOST: string = process.env.SMTP_HOST!
  public static readonly SMTP_PORT: number = Number(process.env.SMTP_PORT!)
  public static readonly SMTP_USER: string = process.env.SMTP_USER!
  public static readonly SMTP_USER_PASSWORD: string = process.env.SMTP_USER_PASSWORD!

  public static readonly JWT_ACCESS_SECRET: string = process.env.JWT_ACCESS_SECRET!
  public static readonly JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET!

  public static readonly DATABASE_URL: string = process.env.DATABASE_URL!
  public static readonly MODE: string = process.env.MODE!
  public static readonly PORT: string = process.env.PORT!
  public static readonly CLIENT_URL: string = process.env.CLIENT_URL!

  constructor() {
    this.initialise()
  }

  private initialise(): void {
    validate()
  }
}