"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.musicModel = void 0;
const mongoose_1 = require("mongoose");
const MusicSchema = new mongoose_1.Schema({
    author: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true }
});
exports.musicModel = (0, mongoose_1.model)("Music", MusicSchema);
