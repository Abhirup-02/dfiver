import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken'

const USER_JWT_SECRET = process.env.USER_JWT_SECRET!
const WORKER_JWT_SECRET = process.env.WORKER_JWT_SECRET!

export function userAuthMiddleware(req: Request, res: Response, next: NextFunction) {

    const sessionCookie = req.session!['dFiver'] ?? ''

    try {
        const decoded = jwt.verify(sessionCookie, USER_JWT_SECRET)
        //@ts-ignore
        if (decoded.userID) {
            //@ts-ignore
            req.userID = decoded.userID

            next()
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


export function workerAuthMiddleware(req: Request, res: Response, next: NextFunction) {

    const sessionCookie = req.session!['dFiver'] ?? ''

    try {
        const decoded = jwt.verify(sessionCookie, WORKER_JWT_SECRET)
        //@ts-ignore
        if (decoded.workerID) {
            //@ts-ignore
            req.workerID = decoded.workerID

            next()
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