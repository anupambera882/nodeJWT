const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const LoginSecretKey = "LoginSecretKey";

class UserController {
    static createNewUser = async (req, res) => {
        try {
            const { name, email, phone, password } = req.body;
            // check duplicate user entry
            const checkEmail = await userModel.findOne({ email });
            if (checkEmail) {
                return res.status(400).json({
                    message: "This user already exist"
                })
            }
            const hashPassword = await bcrypt.hash(password, 10);
            const newUser = new userModel({
                name: name,
                email: email,
                phone: phone,
                password: hashPassword
            });
            const newUserSave = await newUser.save();
            return res.status(201).json({
                message: "New user add successfully",
                data: newUserSave
            });
        } catch (err) {
            return res.status(401).send(err);
        }
    }

    static userLogin = async (req, res) => {
        try {
            const { email, password } = req.body;
            const userData = await userModel.findOne({ email });
            if (!userData) {
                return res.status(400).json({
                    message: "User does not exist"
                })
            }
            const comparePassword = await bcrypt.compare(password, userData.password);
            let token;
            if (comparePassword) {
                token = jwt.sign({ "id": userData.id }, LoginSecretKey, { expiresIn: '1h' });
            } else {
                return res.status(400).json({
                    message: "Wrong password enter"
                });
            }
            return res.status(201).json({
                message: "User login successfully",
                data: userData,
                JWTToken: token
            });
        } catch (err) {
            return res.status(401).send(err);
        }
    }

    static getUserProfile = async (req, res) => {
        try {
            let _id;
            jwt.verify(req.token, LoginSecretKey, (err, authData) => {
                if (err) {
                    return res.send({
                        result: "Invalid token"
                    });
                }
                _id = authData.id;
            });
            const userData = await userModel.findById({ _id });
            return res.status(201).json({
                message: "Profile access successfully",
                Data: userData
            })
        } catch (err) {
            return res.status(401).send(err);
        }
    }

    static forgotPassword = async (req, res) => {
        try {
            const { email } = req.body;
            const userData = await userModel.findOne({ email });
            let token;
            const forgotPasswordSecretKey = LoginSecretKey + userData.id;
            if (userData) {
                token = jwt.sign({ "id": userData.id }, forgotPasswordSecretKey, { expiresIn: '10m' });
            } else {
                return res.status(400).json({
                    message: "User does not exist"
                });
            }
            const forgotUrl = `http://localhost:3000/user/forgot-password/${userData.id}/${token}`;
            return res.status(201).json({
                message: "To forgot password click here",
                forgotUrl: forgotUrl
            })
        } catch (err) {
            return res.status(401).send(err);
        }
    }

    static setNewForgotPassword = async (req, res) => {
        try {
            const { NewPassword } = req.body;
            const { id, tokenId } = req.params.tokenId;
            const _id = id;
            const userData = await userModel.findById({ _id });
            const forgotPasswordSecretKey = LoginSecretKey + userData.id;
            if (userData) {
                let id;
                jwt.verify(tokenId, forgotPasswordSecretKey, (err, authData) => {
                    if (err) {
                        res.send({
                            result: "Invalid token"
                        })
                    } else {
                        id = authData.id;
                    }
                });
                if (_id === id) {
                    const hashPassword = await bcrypt.hash(NewPassword, 10);
                    await userModel.findByIdAndUpdate({ _id },
                        {
                            $set: {
                                password: hashPassword
                            }
                        });
                    return res.status(201).json({
                        message: "User new password successfully updated",
                        email: userData.email
                    });
                }
            }
            return res.status(400).json({
                message: "wrong id received"
            });
        } catch {
            return res.status(401).send(err);
        }
    }
}

module.exports = UserController;