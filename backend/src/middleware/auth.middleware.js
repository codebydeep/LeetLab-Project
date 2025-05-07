import jwt from "jsonwebtoken"
import { db } from "../libs/db.js";

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.jwt

        if(!token){
            return res.status(401).json({
                success: false,
                message: "UnAuthorized - No token provided!"
            })
        }

        let decoded;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);

        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "UnAuthorized - Invalid token"
            })
        }

        const user = await db.user.findUnique({
            where: {
                id: decoded.id
            },

            select: {
                id: true,
                image: true,
                name: true,
                email: true,
                role: true,
            }
        });

        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found!"
            })
        }

        req.user = user;
        next();

    } 
    
    catch (error) {
        return res.status(500).json({
                success: false,
                message: "UnAuthorized - Invalid token"
        })
    }
}

export default authMiddleware