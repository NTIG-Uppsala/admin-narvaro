import Router from 'express';

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
        console.log(user)
        console.log("Updating user", user.name)
        console.log("New values", user)        
        
        database_instance.update_user(user.objectId, user)
        .then((updat_result) => {console.log("Updated user, result ->", updat_result)})
        .catch((err) => {throw err});
    })
    req.io.emit("status update")
    return res.status(200).json({status: "ok"})
})

apiRouter.post('/verifylogin', async (req, res) => {
    let login_result = await database_instance.verify_login("admin", req.body.password);
    return res.json(login_result);
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


        try {
            
            let privilege = await database_instance.get_privileges({_id: user_result.privilege})
            let other_users;

            /* Depending on privilege get different users */
            switch (privilege.control) {
                case 1: // only change the person himself
                    other_users = await database_instance.get_users({name: user_result.name})
                    break;
                case 2: // change all people in same group
                    other_users = await database_instance.get_users({group: user_result.group})
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
                other_users = other_users.filter(( obj ) => {
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