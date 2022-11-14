import Database from "../../libs/Database";
import { isTokenValid } from "../../libs/jwt";

const database_instance = new Database();

export default async function handler(req, res) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token === null) return res.sendStatus(401)

    isTokenValid(token).then((validData) => {

        let user = req.body.user;
        console.log("Deleting user", user.name)
        database_instance.remove_user(user._id)
            .then((result) => {
                console.log("Deleted user", result)
                req.io.emit("status update")
                return res.status(200).json({ status: "ok" })
            })
            .catch((err) => {
                console.log(err)
                return res.status(500).json({ status: "error" })
            })
    }).catch((error) => {
        console.log(error)
        return res.sendStatus(401)
    })
}