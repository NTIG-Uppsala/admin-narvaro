import { generateAccessToken } from "../../../libs/jwt";
import Database from "../../../libs/Database";
let database_instance = new Database();
/*
    Can be used to generate new access tokens which can be revoked
*/
export default async function handler(req, res) {
    if (req.method !== "GET") return res.status(405).send("Method not allowed");

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token === null) return res.sendStatus(401)

    let req_body = req.body

    isValidToken(token).then(async (result) => {

        let token = generateAccessToken(req_body.token_payload, "1h")
        let refresh_token = generateRefreshToken({ ...req_body.token_payload, token_type: "long-lived" })

        /* Save token to database so we can revoke it if it gets leaked */
        let token_database_result_saved = await database_instance.save_token(refresh_token)

        return res.status(200).json({ token: token, refresh_token: refresh_token })
    }).catch((err) => {
        return res.sendStatus(403)
    })


}
