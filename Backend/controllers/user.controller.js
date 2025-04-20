import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password } = req.body;
        if (!fullname || !email || !phoneNumber || !password) {
            return res.status(400).json({ message: "All fields are required", success: false });
        }

        const user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exist with this email", success: false });

        const existingUser = await User.findOne({ phoneNumber });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Phone number already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword
        });

        return res.status(201).json({
            message: "Account created successfully.",
            success: true
        });
    } catch (error) {
        console.log(error);
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "All fields are required",
                sucsess: false
            })
        };

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Incorrect email or password",
                sucsess: false
            })
        };

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect email or password",
                sucsess: false
            })
        };

        const tokenData = {
            userId: user._id,
        }

        const token = jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '1d' });

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
        }

        return res.status(200).cookie("token", token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true, secure: true, sameSite: 'None' }).json({
            message: `Welcome back ${user.fullname}`,
            user,
            success: true
        })

    } catch (error) {
        console.log(error);
    }
}

export const logout = async (req, res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0 }).json({
            message: "Logged out successfully",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

export const checkAuth = async (req, res) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ loggedIn: false });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        return res.status(200).json({
            loggedIn: true,
            userId: decoded.userId
        });

    } catch (err) {
        return res.status(401).json({ loggedIn: false });
    }
}
