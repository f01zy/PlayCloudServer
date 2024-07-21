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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusicController = void 0;
const api_exception_1 = require("../exceptions/api.exception");
const music_service_1 = require("../service/music.service");
const music_model_1 = require("../models/music.model");
const musicService = new music_service_1.MusicService();
class MusicController {
    create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.files || Object.keys(req.files).length === 0)
                    return next(api_exception_1.ApiError.BadRequest("Файлы не были переданы"));
                const { files } = req.files;
                const name = req.body.name;
                if (!name)
                    return next(api_exception_1.ApiError.BadRequest("Поле name не было указанно"));
                const { refreshToken } = req.cookies;
                const user = yield musicService.create(files, name, refreshToken);
                return res.json(user);
            }
            catch (e) {
                next(e);
            }
        });
    }
    delete(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.body.id;
                const { refreshToken } = req.cookies;
                if (!id)
                    return next(api_exception_1.ApiError.BadRequest("id песни не был указан"));
                const user = yield musicService.delete(id, refreshToken);
                return res.json(user);
            }
            catch (e) {
                next(e);
            }
        });
    }
    getOneMusic(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                if (!id)
                    return next(api_exception_1.ApiError.BadRequest("id песни не был указан"));
                const music = yield music_model_1.musicModel.findById(id);
                if (!music)
                    return next(api_exception_1.ApiError.BadRequest("Песни с указанным id не существует"));
                return res.json(music);
            }
            catch (e) {
                next(e);
            }
        });
    }
    getAllMusic(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const music = yield music_model_1.musicModel.find();
                return res.json(music);
            }
            catch (e) {
                next(e);
            }
        });
    }
}
exports.MusicController = MusicController;
