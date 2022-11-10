import Router from 'express';

import Database from '../libs/Database.js';
import { generateAccessToken, isTokenValid } from '../libs/jwt.js';

const database_instance = new Database();


const apiRouter = Router();


function authenticateTokenMiddleware(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token === null) return res.sendStatus(401)

    isTokenValid(token).then((result) => {
        console.log("result", result)
        req.token_value = result.data
        next()
    }).catch((error) => {
        console.log(error)
        return res.sendStatus(403)
    })

}

apiRouter.get('/getusers', async (req, res) => {
    let status_object = await database_instance.get_users();
    return res.json(status_object);
});

/* Gets all avaliable privileges */
apiRouter.get('/getprivileges', async (req, res) => {
    let privs = await database_instance.get_privileges();
    return res.json(privs)
})

/* Gets all avaliable groups */
apiRouter.get('/getgroups', async (req, res) => {
    let database_response = await database_instance.get_groups();
    return res.json(database_response)
})


apiRouter.post('/setstatus', async (req, res) => {
    let data = req.body

    req.io.emit("status update", data)

    database_instance.update_user(data.id, {
        status: data.status,
        latest_change: new Date()
    })
        .then((result) => {
            console.log("Updated user status, result ->", result)
            return res.status(200).json({})
        }).catch((err) => {
            console.log(err)
            req.io.emit("status update", { ...data, status: !data.status, error: err })
            return res.status(401).json({})
        });
})

/* Handles when users are updated on the dashboard */
apiRouter.post('/updateusers', authenticateTokenMiddleware, (req, res) => {
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
})

apiRouter.post('/deleteuser', authenticateTokenMiddleware, (req, res) => {

    let user = req.body.user;
    console.log("updating status for user ->", user)
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

})

apiRouter.post('/login', async (req, res) => {
    let username = "admin"
    let password = req.body.password

    let login_result = await database_instance.verify_login(username, password);
    if (login_result === true) {
        let newToken = generateAccessToken({ user: username })
        return res.status(200).json({ token: newToken })
    }
    else {
        return res.sendStatus(403)
    }
})

apiRouter.get('/authorize', authenticateTokenMiddleware, async (req, res) => {
    return res.status(200).json(req.token_value)
})

apiRouter.post('/verifyurl', async (req, res) => {
    let uri = req.body.uri;

    /* Initialize return object */
    let return_object = {
        verified: false,
        users: []
    }

    let user_result;
    let user_array = [];

    try {
        user_result = await database_instance.get_users({ uri: uri })

        if (user_result.length == 0)
            return res.json(return_object);

        user_array.push(user_result)
        return_object.verified = true


        try {

            let privilege = await database_instance.get_privileges({ _id: user_result.privilege })
            let other_users;

            /* Depending on privilege get different users */
            switch (privilege.control) {
                case 1: // only change the person himself
                    other_users = await database_instance.get_users({ name: user_result.name })
                    break;
                case 2: // change all people in same group
                    other_users = await database_instance.get_users({ group: user_result.group })
                    break;
                case 3: // change all people
                    other_users = await database_instance.get_users({})
                    break;
                default:
                    other_users = [] // no users
                    break;
            }

            /* If user can see more than him/herself */
            if (other_users.length > 0) {
                /* Filter out already existing user in user_array */
                other_users = other_users.filter((obj) => {
                    return obj.name != user_result.name;
                });
                /* Concat user_array with tmp */
                user_array = user_array.concat(other_users)
            }


        } catch (error) {
            throw error
        }


        // console.log("GOT RETURNED", other_users)
        return_object.users = return_object.users.concat(user_array)

        console.log(return_object)

        return res.status(200).json(return_object)

    } catch (error) {
        console.log("Could not complete action", error);
        return res.json({});
    }

});

export default apiRouter;