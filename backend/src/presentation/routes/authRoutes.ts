import { Router } from "express";
import { AuthController } from '../controllers/AuthController';
import { registerSchema } from "../../schemas/registerSchema";
import { validateBody } from "../../middleware/validate";
import { loginSchema } from "../../schemas/loginSchema";

const router = Router()
const authController = new AuthController()
router.use((req, res, next) => {
    console.log(`Request received at ${req.originalUrl}`);
    next();
});
  
router.post('/sign-up',validateBody(registerSchema), authController.signUp.bind(authController));
router.post('/login',validateBody(loginSchema), authController.login.bind(authController));
router.post('/refresh', authController.refreshToken.bind(authController));
router.post('/forgot-password', authController.forgotPassword.bind(authController));
router.post('/verify-otp', authController.verifyOTP.bind(authController));
router.post('/resend-otp', authController.resendOTP.bind(authController))
router.post("/request-password-reset", authController.requestPasswordReset.bind(authController));
router.post("/reset-password", authController.resetPassword.bind(authController));
router.post('/google-auth', authController.googleAuth.bind(authController));
router.post('/logout', authController.logout.bind(authController));

export default router;