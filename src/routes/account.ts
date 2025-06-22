import express, { Request, Response } from "express";
import { Account } from "../db/database";
import middleware from "../middleware";
import mongoose from "mongoose";

const router = express.Router();

router.get("/balance", middleware, async (req: Request, res: Response) => {
  const account = await Account.findOne({
    userId: req.userId,
  });

  res.status(200).json({
    balance: account?.balance,
  });
});

router.post("/transfer", middleware, async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const { to, amount } = req.body;
  const toString = String(to)

  if(!mongoose.Types.ObjectId.isValid(toString)){
    await session.abortTransaction();
    res.status(400).json({ message: "Invalid user ID format" });
    return
  }

  const toObjectId = new mongoose.Types.ObjectId(toString);

  const fromAccount = (await Account.findOne({ userId: req.userId }).session(
    session
  )) as { balance: Number };

  if (!fromAccount || fromAccount.balance < amount) {
    await session.abortTransaction();
    res.status(400).json({
      message: "Insufficient balance",
    });
    return;
  }

  const toAccount = await Account.findOne({ userId: toObjectId }).session(session);
  if (!toAccount) {
    await session.abortTransaction();
    res.status(400).json({
      message: "invalid user",
    });
    return;
  }

  //update balance in the acconts of both users
  await Account.updateOne(
    { userId: req.userId },
    { $inc: { balance: -amount } }
  ).session(session);
  await Account.updateOne(
    { userId: to },
    { $inc: { balance: amount } }
  ).session(session);

  await session.commitTransaction();

  res.status(200).json({
    message: "transaction successful",
  });
});
export default router;
