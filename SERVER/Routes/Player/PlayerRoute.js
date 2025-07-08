import express from 'express';
const router = express.Router();


import { signUp,verifyEmailWithOTP,login, checkPlayerAuthorization, getCurrentPlayer, logOut } from '../../Controllers/Players/PlayerController.js';

import { userAuthMiddleware } from '../../Middlewares/jwtAuth.js';



router.post('/signup',signUp);
router.post('/verifyEmailWithOTP',verifyEmailWithOTP);
router.post('/login',login);
router.post('/logout', userAuthMiddleware,logOut);
router.get('/checkAuth',userAuthMiddleware,checkPlayerAuthorization);
router.get('/getPlayerDetails',userAuthMiddleware, getCurrentPlayer);






export default router;