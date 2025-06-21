"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Account = exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
try {
    const conn = mongoose_1.default.connect("mongodb+srv://ankitya1608:deBvnG937XImQkSi@paytm-cluster.qiuhcjb.mongodb.net/");
}
catch (e) {
    console.log(e);
}
exports.User = mongoose_1.default.model('User', new mongoose_1.default.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        minLength: 3,
        maxLength: 30,
        lowewrcase: true
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    firstName: {
        type: String,
        required: true,
        maxLength: 30,
    },
    lastName: {
        type: String,
        required: true,
        maxLength: 30,
    }
}));
exports.Account = mongoose_1.default.model('Account', new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    balance: {
        type: Number,
        required: true
    }
}));
