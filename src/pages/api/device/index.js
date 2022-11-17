import Database from "../../../libs/Database";
import { isTokenValid } from "../../../libs/jwt";
export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).send("Method not allowed");

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    let token_payload;
    try {
        token_payload = await isTokenValid(token)
    } catch (error) {
        return res.sendStatus(401)
    }
    console.log("Request", req.body);
    try {
        const user_id = req.body?.user || token_payload.data?.user_id || null;

        if (user_id == null) return res.sendStatus(401)

        res.status(200).json(token_payload.data);
    } catch (error) {
        console.error(error);
        res.sendStatus(500)
    }

}