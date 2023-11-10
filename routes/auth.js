const express = require("express");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const Message = require("../models/message");
const ExpressError = require("../expressError");

const router = new express.Router();
const { SECRET_KEY } = require("../config");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post("/login", async function(req, res, next) {
    try {
        const {username, password } = req.body;
        if(await User.authenticate(username, password)) {
            User.updateLoginTimestamp(username);
            let token = jwt.sign({ username }, SECRET_KEY);
            return res.json({ token });
        }
        throw new ExpressError("Invalid user/password", 400);
       // else return next({ status: 400, message: "Invalid user/password"});
    } catch(err) {
        return next(err);
    }
});


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post("/register", async function(req, res, next) {
    try {
        const { username, 
                password,
                first_name,
                last_name,
                phone } = req.body;
        let result = await User.register(username,
                            password,
                            first_name,
                            last_name,
                            phone);
        User.updateLoginTimestamp(username);
        let token = jwt.sign({ username }, SECRET_KEY);
        return res.json({ token });
        
    } catch(err) {
        return next(err);
    }
});

module.exports = router;