"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Variables = void 0;
const variable_validation_1 = require("../validation/variable.validation");
class Variables {
    constructor() {
        this.initialise();
    }
    initialise() {
        (0, variable_validation_1.validate)();
    }
}
exports.Variables = Variables;
Variables.SMTP_HOST = process.env.SMTP_HOST;
Variables.SMTP_PORT = Number(process.env.SMTP_PORT);
Variables.SMTP_USER = process.env.SMTP_USER;
Variables.SMTP_USER_PASSWORD = process.env.SMTP_USER_PASSWORD;
Variables.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
Variables.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
Variables.DATABASE_URL = process.env.DATABASE_URL;
Variables.MODE = process.env.MODE;
Variables.PORT = process.env.PORT;
Variables.CLIENT_URL = process.env.CLIENT_URL;
