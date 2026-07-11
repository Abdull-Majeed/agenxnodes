const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

router.post('/api/auth/signup', async (req, res) => {
    try {
        const { username, password, email } = req.body;
        if (!username || !password || !email) return res.status(400).json({ error: "Username, email, and password are required" });
        if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });
        
        const existingUsername = await User.findOne({ username });
        if (existingUsername) return res.status(409).json({ error: "Username already exists" });

        const existingEmail = await User.findOne({ email });
        if (existingEmail) return res.status(409).json({ error: "Email already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword });
        await user.save();
        res.json({ message: "User Created" });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "User with this email does not exist." });

        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        const resetLink = `http://localhost:5173/reset-password/${token}`;

        if (process.env.SYSTEM_EMAIL && process.env.SYSTEM_EMAIL_PASSWORD) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.SYSTEM_EMAIL,
                    pass: process.env.SYSTEM_EMAIL_PASSWORD
                }
            });

            const mailOptions = {
                from: process.env.SYSTEM_EMAIL,
                to: user.email,
                subject: 'AgenXNodes Password Reset',
                text: `You are receiving this because you (or someone else) requested a password reset for your account.\n\n` +
                      `Please click on the following link to complete the process:\n\n` +
                      `${resetLink}\n\n` +
                      `If you did not request this, please ignore this email and your password will remain unchanged.\n`
            };

            await transporter.sendMail(mailOptions);
            res.json({ message: "Password reset email sent." });
        } else {
            console.log("Password Reset Link (since SYSTEM_EMAIL is not configured):", resetLink);
            res.json({ message: "Password reset email sent. (Check terminal since email is not configured)" });
        }

    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

        const user = await User.findOne({ 
            resetPasswordToken: token, 
            resetPasswordExpires: { $gt: Date.now() } 
        });

        if (!user) return res.status(400).json({ error: "Password reset token is invalid or has expired." });

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: "Your password has been successfully changed." });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: "Username and password are required" });
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ error: "Invalid credentials" });
        const token = jwt.sign({ _id: user._id }, JWT_SECRET);
        res.json({ token, username: user.username });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ==========================================
// 3. WORKFLOW CRUD (Fixed double-response bug)
// ==========================================
module.exports = { router, auth: (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: "Access Denied" });
    try { req.user = jwt.verify(token.split(" ")[1], JWT_SECRET); next(); }
    catch (err) { res.status(400).json({ error: "Invalid Token" }); }
} };
