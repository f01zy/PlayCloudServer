import { cleanEnv, str, port, email } from "envalid"

export const validate = () => {
  cleanEnv(process.env, {
    MODE: str({
      choices: ['development', 'production'],
    }),
    PORT: port({ default: 5050 }),
    DATABASE_URL: str(),
    JWT_ACCESS_SECRET: str(),
    JWT_REFRESH_SECRET: str(),
    SMTP_USER_PASSWORD: str(),
    SMTP_USER: email(),
    SMTP_PORT: port(),
    SMTP_HOST: email()
  })
}