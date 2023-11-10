const express = require("express");
//const jwt = require("jsonwebtoken");
const { ensureLoggedIn } = require("../middleware/auth");

//const User = require("../models/user");
const Message = require("../models/message");

const router = new express.Router();

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in user is either the to or from user.
 *
 **/
router.get("/:id", ensureLoggedIn, async (req, res, next) => {
    try {
        const id = req.params.id;
        const message = await Message.get(id);
        const curr_user = req.user.username;
        if(message.from_user == curr_user || message.to_user == curr_user) {
            return { message };
        }
        return next({ status: 401, message: "Unauthorized" });
    } catch(err) {
        return next(err);
    }
});


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/", ensureLoggedIn, async (req, res, next) => {
    try {
        const {to_username, body} = req.body;
        const curr_user = req.user.username;

        const message = await Message.create(curr_user, to_username, body);
        return { message };
    } catch(err) {
        return next(err);
    }
});


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post("/:id/read", ensureLoggedIn, async (req, res, next) => {
    try {
        const id = req.params.id;
        const curr_user = req.user.username;
        let message = await Message.get(id);

        if(message.to_user != curr_user) {
            return next({ status: 401, message: "Unauthorized" });
        }
        
        message = await Message.markRead(id);
        return { message };
    } catch(err) {
        return next(err);
    }
});

module.exports = router;