import Database from "../../libs/Database";
import { isTokenValid } from "../../libs/jwt";

const database_instance = new Database();

export default async function handler(req, res) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token === null) return res.sendStatus(401)

    isTokenValid(token).then((validData) => {

        let user = req.body.user;
        console.log(user)
        console.log("Updating user", user.name)
        console.log("New values", user)
        if (!user._id) {
            database_instance.add_user(user)
                .then((result) => { console.log("Created user", result) })
                .catch((err) => { throw err });
        }
        else {
            database_instance.update_user(user._id, user)
                .then((updat_result) => { console.log("Updated user, result ->", updat_result) })
                .catch((err) => { throw err });
        }

        req.io.emit("status update")
        return res.status(200).json({ status: "ok" })
    }).catch((error) => {
        console.log(error)
        return res.sendStatus(401)
    })

}
