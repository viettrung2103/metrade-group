import express from "express";
import { profile, updateProfile } from "../controllers/userController.js";
import { uploadUserAvatar } from "../middlewares/uploadPhotos.js";


const router = express.Router(); 

router.get('/profile/detail', profile);
router.patch('/profile/update', uploadUserAvatar.single('avatar'), updateProfile);

export default router;
