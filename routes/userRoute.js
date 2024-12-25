import express from "express";
import { goggleRegisterCallBack, gogglesuccess, userRegister } from "../controller/userController.js";

export const user = express.Router();

user.get("/register/goggle",userRegister );

user.get("/auth/google/callback", goggleRegisterCallBack,gogglesuccess)