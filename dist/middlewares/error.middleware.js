"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_exception_1 = require("../exceptions/api.exception");
exports.default = (err, req, res, next) => {
    console.log(err);
    if (err instanceof api_exception_1.ApiError) {
        return res.status(err.status).json(Object.assign({}, err));
    }
    return res.status(500).json({ message: "Непредвиденная ошибка" });
};
