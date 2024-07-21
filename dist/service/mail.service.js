"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const variables_env_1 = require("../env/variables.env");
class MailService {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            host: variables_env_1.Variables.SMTP_HOST,
            port: variables_env_1.Variables.SMTP_PORT,
            secure: true,
            auth: {
                user: variables_env_1.Variables.SMTP_USER,
                pass: variables_env_1.Variables.SMTP_USER_PASSWORD
            }
        });
    }
    sendActivationMail(to, link) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.transporter.sendMail({
                from: process.env.SMTP_USER,
                to,
                subject: `Активация аккаунта на PlayCloud`,
                text: "",
                html: `
      <div>
        <h1>Для активации аккаунта перейдите по ссылке</h1>
        <a href=${link}>Активировать</p>
      </div>
      `
            });
        });
    }
}
exports.MailService = MailService;
