import { Router } from "express"
import { authSession } from "../middleware/auth.js"

const router = Router()

router.use("/*", authSession)


export default router