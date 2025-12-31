import { Router, type Request, type Response } from "express"
import { authSession } from "../middleware/auth.js"
import type { DataSummaryResponse } from "@makethecut/shared"
import {MarkData} from "../models/MarkData.js";
import {User} from "../models/User.js";

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


router.get('/data-summary', async (req: Request, res: Response<DataSummaryResponse>) => {
    // TODO: make this actually do something meaningful (should pull from MarkData)
    const count = await User.aggregate([
        {
            $count: "count"
        }
    ]);
    res.json({
        totalPoints: count[0].count
    })
})


export default router;