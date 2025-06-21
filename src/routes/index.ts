import express from "express";
import userRouter from "./user"
import accountRouter from "./account"

const router = express.Router()

router.use("/user",userRouter)
router.use("/accounts",accountRouter)

export default router