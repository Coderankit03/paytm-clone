import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"

function middleware(req: Request,res: Response,next: NextFunction){
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        res.status(403).json({message:"unauthorized user please signin"})
        return
    }

    const token = authHeader?.split(' ')[1];

    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET!) as {userId:string}
        if(decoded.userId){
            req.userId = decoded.userId
            next()
        }else{
            res.status(403).json({})
        }
    }catch(e){
        res.status(403).json({
            message: "session expired please signin"
        })
    }
}