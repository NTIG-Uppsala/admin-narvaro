import Database from '../../../libs/Database.js';
import { generateAccessToken } from '../../../libs/jwt.js';
const database_instance = new Database();

const fetch_users_from_privilege = async (user, privilege) => {
    try {

        let users;

        /* Depending on privilege get different users */
        switch (privilege.control) {
            case 1: // only change the person himself
                users = await database_instance.get_users({ name: user.name })
                break;
            case 2: // change all people in same group
                users = await database_instance.get_users({ group: user.group })
                break;
            case 3: // change all people
                users = await database_instance.get_users({})
                break;
            default:
                users = [] // no users
                break;
        }

        return users
    } catch (error) {
        console.log(error)
        return []
    }
}

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.sendStatus(400)
    let uri = req.body.uri;

    database_instance.get_users({ uri: uri }, true).then(async (user_result) => {
        /* If user array is empty the uri is not matched */
        if (user_result.length == 0) return res.sendStatus(401);

        /* Get privilege info that the user has */
        let user_privilege
        try {
            user_privilege = await database_instance.get_privileges({ _id: user_result.privilege })
        } catch (error) {
            console.log(error)
            return res.sendStatus(500);
        }

        /* Get the other users that is allowed by privilege */
        let other_users = await fetch_users_from_privilege(user_result, user_privilege)

        console.log(other_users)
        let return_users = [user_result];

        /* Filter out original users name from other users if is array of users */
        if (Array.isArray(other_users) === true) {
            other_users = other_users.filter((user) => {
                return user.name !== user_result.name;
            })
            /* concatinate all users */
            return_users = [user_result, ...other_users]
        }

        /* Generate token to change status */
        let token = generateAccessToken({}, '60s')
        return res.status(200).json({
            verified: true,
            users: return_users,
            token: token
        })

    }).catch((err) => {
        console.log(err)
        return res.sendStatus(500);
    })
}