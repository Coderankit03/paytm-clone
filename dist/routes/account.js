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
const express_1 = __importDefault(require("express"));
const database_1 = require("../db/database");
const middleware_1 = __importDefault(require("../middleware"));
const mongoose_1 = __importDefault(require("mongoose"));
const router = express_1.default.Router();
router.get("/balance", middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const account = yield database_1.Account.findOne({
        userId: req.userId,
    });
    res.status(200).json({
        balance: account === null || account === void 0 ? void 0 : account.balance,
    });
}));
router.post("/transfer", middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    const { to, amount } = req.body;
    const toString = String(to);
    if (!mongoose_1.default.Types.ObjectId.isValid(toString)) {
        yield session.abortTransaction();
        res.status(400).json({ message: "Invalid user ID format" });
        return;
    }
    const toObjectId = new mongoose_1.default.Types.ObjectId(toString);
    const fromAccount = (yield database_1.Account.findOne({ userId: req.userId }).session(session));
    if (!fromAccount || fromAccount.balance < amount) {
        yield session.abortTransaction();
        res.status(400).json({
            message: "Insufficient balance",
        });
        return;
    }
    const toAccount = yield database_1.Account.findOne({ userId: toObjectId }).session(session);
    if (!toAccount) {
        yield session.abortTransaction();
        res.status(400).json({
            message: "invalid user",
        });
        return;
    }
    //update balance in the acconts of both users
    yield database_1.Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount } }).session(session);
    yield database_1.Account.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session);
    yield session.commitTransaction();
    res.status(200).json({
        message: "transaction successful",
    });
}));
exports.default = router;
