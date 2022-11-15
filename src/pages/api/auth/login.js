import Database from '../../../libs/Database'
import { generateAccessToken } from '../../../libs/jwt'
import axios from 'axios'

export default async function handler(req, res) {
    console.log("login request", req.body)
    if (req.method !== 'POST') return res.sendStatus(400)
    const username = "admin"
    const password = req.body.password

    console.log("creating db instance")
    const database_instance = new Database();

    console.log("checking if user credentials are valid")
    console.time("login")
    let login_result = await database_instance.verify_login(username, password);
    console.timeEnd("login")
    if (login_result === false) {
        console.log("login details wrong")
        return res.sendStatus(401)
    }

    console.log("login details correct")

    const payload = {
        user: username,
        role: "admin"
    }

    console.log("generating short lived token to send to /auth/token")
    let token = generateAccessToken({ user: username, role: 'admin' }, '1m')
    
    console.log(`making request to ${process.env.HOST_URL}/api/auth/token`)
    return axios.post(`${process.env.HOST_URL}/api/auth/token`, payload, {
        headers: {
            'authorization': `Bearer ${token}`
        }
    }).then((result) => {
        console.log("token result from token api", result.data)
        return res.status(200).json(result.data)
    }).catch((err) => {
        console.log(err)
        return res.sendStatus(500)
   })
}