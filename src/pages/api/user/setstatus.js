import Database from "../../../libs/Database"
import { isTokenValid } from "../../../libs/jwt"
const database_instance = new Database();

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).send("Method not allowed");
    let data = req.body

    console.log("data", data)

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    /* 
    Verify request body
    - token cant be null
    - payload needs to have status and it has to be a boolean
    */
    if (token === null) return res.sendStatus(401)
    if (typeof data?.status !== "boolean") return res.sendStatus(400)
    try {
        let token_payload = await isTokenValid(token)
        console.log(token_payload)
        /* If token is role device, check if in database  */
        let device;
        if (token_payload.data.role === "device") {
            device = await database_instance.get_device(token_payload.data.user_id)
            if (device === null) return res.sendStatus(401)
        }

        let user_id = device?.user || data.id
        let new_status = data.status

        req.io.emit("status update", data)
        // If token payload has a device id
        database_instance.update_user(user_id, {
            status: new_status,
            latest_change: new Date()
        })
            .then((result) => {
                console.log("Updated user status, result ->", result)
                return res.status(200).json({})
            }).catch((err) => {
                console.log(err)
                req.io.emit("status update", { ...data, status: !data.status, error: err })
                return res.status(401).json({})
            });

    } catch (error) {
        console.log(error)
        return res.sendStatus(403)
    }

}