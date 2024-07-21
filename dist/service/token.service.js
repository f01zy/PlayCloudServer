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
exports.TokenService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const token_model_1 = require("../models/token.model");
const variables_env_1 = require("../env/variables.env");
const api_exception_1 = require("../exceptions/api.exception");
const user_model_1 = require("../models/user.model");
class TokenService {
    validateAccess(token) {
        try {
            const userData = jsonwebtoken_1.default.verify(token, variables_env_1.Variables.JWT_ACCESS_SECRET);
            return userData;
        }
        catch (e) {
            return null;
        }
    }
    validateRefresh(token) {
        try {
            const userData = jsonwebtoken_1.default.verify(token, variables_env_1.Variables.JWT_REFRESH_SECRET);
            return userData;
        }
        catch (e) {
            return null;
        }
    }
    generateTokens(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const accessToken = jsonwebtoken_1.default.sign(payload, variables_env_1.Variables.JWT_ACCESS_SECRET, { expiresIn: "30m" });
            const refreshToken = jsonwebtoken_1.default.sign(payload, variables_env_1.Variables.JWT_REFRESH_SECRET, { expiresIn: "30d" });
            return {
                accessToken,
                refreshToken
            };
        });
    }
    saveToken(userId, refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenData = yield token_model_1.tokenModel.findOne({ user: userId });
            if (tokenData) {
                tokenData.refreshToken = refreshToken;
                return tokenData.save();
            }
            const token = yield token_model_1.tokenModel.create({ user: userId, refreshToken });
            return token;
        });
    }
    removeToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield token_model_1.tokenModel.deleteOne({ refreshToken });
            return token;
        });
    }
    findToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield token_model_1.tokenModel.findOne({ refreshToken });
            return token;
        });
    }
    getUserByRefreshToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!refreshToken) {
                throw api_exception_1.ApiError.UnauthorizedError();
            }
            const userData = this.validateRefresh(refreshToken);
            const tokenDb = yield this.findToken(refreshToken);
            if (!tokenDb || !userData) {
                throw api_exception_1.ApiError.UnauthorizedError();
            }
            const user = yield user_model_1.userModel.findById(userData._id);
            if (!user) {
                throw api_exception_1.ApiError.BadRequest("Неверный токен");
            }
            return user;
        });
    }
}
exports.TokenService = TokenService;
