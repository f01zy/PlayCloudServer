"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDto = void 0;
class UserDto {
    constructor(model) {
        this.username = model.username;
        this.email = model.email;
        this.isActivated = model.isActivated;
        this.liked = model.liked;
        this.music = model.music;
        this.history = model.history;
        this._id = String(model._id);
    }
}
exports.UserDto = UserDto;
