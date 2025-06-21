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
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const middleware_1 = __importDefault(require("../middleware"));
const router = express_1.default.Router();
const signupSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6, "password must be atleast 6 characters long"),
    firstName: zod_1.z.string().max(30),
    lastName: zod_1.z.string().max(30)
});
const updateUser = zod_1.z.object({
    firstName: zod_1.z.string().optional(),
    lastName: zod_1.z.string().optional(),
    password: zod_1.z.string().min(6).optional()
});
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, firstName, lastName } = req.body;
    const { success } = signupSchema.safeParse(req.body);
    // Basic validation
    if (!success) {
        res.status(400).json({ message: 'Incorrect inputs' });
        return;
    }
    // Check if user already exists
    const existingUser = yield database_1.User.findOne({
        email: email
    });
    if (existingUser) {
        res.status(409).json({ message: 'User already exists.' });
        return;
    }
    // Hash the password
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    // Save user
    const user = yield database_1.User.create({
        email,
        password: hashedPassword,
        firstName,
        lastName
    });
    const userId = user._id;
    yield database_1.Account.create({
        userId,
        balance: 1 + Math.random() * 10000
    });
    const token = jsonwebtoken_1.default.sign({
        userId,
    }, process.env.JWT_SECRET, // the '!' tells TypeScript you guarantee it's defined
    {
        expiresIn: "8h" // optional: token expiry
    });
    res.status(200).json({ message: "user signed in successfully", token: token });
}));
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    // Basic validation
    if (!email || !password) {
        res.status(400).json({ message: "Email and password are required." });
        return;
    }
    try {
        // Check if user exists
        const user = yield database_1.User.findOne({ email });
        if (!user) {
            res.status(401).json({ message: "Invalid email or password." });
            return;
        }
        // Compare password
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: "Invalid email or password." });
            return;
        }
        const token = jsonwebtoken_1.default.sign({
            userId: user._id,
        }, process.env.JWT_SECRET, // the '!' tells TypeScript you guarantee it's defined
        {
            expiresIn: "8h" // optional: token expiry
        });
        res.status(200).json({ message: "user signed in successfully", token: token });
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Server error.", error });
    }
}));
router.put("/", middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { success } = updateUser.safeParse(req.body);
    if (!success) {
        res.status(400).json({
            message: "error while updating information"
        });
        return;
    }
    yield database_1.User.updateOne({ _id: req.userId }, req.body);
    res.status(200).json({ message: "user updated successfully" });
}));
router.get("/bulk", middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filter = req.query.filter || "";
    const response = yield database_1.User.find({
        $or: [{
                firstName: {
                    "$regex": filter
                }
            }, {
                lastName: {
                    "$regex": filter
                }
            }]
    });
    res.json({
        user: response.map(user => ({
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    });
}));
exports.default = router;
