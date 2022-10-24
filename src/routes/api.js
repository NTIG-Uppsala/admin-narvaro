import Router from 'express';

import mongoose from 'mongoose';
import Database from '../Database.js';

const database_instance = new Database();

database_instance.print_uris()

const apiRouter = Router();

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
apiRouter.get('/getgroups', async (req, res) =>  {
    let database_response = await database_instance.get_groups();
    return res.json(database_response)
})

/* Handles when users are updated on the dashboard */
apiRouter.post('/updateusers', (req, res) => {
    req.body.forEach(user => {
        console.log("Updating user", user.name)
        console.log("New values", user)
        database_instance.update_user(user._id, user);
    })
    io.emit("status update")
    return res.status(200).json({status: "ok"})
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
        user_result = await database_instance.get_users({uri: uri})

        if (user_result.length == 0)
            return res.json(return_object);

        user_array.push(user_result)
        return_object.verified = true

        let other_users = await new Promise( async (resolve, reject) => {
            let privilege = await database_instance.get_privileges({_id: user_result.privilege})
            let tmp;

            /* Depending on privilege get different users */
            switch (privilege.control) {
                case 1: // only change the person himself
                    tmp = await database_instance.get_users({name: user_result.name})
                    break;
                case 2: // change all people in same group
                    tmp = await database_instance.get_users({group: user_result.group})
                    break;
                case 3: // change all people
                    tmp = await database_instance.get_users({})
                    break;
                default:
                    tmp = [] // no users
                    break;
            }

            /* Filter out already existing user in user_array */
            tmp = tmp.filter(( obj ) => {
                return obj.name != user_result.name;
            });

            /* Concat user_array with tmp */
            user_array = user_array.concat(tmp)

            resolve(user_array)
        });
        // console.log("GOT RETURNED", other_users)
        return_object.users = return_object.users.concat(other_users)

        console.log(return_object)
        
        return res.status(200).json(return_object)    

    } catch (error) {
        console.log("Could not complete action", error);
        return res.json({});
    }
    
});

export default apiRouter;