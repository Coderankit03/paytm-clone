import express, { Request, Response } from "express";
import {User , Account } from "../db/database";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import middleware from "../middleware";


const router = express.Router()

const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6, "password must be atleast 6 characters long"),
    firstName: z.string().max(30),
    lastName: z.string().max(30)
})

const updateUser = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    password: z.string().min(6).optional()
})

router.post("/signup",async (req: Request,res: Response)=>{
    const {email, password, firstName, lastName} = req.body
     const {success} = signupSchema.safeParse(req.body)

  // Basic validation
  if (!success) {
    res.status(400).json({ message: 'Incorrect inputs' });
    return 
  }

  // Check if user already exists
  const existingUser = await User.findOne({
    email:email
  });

  if (existingUser) {
    res.status(409).json({ message: 'User already exists.' });
    return 
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Save user
  const user = await User.create({
    email,
    password:hashedPassword,
    firstName,
    lastName
  })

  const userId = user._id;

  await Account.create({
    userId,
    balance: 1 + Math.random() * 10000
  })

  const token = jwt.sign(
  {
    userId,
  },
  process.env.JWT_SECRET!, // the '!' tells TypeScript you guarantee it's defined
  {
    expiresIn: "8h" // optional: token expiry
  }
);

    res.status(200).json({ message: "user signed in successfully", token: token });
});


router.post("/signin", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required." });
    return 
  }

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
       res.status(401).json({ message: "Invalid email or password." });
       return 
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password." });
      return 
    }

    const token = jwt.sign(
  {
    userId: user._id,
  },
  process.env.JWT_SECRET!, // the '!' tells TypeScript you guarantee it's defined
  {
    expiresIn: "8h" // optional: token expiry
  }
);

    res.status(200).json({ message: "user signed in successfully", token: token });
    return
  } catch (error) {
    res.status(500).json({ message: "Server error.", error });
  }
});


router.put("/",middleware,async (req: Request, res: Response) => {
    const {success} = updateUser.safeParse(req.body)

    if(!success){
        res.status(400).json({
            message: "error while updating information"
        })
        return
    }

    await User.updateOne({ _id: req.userId},req.body)

    res.status(200).json({message: "user updated successfully"})
})


router.get("/bulk",middleware,async (req: Request, res: Response) => {
    const filter = req.query.filter || "";

    const response = await User.find({
        $or:[{
            firstName: {
                "$regex": filter
            }
        },{
            lastName: {
                "$regex": filter
            }
        }]
    })
    res.json({
            user: response.map(user => ({
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                _id: user._id
            }))
        })
})

export default router