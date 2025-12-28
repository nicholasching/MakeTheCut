import { Router, type Request, type Response } from "express"
import { authSession } from "../middleware/auth.js"
import type { DataSummaryResponse } from "@makethecut/shared"

const router: Router = Router()

router.use("/", authSession)

router.get("/", authSession, (req: Request, res: Response) => {
    console.log("res.locals.user.email: ", res.locals.user?.email)
    res.json({
        email: res.locals.user?.email,
        name: res.locals.user?.name,
        image: res.locals.user?.image,
    })
})


router.get('/data-summary', (req: Request, res: Response<DataSummaryResponse>) => {
    res.json({
        totalPoints: 1
    })
})


export default router;