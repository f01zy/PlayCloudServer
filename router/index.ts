import { Router } from "express"
import { body } from "express-validator"
import { UserController } from "../controllers/user.controller"
import { MusicController } from "../controllers/music.controller"
import { PlaylistController } from "../controllers/playlist.controller"
import { SearchController } from "../controllers/search.controller"

const userController = new UserController()
const musicController = new MusicController()
const playlistController = new PlaylistController()
const searchController = new SearchController()

export const router = Router()

router.post("/auth/register",
  body("username").isString().isLength({ min: 4, max: 16 }),
  body("email").isEmail(),
  body("password").isString().isLength({ min: 8 }),
  userController.register
)
router.post("/auth/login",
  body("email").isEmail(),
  body("password").isString(),
  userController.login
)
router.get("/auth/logout", userController.logout)
router.get("/auth/activate/:link", userController.activate)
router.get("/auth/refresh", userController.refresh)

router.put("/users",
  body("username").isString().optional().isLength({ min: 4, max: 16 }),
  body("description").isString().optional().isLength({ max: 200 }),
  body("links").isArray().optional().custom((value) => { if (value) { return value.every((link: any) => typeof link === 'string') } return true }),
  userController.put
)
router.get("/users/:id", userController.getUserById)

router.get("/music/:id", musicController.getOneMusic)
router.post("/music/listen", body("id").isString(), musicController.listen)
router.post("/music/like", body("id").isString(), musicController.like)
router.post("/music", body("name").isString().isLength({ max: 50 }), musicController.create)
router.get("/music", musicController.getAllMusic)

router.post("/playlist",
  body("name").isString().isLength({ max: 50 }),
  body("description").isString().isLength({ max: 200 }),
  body("tracks").isArray(),
  playlistController.create
)
router.get("/playlist/:id", playlistController.getOne)
router.post("/playlist/save", body("id").isString(), playlistController.save)

router.get("/search", searchController.search)