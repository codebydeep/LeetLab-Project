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


const checkAdmin = async (req, res, next) => {
    try {
        const userId = req.user.id
        const user = await db.user.findUnique({
            where:{
                id: userId
            },
            select: {
                role : true
            }
        })

        if(!user || user.role !== "ADMIN"){
            return res.status(403).json({
                message: "Access Denied- Admins only"
            })
        }

        next();

    } catch (error) {
        console.error("Error checking Admin role:", error);
        res.status(500).json({
            message: "Error checking admin role"
        })
    }
}

export {authMiddleware, checkAdmin}