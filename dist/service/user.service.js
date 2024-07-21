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
exports.UserService = void 0;
const user_model_1 = require("../models/user.model");
const mail_service_1 = require("./mail.service");
const token_service_1 = require("./token.service");
const api_exception_1 = require("../exceptions/api.exception");
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_dto_1 = require("../dtos/user.dto");
const mailService = new mail_service_1.MailService();
const tokenService = new token_service_1.TokenService();
class UserService {
    register(username, email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const candidateEmail = yield user_model_1.userModel.findOne({ email });
            if (candidateEmail) {
                throw api_exception_1.ApiError.BadRequest("Пользователь с таким email уже сушествует");
            }
            const candidateUsername = yield user_model_1.userModel.findOne({ username });
            if (candidateUsername) {
                throw api_exception_1.ApiError.BadRequest("Пользователь с таким username уже сушествует");
            }
            const hashPassword = yield bcrypt_1.default.hash(password, 3);
            const activationLink = email;
            const user = yield user_model_1.userModel.create({ username, email, password: hashPassword, activationLink });
            yield mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);
            const dto = new user_dto_1.UserDto(yield this.populate(user));
            const tokens = yield tokenService.generateTokens(Object.assign({}, dto));
            yield tokenService.saveToken(dto._id, tokens.refreshToken);
            return Object.assign(Object.assign({}, tokens), { user: dto });
        });
    }
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_model_1.userModel.findOne({ email });
            if (!user) {
                throw api_exception_1.ApiError.BadRequest("Пользователь с таким email не найден");
            }
            const isPass = yield bcrypt_1.default.compare(password, user.password);
            if (!isPass) {
                throw api_exception_1.ApiError.BadRequest("Неверный пароль");
            }
            const dto = new user_dto_1.UserDto(yield this.populate(user));
            const tokens = yield tokenService.generateTokens(Object.assign({}, dto));
            yield tokenService.saveToken(dto._id, tokens.refreshToken);
            return Object.assign(Object.assign({}, tokens), { user: dto });
        });
    }
    logout(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield tokenService.removeToken(refreshToken);
            return token;
        });
    }
    activate(activationLink) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_model_1.userModel.findOne({ activationLink });
            if (!user) {
                throw api_exception_1.ApiError.BadRequest("Неккоректная ссылка активации");
            }
            user.isActivated = true;
            yield user.save();
        });
    }
    refresh(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield tokenService.getUserByRefreshToken(refreshToken);
            const dto = new user_dto_1.UserDto(yield this.populate(user));
            const tokens = yield tokenService.generateTokens(Object.assign({}, dto));
            yield tokenService.saveToken(dto._id, tokens.refreshToken);
            return Object.assign(Object.assign({}, tokens), { user: dto });
        });
    }
    addToHistory(music, refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield tokenService.getUserByRefreshToken(refreshToken);
            const history = user.history.filter(historyMusic => historyMusic != music);
            history.unshift(music);
            const newUser = yield user_model_1.userModel.findOneAndUpdate({ _id: user._id, __v: user.__v }, { $set: { history } }, { new: true, runValidators: true });
            if (!newUser) {
                throw api_exception_1.ApiError.BadRequest("Неверный запрос");
            }
            return new user_dto_1.UserDto(yield this.populate(newUser));
        });
    }
    populate(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield user.populate([
                { path: "music", populate: "author" },
                { path: "liked", populate: "author" },
                { path: "history", populate: "author" }
            ]);
        });
    }
}
exports.UserService = UserService;
