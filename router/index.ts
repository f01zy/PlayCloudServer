import { Router } from "express"
import { body } from "express-validator"
import { UserController } from "../controllers/user.controller"
import { MusicController } from "../controllers/music.controller"

const userController = new UserController()
const musicController = new MusicController()
export const router = Router()

router.post("/auth/register",
  body("username").isLength({ min: 3, max: 25 }),
  body("email").isEmail(),
  body("password").isLength({ min: 8 }),
  userController.register
)
router.post("/auth/login", userController.login)
router.get("/auth/logout", userController.logout)
router.get("/auth/activate/:link", userController.activate)
router.get("/auth/refresh", userController.refresh)

router.get("/users/:id", userController.getUserById)

router.get("/music/:id", musicController.getOneMusic)
router.post("/music/listen", musicController.listen)
router.post("/music/like", musicController.like)
router.post("/music", musicController.create)
router.delete("/music", musicController.delete)
router.get("/music", musicController.getAllMusic)
router.get("/music/next", musicController.getNext)