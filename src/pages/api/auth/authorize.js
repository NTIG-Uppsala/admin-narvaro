import { isTokenValid } from "../../../libs/jwt"

export default async function handler(req, res) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token === null) return res.sendStatus(401)
    try {
        let data = await isTokenValid(token)
        if (data.valid && data.data?.role === "admin") {
            res.status(200).json({ valid: true, data: data.data })
        }
        else {
            res.sendStatus(403)
        }

    } catch (error) {
        res.sendStatus(403)
    }
}