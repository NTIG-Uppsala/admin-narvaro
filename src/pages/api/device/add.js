import Database from "../../../libs/Database";
import { isTokenValid } from "../../../libs/jwt";
import axios from "axios";
export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).send("Method not allowed");
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    try {
        let token_payload = await isTokenValid(token)
    } catch (error) {
        return res.sendStatus(401)
    }

    const database_instance = new Database();
    const device_token_payload = {
        user_id: req.body.user,
        device_name: req.body.user,
        role: "device"
    }

    const device_tokens = await axios.post(`${process.env.HOST_URL}/api/auth/token`, device_token_payload, { headers: { "Authorization": `Bearer ${token}` } })
    try {

        const user_id = req.body.user;
        const device_name = req.body.user;

        const device = await database_instance.add_device(device_name, user_id, device_tokens.data.refresh_token);
        let response = {
            user: user_id,
            device_name: device_name,
            token: device_tokens.data.refresh_token
        }
        if (device) {
            res.status(200).json(device);
        }
        else {
            res.sendStatus(404);
        }
    } catch (error) {
        console.error(error);
        res.sendStatus(500)
    }
}