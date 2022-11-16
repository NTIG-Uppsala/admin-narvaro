import Database from "../../../libs/Database"
import { isTokenValid } from "../../../libs/jwt"
// /api/get/[slug].js
export default async function (req, res) {
    const database_instance = new Database();
    const { slug } = req.query

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    // if token header is null dont verify and set it to false
    const authenticated = token ? (await isTokenValid(token))?.valid : false;
    try {

        switch (slug) {
            case "users":
                let users = await database_instance.get_users({}, authenticated)
                users = users.map((user) => {
                    return { ...user._doc, latest_change_diff: (new Date().getTime() - new Date(user.latest_change).getTime()) }
                })
                res.status(200).json(users)
                break;
            case "user":
                // id  must be a string of 12 bytes or a string of 24 hex characters or an integer
                if (!req.body.id) return res.status(400).json({ error: "Missing id" })
                if (typeof req.body.id !== "string") return res.status(400).json({ error: "id must be a string" })
                if (req.body.id.length !== 12 && req.body.id.length !== 24 && req.body.id.length !== 24) return res.status(400).json({ error: "Invalid id" })

                let user = await database_instance.get_users({ _id: req.body.id }, authenticated)

                if (user.length === 0) return res.status(404).send("User not found")
                user = { ...user._doc, latest_change_diff: new Date().getTime() - new Date(user.latest_change).getTime() }
                res.status(200).json(user)
                break;
            case "privileges":
                let privileges = await database_instance.get_privileges()
                res.status(200).json(privileges)
                break;
            case "groups":
                let groups = await database_instance.get_groups()
                res.status(200).json(groups)
                break;

            default:
                res.sendStatus(404);
                break;
        }
    } catch (error) {
        console.log(error)
        return res.sendStatus(500)
    }
}