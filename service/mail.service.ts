import axios from "axios"

const url = "https://api.smtp.bz/v1/smtp/send"

export class MailService {
  public async sendActivationMail(to: string, link: string) {
    try {
      const res = await axios.post(url, {
        subject: "Account activation on PlayCloud.",
        from: "no-reply@playcloud.com",
        to,
        html: `<div><h1>Для активации аккаунта перейдите по ссылке</h1><a href=${link}>Активировать</p></div>`
      })

      console.log(res.data)
    } catch (err) {
      console.log(err)
    }
  }
}