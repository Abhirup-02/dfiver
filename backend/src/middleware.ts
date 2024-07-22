import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'] ?? ''

    try {
        const decoded = jwt.verify(authHeader, JWT_SECRET)
        //@ts-ignore
        if (decoded.userID) {
            //@ts-ignore
            req.userID = decoded.userID
            return next()
        }
        else {
            res.status(403).json({
                message: 'You are not logged in'
            })
        }
    }
    catch (err) {
        res.status(403).json({
            error: 'Authentication Failed'
        })
    }
}