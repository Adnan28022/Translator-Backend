const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { otpTemplate } = require('../utils/emailTemplates');

// Email Transporter Setup
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

// --- REGISTER ---
exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: "User already exists" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedPassword = await bcrypt.hash(password, 10);

        user = new User({
            email,
            password: hashedPassword,
            otp,
            otpExpire: Date.now() + 10 * 60 * 1000
        });

        await user.save();
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify your account - Translator Pro',
            html: otpTemplate(otp, "Registration")
        });

        res.status(200).json({ msg: "OTP sent to email" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- VERIFY OTP ---
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email, otp, otpExpire: { $gt: Date.now() } });

        if (!user) return res.status(400).json({ msg: "Invalid or Expired OTP" });

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpire = undefined;
        await user.save();

        res.status(200).json({ msg: "Account verified! You can now login." });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- LOGIN ---
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ msg: "User not found" });
        if (!user.isVerified) return res.status(400).json({ msg: "Please verify your email first" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- FORGOT PASSWORD ---
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: "User not found" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpire = Date.now() + 10 * 60 * 1000;
        await user.save();

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset OTP',
            html: otpTemplate(otp, "Password Reset")
        });

        res.json({ msg: "Reset OTP sent to email" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- RESET PASSWORD ---
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ email, otp, otpExpire: { $gt: Date.now() } });

        if (!user) return res.status(400).json({ msg: "Invalid or Expired OTP" });

        user.password = await bcrypt.hash(newPassword, 10);
        user.otp = undefined;
        user.otpExpire = undefined;
        await user.save();

        res.json({ msg: "Password updated successfully" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};