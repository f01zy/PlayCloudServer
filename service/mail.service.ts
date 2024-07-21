import nodemailer from "nodemailer"
import { Variables } from "../env/variables.env"

export class MailService {
  private transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: Variables.SMTP_HOST,
      port: Variables.SMTP_PORT,
      secure: true,
      auth: {
        user: Variables.SMTP_USER,
        pass: Variables.SMTP_USER_PASSWORD
      }
    })
  }

  public async sendActivationMail(to: string, link: string): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: `Активация аккаунта на PlayCloud`,
      text: "",
      html:
        `
      <div>
        <h1>Для активации аккаунта перейдите по ссылке</h1>
        <a href=${link}>Активировать</p>
      </div>
      `
    })
  }
}