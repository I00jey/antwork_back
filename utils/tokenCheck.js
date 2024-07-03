const jwt = require('jsonwebtoken');
const UserSchema = require('../models/UserSchema');
require('dotenv').config();
const jwtSecret = process.env.JWTSECRET;

const tokenCheck = async (req) => {
    const token = req.cookies.jwtCookie;
    if (!token) {
        return false;
    } else {
        const result = await jwt.verify(token, jwtSecret);
        const checkID = await UserSchema.findOne({
            user_id: result.id,
        });
        if (checkID) {
            return result.id;
        } else {
            return false;
        }
    }
};

module.exports = { tokenCheck };
