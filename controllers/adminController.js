const User = require("../models/userModel");
const bcrypt = require('bcrypt');
const session = require('express-session');

const loadLogin = async(req, res) => {
    try {
        res.render('login');
        return;
    } catch (error) {
        console.log(error.message);
    }
};
const verifyLogin = async(req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({ email: email });
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                if (userData.is_admin === 0) {
                    res.render('login', { message: "Email and password is incorrect" });
                    return;
                } else {
                    req.session.user_id = userData._id;
                    res.redirect('/admin/home');
                    return;
                }
            } else {
                res.render('login', { message: "Email and password is incorrect" });
                return;
            }
        } else {
            res.render('login', { message: "Email and password is incorrect" });
            return;
        }
    } catch (error) {
        console.log(error.message);
    }
};
const loadDashboard = async(req, res) => {
    try {
        res.render('home');
        return;
    } catch (error) {
        console.log(error.message);
    }
};
const adminLogout = async(req, res) => {
    try {
        req.session.destroy();
        res.redirect("/admin");
        return;
    } catch (error) {
        console.log(error.message);
    }
}
module.exports = {
    loadLogin,
    verifyLogin,
    loadDashboard,
    adminLogout
};
