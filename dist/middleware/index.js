"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function middleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(403).json({ message: "unauthorized user please signin" });
        return;
    }
    const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (decoded.userId) {
            req.userId = decoded.userId;
            next();
        }
        else {
            res.status(403).json({});
        }
    }
    catch (e) {
        res.status(403).json({
            message: "session expired please signin"
        });
    }
}
exports.default = middleware;
