const express = require('express')
const next = require('next')
const bodyParser = require('body-parser');

const fs = require('fs');

const server = express()
const http_server = require('http').Server(server);
const io = require('socket.io')(http_server);

const dev = process.env.NODE_ENV !== 'production'

const nextApp = next({dev})
const nextHandler = nextApp.getRequestHandler()

const mongoose = require('mongoose');

require('dotenv').config()

/* Function which returns the current date in preferred format */
const current_date = () => {
    return new Date()
}
class database {
    constructor() {
        this.test;
        this.db_url = `mongodb+srv://${process.env.DB_USER}:${encodeURIComponent(process.env.DB_PASSWORD)}@admin-narvaro.o11easj.mongodb.net/users`;
        this.userModel = new mongoose.model("atendences", {
            name: String,
            role: String,
            status: Boolean,
            latest_change: Date,
            order: Number,
            uri: String, 
            group: mongoose.Types.ObjectId,
            privilege: mongoose.Types.ObjectId
        });
        
        this.groupModel = new mongoose.model("groups", {
            display_name: String
        })

        this.privilegeModel = new mongoose.model("privileges", {
            display_name: String,
            control: Number
        });
    }

    get_privileges(filter) {
        filter = filter || {};
        return new Promise((resolve, reject) => {
            this.privilegeModel.find(filter, (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });
    }

    get_users(filter) {
        filter = filter || {};
        return new Promise((resolve, reject) => {
            this.userModel.find(filter, (err, result) => {
                // console.log("Found", result.length, "users");
                // console.log(result);
                // console.log(result); 
                if (err) {
                    console.log("Could not retrive data from database", err)
                    reject(err);
                }
                /* Sort result array after priority key and resolve promise */
                resolve(result.sort((a, b) => {
                    return a.order - b.order
                }))
      
            })
        });
    }

    get_groups(filter) {
        filter = filter || {};
        return new Promise((resolve, reject) => {
            this.groupModel.find(filter, (err, result) => {
                // console.log("Found", result.length, "users");
                // console.log(result);
                // console.log(result); 
                if (err) {
                    console.log("Could not retrive data from database", err)
                    reject(err);
                }
                resolve(result)
            })
        });
    }
        
    update_user(user, db_field, new_value) {
        this.userModel.findOne({name: user}, (err, result) => { 
            if (err) throw err;
            if (result) {
                result[db_field] = new_value;
                result.save((err) => { if (err) throw err; console.log("Saved user to database", result.name)});
            }

            // return res.json(result); 
        });
    }

    regenerate_uri() {
        
        const makeid = (length) => {
            var result           = '';
            var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var charactersLength = characters.length;
            for ( var i = 0; i < length; i++ ) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        }
        
        this.userModel.find({}, (err, result) => {
            console.log(result)
            result.forEach((person) => {
                console.log("Found privilege", person.name, "with uri", person.uri);
                person.uri = makeid(10);
                person.save((err) => { 
                    if (err) throw err; 
                    console.log("Saved privilege", person.name, "with uri", person.uri)
                });
            })

        })


        
    }

    print_uris() {
        this.userModel.find({}, (err, result) => {
            console.log("person results uri", result)
            result.forEach((person) => {
                console.log(`${person.name} ${person.role} -> https://narvaro.ntig.net/setstatus?auth=${person.uri}`);
            })
        })
    }

    

}

const database_instance = new database();
database_instance.print_uris()
nextApp.prepare().then( async () => {
    
    /* Set up body-parser */
    server.use(bodyParser.urlencoded({
        extended: true
    }));
    server.use(express.json());

    /* API to retrive all users */
    server.get('/api/getusers', async (req, res) => {
        let status_object = await database_instance.get_users();
        return res.json(status_object);
    });

    /* Gets all avaliable privileges */
    server.get('/api/getprivileges', async (req, res) => {
        let bla_bla_bla = await database_instance.get_privileges();
        return res.json(bla_bla_bla)
    })

    /* Gets all avaliable groups */
    server.get('/api/getgroups', async (req, res) =>  {
        let database_response = await database_instance.get_groups();
        return res.json(database_response)
    })

    /* Handles when users are updated on the dashboard */
    server.post('/api/updateusers', (req, res) => {
        let database_values = [];
        req.body.forEach(user => {
            console.log("Updating user", user.name)

            database_instance.userModel.findOne({_id: user.objectId}, (err, result) => {
                if (err) throw err;
                if (result) {
                    result.name = user.name;
                    result.role = user.role;
                    result.group = user.group;
                    result.privilege = user.privilege;
                    result.save((err) => { if (err) throw err; console.log("Saved user to database", result.name)});
                }
            })
        })
        io.emit("status update")
        return res.status(200).json({status: "ok"})
    })

    server.post('/api/verifyurl', async (req, res) => {
        let uri = req.body.uri;

        /* Initialize return object */
        let return_object = {
            verified: false,
            users: []
        }

        let user_result;

        try {
            user_result = await database_instance.get_users({uri: uri})
            if (user_result.length > 0) {
                return_object.verified = true

                let other_users = await new Promise((resolve, reject) => {
                    database_instance.privilegeModel.findOne({_id: user_result[0].privilege}, async (err, res) => {
                        let tmp = [];
                        console.log(res)
                        switch (res.control) {
                            case 1: // only change the person himself
                                tmp = await database_instance.get_users({name: user_result[0].name})
                                break;
                            case 2: // change all people in same group
                                tmp = await database_instance.get_users({group: user_result[0].group})
                                break;
                            case 3: // change all people
                                tmp = await database_instance.get_users({})
                                break;
                            default:
                                break;
                        }
                        console.log("WILL BE RETURNED", tmp)
    
                        resolve(tmp)
                    })
    
                });
                console.log("GOT RETURNED", other_users)
                return_object.users = return_object.users.concat(other_users)
    
                console.log(return_object)
            }
            
            return res.status(200).json(return_object)    

        } catch (error) {
            console.log("Could not complete action", error);
            return res.json({});
        }
        
    });
    
    /* Handle all requests through next */
    server.get("*", (req, res) => {
        return nextHandler(req, res)
    });

    /* Listen on port 8000 */
    http_server.listen(8000, (err) => {
        if (err) throw err
        console.log("Server is running on port 8000")
    });

    await mongoose.connect(database_instance.db_url, (err) => {
        if (err) throw err;

        return console.log("Connected to database");
    });
});

 


/* notifies console when someone connects to server socket */
io.on('connection', (socket) => { 
    console.log('A user connected', socket.handshake.address);

    /* A event for changes to the status */
    socket.on('status change', (response) => { 
        console.log(response)
        console.log("STATUS CHANGE")
        /* Update status array */

        database_instance.userModel.findOne({name: response.name }, (err, result) => { 
            if (err) throw err;

           if (result)  {
                result.status = response.status;
                result.latest_change = current_date();
                
                result.save((err) => {
                    if (err) throw err;
                    console.log("Updated in database")
                });
            }
            
            io.emit("status update")
            
        });

        /* Status change */
        
    });

});