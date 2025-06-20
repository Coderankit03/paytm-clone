import { Request } from "express";

declare module "express" {
    interface Request {
        userId?: string; // Make it optional if needed
    }
}