import { generateAccessToken, isTokenValid } from "../../../libs/jwt";
import Database from "../../../libs/Database";
let database_instance = new Database();
/*
    Can be used to generate new access tokens which can be revoked
*/
export default async function handler(req, res) {
    try {
        console.log("new token request", req.body)
        if (req.method !== "POST") return res.status(405).send("Method not allowed");
    
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
    
        if (token === null) return res.sendStatus(401)
    
        let req_body = req.body
    
        return isTokenValid(token).then(async (result) => {
            console.log("token valid", result)
    
            let token = generateAccessToken(req_body, "1h")
            let refresh_token = generateAccessToken({ ...req_body, token_type: "long-lived" })
    
            /* Save token to database so we can revoke it if it gets leaked */
            let token_database_result_saved = await database_instance.save_token(refresh_token)
            
            console.log("token_database_result_saved", token_database_result_saved)
            console.log("responding to client")
            return res.status(200).json({ token: token, refresh_token: refresh_token })
        }).catch((err) => {
            console.log(err)
            return res.sendStatus(403)
        })
    } catch (error) {
        console.log(error)
        return res.sendStatus(500)
    }


}
