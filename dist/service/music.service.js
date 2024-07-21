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
exports.MusicService = void 0;
const api_exception_1 = require("../exceptions/api.exception");
const token_service_1 = require("./token.service");
const music_model_1 = require("../models/music.model");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const user_service_1 = require("./user.service");
const user_dto_1 = require("../dtos/user.dto");
const tokenService = new token_service_1.TokenService();
const userService = new user_service_1.UserService();
class MusicService {
    create(files, name, refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield tokenService.getUserByRefreshToken(refreshToken);
            const musicCreated = yield music_model_1.musicModel.create({ author: user._id, name });
            if (files[0].name.endsWith("mp3")) {
                files[0].mv(path_1.default.join('static', "music", `${musicCreated._id}.mp3`));
                files[1].mv(path_1.default.join('static', "cover", `${musicCreated._id}.jpg`));
            }
            else {
                files[1].mv(path_1.default.join('static', "music", `${musicCreated._id}.mp3`));
                files[0].mv(path_1.default.join('static', "cover", `${musicCreated._id}.jpg`));
            }
            user.music.push(musicCreated.id);
            user.save();
            return new user_dto_1.UserDto(yield userService.populate(user));
        });
    }
    delete(id, refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield tokenService.getUserByRefreshToken(refreshToken);
            try {
                const music = (yield music_model_1.musicModel.findById(id));
                if (String(music.author) != String(user._id))
                    throw api_exception_1.ApiError.BadRequest("Вы не являетесь создателем песни");
                yield music_model_1.musicModel.findByIdAndDelete(id);
                fs_1.default.unlink(path_1.default.join('static', "music", `${music._id}.mp3`), () => { });
                fs_1.default.unlink(path_1.default.join('static', "cover", `${music._id}.jpg`), () => { });
                delete user.music[music.id];
                user.save();
                return new user_dto_1.UserDto(yield userService.populate(user));
            }
            catch (error) {
                throw api_exception_1.ApiError.BadRequest("Музыки с таким id не существует");
            }
        });
    }
}
exports.MusicService = MusicService;
