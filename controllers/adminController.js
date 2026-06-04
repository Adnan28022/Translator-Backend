const User = require('../models/User');
const History = require('../models/History');

exports.getStats = async (req, res) => {
    try {
        // Sirf admin access kar sakay
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: "Access denied. Admins only." });
        }

        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalTranslations = await History.countDocuments();

        // Guest users ko hum track nahi kar rahay, isliye random ya 
        // session logic se real-time track kar sakte hain. Filhal mock data:
        const guestUsers = Math.floor(Math.random() * 200) + 50;

        res.json({
            totalUsers,
            totalTranslations,
            guestUsers
        });
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
};