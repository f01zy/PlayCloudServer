"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userModel = void 0;
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    isActivated: { type: Boolean, default: false },
    activationLink: { type: String, required: true },
    liked: [{ type: String, default: [], ref: "Music" }],
    music: [{ type: String, default: [], ref: "Music" }],
    history: [{ type: String, default: [], ref: "Music" }]
});
exports.userModel = (0, mongoose_1.model)("User", UserSchema);
