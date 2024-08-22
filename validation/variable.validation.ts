import { cleanEnv, str, port, email, url } from "envalid"

export const validate = () => {
  cleanEnv(process.env, {
    SMTP_HOST: email(),
    SMTP_PORT: port(),
    SMTP_USER: email(),
    SMTP_USER_PASSWORD: str(),
    JWT_ACCESS_SECRET: str(),
    JWT_REFRESH_SECRET: str(),

    PORT: port({ default: 5050 }),
    DATABASE_URL: str(),
    MODE: str({
      choices: ['development', 'production'],
    }),
    PRODUCTION_URL: url(),
    DEVELOPMENT_URL: url()
  })
}