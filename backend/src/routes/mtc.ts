import { Router } from "express"
import { authSession } from "../middleware/auth.js"
import type { Request, Response } from "express"

const router = Router()

router.use("/", authSession)

router.get("/", authSession, (req: Request, res: Response) => {
    console.log("res.locals.user.email: ", res.locals.user?.email)
    res.json({
        email: res.locals.user?.email,
        name: res.locals.user?.name,
        image: res.locals.user?.image,
    })
})


export default router;