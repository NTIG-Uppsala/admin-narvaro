import { isTokenValid } from "../../../libs/jwt";
import axios from "axios";
export default async function handler(req, res) {
    /* If not a post request, reject the request */
    if (req.method !== "POST") return res.status(405).send("Method not allowed");

    /* Check headers for authorization and verify the Bearer token */
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    try {
        let token_payload = await isTokenValid(token)
    } catch (error) {
        return res.sendStatus(401)
    }

    const device_token_payload = {
        user_id: req.body.user,
        device_name: req.body.user,
        role: "device"
    }

    /* Generate tokens */
    const device_tokens = await axios.post(`${process.env.HOST_URL}/api/auth/token`, device_token_payload, { headers: { "Authorization": `Bearer ${token}` } })
    try {
        let response = {
            user: req.body.user,
            device_name: req.body.user,
            token: device_tokens.data.refresh_token
        }
        /* Send back tokens */
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.sendStatus(500)
    }
}