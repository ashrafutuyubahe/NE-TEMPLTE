import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validateRequest } from '../utils/validation';
import { RegisterDto } from '../dto/RegisterDto';
import { LoginDto } from '../dto/LoginDto';

const router = Router();

router.post('/register', validateRequest(RegisterDto), AuthController.register);
router.post('/login', validateRequest(LoginDto), AuthController.login);

export default router;

