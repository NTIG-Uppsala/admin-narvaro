import Database from '../../../libs/Database'
import { generateAccessToken } from '../../../libs/jwt'

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.sendStatus(400)
    const username = "admin"
    const password = req.body.password

    const database_instance = new Database();

    let login_result = await database_instance.verify_login(username, password);

    if (login_result === false) {
        return res.sendStatus(401)
    }

    let token = generateAccessToken({ user: username, role: 'admin' }, '1h')
    return res.status(200).json({ token: token })
}