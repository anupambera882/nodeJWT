const verifyToken = require('../middleware/authMiddleware');
const UserController = require('../controllers/userController');
const express = require('express');
const userRoute = express.Router();

userRoute.get('/', (req, res) => {
    res.json({
        message: 'This is home page'
    });
});

userRoute.post("/create-account", UserController.createNewUser);
userRoute.post("/login", UserController.userLogin);
userRoute.get("/profile", [verifyToken], UserController.getUserProfile);
userRoute.post('/user/forgot-password', UserController.forgotPassword);
userRoute.get('/user/forgot-password/:id/:tokenId', UserController.setNewForgotPassword);

module.exports = userRoute;