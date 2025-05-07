import bcrypt from "bcryptjs"
import {db} from "../libs/db.js"
import { UserRole } from "../generated/prisma/index.js"
import jwt from "jsonwebtoken"

// register controller -
const register = async (req, res) => {
    const {email, password, name} = req.body

    if(!name || !email || !password){
        return res.status(400).json({
            success: false,
            message: "All fields are required!"
        })
    }

    try {
        const existingUser = await db.user.findUnique({
            where: {
                email
            }
        })

        if(existingUser){
            return res.status(400).json({
                success: false,
                message: "User already exists"
            })
        }

        const hashedToken = await bcrypt.hash(password, 10)

        const newUser = await db.user.create({
            data: {
                email,
                password: hashedToken,
                name,
                role:UserRole.USER
            }
        })

        const token = jwt.sign({id: newUser.id}, process.env.JWT_SECRET, 
            {
                expiresIn: "7d"
            }
        )

        res.cookie("jwt", token, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "development",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        return res.status(201).json({
            success: true,
            message: "User Created Successfully!",
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role,
                image: newUser.image
            }
        })

    } catch (error) {
        return res.status(501).json({
            success: false,
            error: "Internal Server Error in Registering User--"
        })
    }
}

// login controller -
const login = async (req, res) => {
    const {email, password} = req.body

    if(!email || !password){
        return res.status(400).json({
            success: false,
            message: "All fields are required!"
        })
    }

    try {
        const user = await db.user.findUnique({
            where: {
                email
            }
        })

        if(!user){
            return res.status(401).json({
                success: false,
                message: "User not found!"
            })
        }

        const isMatched = await bcrypt.compare(password, user.password)

        if(!isMatched){
            return res.status(400).json({
                success: false,
                message: "Invalid Password!"
            })
        }

        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        )

        res.cookie("jwt", token, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "development",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        return res.status(201).json({
            success: true,
            message: "User LoggedIn Successfully!",
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                image: user.image
            }
        })

        
    } catch (error) {
        console.log(error);
        
        return res.status(501).json({
            success: false,
            message: "Error in User LoggedIn!",
        })
    }
}

// logout controller -
const logout = async (req, res) => {
    try {
        res.clearCookie("jwt", {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "development",
        })

        return res.status(200).json({
            success: true,
            message: "User LoggedOut Successfully!",
        })

    } catch (error) {
        return res.status(501).json({
            success: false,
            message: "Error in User LoggedOut",
        })
    }
}

// check middleware -
const check = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: "User Authenticated Successfully",
            user: req.user
        })

    } catch (error) {
        return res.status(501).json({
            success: false,
            message: "Error Checking User",
        })
    }
}


export {register, login, logout, check}