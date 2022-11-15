import Database from "../../libs/Database"
import { isTokenValid } from "../../libs/jwt"
const database_instance = new Database();

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).send("Method not allowed");
    let data = req.body

    req.io.emit("status update", data)

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    /* 
        Verify request body
        - token cant be null
        - payload needs to have status and it has to be a boolean
    */
    if (token === null) return res.sendStatus(401)
    if (data.status === undefined || data.status === null) return res.sendStatus(400)
    if (Object.hasOwn(data, 'status') && typeof data.status === "boolean") return res.sendStatus(400)
    try {
        let token_payload = await isTokenValid(token)

        /* if token is a long lived token check in database if it still exists */
        if (token_payload?.token_type === "long-lived") {
            let token_database_result = await database_instance.get_token(token)
            if (token_database_result === null) return res.sendStatus(403)
        }

        let user_id = data?.id
        let new_status = data.status

        // If token payload has a device id
        if (token_payload.data?.device_id) {
            // Get user associated with device from database
            let result = await database_instance.get_device(token_payload.data.device_id)
            user_id = result.user
        }
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
        return res.sendStatus(403)
    }

}