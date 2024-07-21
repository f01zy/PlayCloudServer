"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const envalid_1 = require("envalid");
const validate = () => {
    (0, envalid_1.cleanEnv)(process.env, {
        MODE: (0, envalid_1.str)({
            choices: ['development', 'production'],
        }),
        PORT: (0, envalid_1.port)({ default: 5050 }),
        DATABASE_URL: (0, envalid_1.str)(),
        JWT_ACCESS_SECRET: (0, envalid_1.str)(),
        JWT_REFRESH_SECRET: (0, envalid_1.str)(),
        SMTP_USER_PASSWORD: (0, envalid_1.str)(),
        SMTP_USER: (0, envalid_1.email)(),
        SMTP_PORT: (0, envalid_1.port)(),
        SMTP_HOST: (0, envalid_1.email)()
    });
};
exports.validate = validate;
