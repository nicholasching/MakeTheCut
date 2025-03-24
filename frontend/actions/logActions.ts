import {account, database, ID} from "../app/appwrite";
import {Log} from "../../types";

export async function addLog(gpa: string): Promise<Log> {
    let loggedInUser = account.get();

    let dblGPA = parseFloat(gpa)

    console.log(dblGPA)

    const newLog = {user: (await loggedInUser).$id, gpa: dblGPA, math1za3: 0, math1zb3: 0, math1zc3: 0, phys1d03: 0, phys1e03: 0, chem1e03: 0, eng1p13: 0, elec1: "hi,0", elec2: "bye,1"}
    
    const response = await database.createDocument(
        'MacStats',
        'UserData',
        ID.unique(),
        newLog
    )

    const log = {
        $id: response.$id,
        $createdAt: response.$createdAt,
        user: response.createdBy,
        gpa: response.gpa
    }

    return log
}