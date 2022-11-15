import Database from "../../../libs/Database";
import { isTokenValid } from "../../../libs/jwt";
const database_instance = new Database();
export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).send("Method not allowed");

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    try {
        let token_payload = await isTokenValid(token)
    } catch (error) {
        return res.sendStatus(401)
    }
    console.log("Request", req.body);
    try {
        const user_id = req.body.user;
        const device = await database_instance.get_device(user_id);
        console.log("response", device)
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