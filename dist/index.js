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
exports.app = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const error_middleware_1 = __importDefault(require("./middlewares/error.middleware"));
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const router_1 = require("./router");
const mongoose_1 = __importDefault(require("mongoose"));
const variables_env_1 = require("./env/variables.env");
const path_1 = __importDefault(require("path"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
exports.app = (0, express_1.default)();
exports.app.use((0, express_fileupload_1.default)());
exports.app.use(express_1.default.json());
exports.app.use((0, cookie_parser_1.default)());
exports.app.use((0, cors_1.default)({
    credentials: true,
    origin: variables_env_1.Variables.CLIENT_URL
}));
exports.app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
exports.app.use("/api", router_1.router);
exports.app.use(error_middleware_1.default);
const server = http_1.default.createServer(exports.app);
const PORT = variables_env_1.Variables.PORT;
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(variables_env_1.Variables.DATABASE_URL);
        server.listen(PORT, () => {
            console.log(`[LOG] PlayCloud started in ${variables_env_1.Variables.MODE} mode`);
        });
    }
    catch (e) {
        console.log(e);
    }
});
start();
