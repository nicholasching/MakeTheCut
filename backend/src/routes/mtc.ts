import { Router } from "express"
import { authSession } from "../middleware/auth.js"
import type { Request, Response } from "express"
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
        totalPoints: 0,
    })
})


export default router;