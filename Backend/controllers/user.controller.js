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

        return res.status(200).cookie("token", token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'strict' }).json({
            message: `Welcome back ${user.fullname}`,
            user,
            success: true
        })

    } catch (error) {
        console.log(error);
    }
}

// export const updateProfile = async (req, res) => {
//     try {
//         const { fullname, email, phoneNumber, bio, skills } = req.body;
//         const file = req.file;
//         // cloudinary aayega idhar
//         const fileUri = getDataUri(file)
//         const cloudResponse = await cloudinary.uploader.upload(fileUri.content);

//         let skillsArray;
//         if (skills) {
//             skillsArray = skills.split(",");
//         }
//         const userId = req.id;  // will come from middleware authentication
//         let user = await User.findById(userId);

//         if (!user) {
//             return res.status(400).json({
//                 message: "User not found",
//                 sucsess: false
//             })
//         };

//         // updating data
//         if (fullname) user.fullname = fullname
//         if (email) user.email = email
//         if (phoneNumber) user.phoneNumber = phoneNumber
//         if (bio) user.profile.bio = bio
//         if (skills) user.profile.skills = skillsArray
//         // resume comes later here
//         if (cloudResponse) {
//             user.profile.resume = cloudResponse.secure_url
//             user.profile.resumeOriginalName = file.originalname
//         }
//         await user.save();

//         user = {
//             _id: user._id,
//             fullname: user.fullname,
//             email: user.email,
//             phoneNumber: user.phoneNumber,
//             role: user.role,
//             profile: user.profile,
//         }

//         return res.status(200).json({
//             message: "Profile updated successfully",
//             user,
//             success: true
//         })

//     } catch (error) {
//         console.log(error);
//     }
// }

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
