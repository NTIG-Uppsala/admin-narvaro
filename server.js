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

/* Handles a POST request to /sendinput */
let statusArray = [
    {
        name: "Mathias Laveno",
        role: "Rektor",
        locked: false,
        status: false,
        latest_change: current_date()
    },
    {
        name: "Henrik Jonsson",
        role: "biträdande rektor",
        locked: false,
        status: false,
        latest_change: current_date()
    },
    {
        name: "Sarah Hagberg",
        role: "Biträdande rektor",
        locked: false,
        status: false,
        latest_change: current_date()
    },
    {
        name: "Therese Ekman",
        role: "Administratör",
        locked: false,
        status: false,
        latest_change: current_date()
    },
    {
        name: "Vincent Persson",
        role: "Tekniker",
        locked: false,
        status: false,
        latest_change: current_date()
    },
    {
        name: "Megan Sundström",
        role: "Kurator",
        locked: false,
        status: false,
        latest_change: current_date()
    }
]

class database {
    constructor() {
        this.test;
        this.db_url = `mongodb+srv://${process.env.DB_USER}:${encodeURIComponent(process.env.DB_PASSWORD)}@admin-narvaro.o11easj.mongodb.net/users`;
        this.userModel = new mongoose.model("atendences", {
            name: String,
            role: String,
            status: Boolean,
            latest_change: Date,
            viktighet: Number,
            privilege: mongoose.Types.ObjectId
        });
        
        this.privilegeModel = new mongoose.model("privileges", {
            name: String,
            uri: String
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
                    return a.viktighet - b.viktighet
                }))
      
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

    regenerate_uri(user) {
        
        const makeid = (length) => {
            var result           = '';
            var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var charactersLength = characters.length;
            for ( var i = 0; i < length; i++ ) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        }
        
        this.privilegeModel.findOne({name: user}, (err, privilage_result) => {
            
            console.log("Found privilege", privilege.name, "with uri", privilege.uri);
            privilege.uri = makeid(10);
            privilege.save((err) => { 
                if (err) throw err; 
                console.log("Saved privilege", privilege.name, "with uri", privilege.uri)
            });
        
        })
        
    }
    

}

const databse_instance = new database();


nextApp.prepare().then( async () => {
    
    /* Set up body-parser */
    server.use(bodyParser.urlencoded({
        extended: true
    }));
    server.use(express.json());

    /* API to retrive current status */
    server.get('/api/getstatus', async (req, res) => {
        let status_object = await databse_instance.get_users();
        return res.json(status_object);
    });

    server.post('/api/verifyurl', async (req, res) => {
        let uri = req.body.uri;

        /* Initialize return object */
        let return_object = {
            verified: false,
            privilege: null,
            users: []
        }
        let user_result;

        try {
            let privilage = await databse_instance.get_privileges({uri: uri});

            if (privilage.length > 0) {
                privilage = privilage[0];
                console.log("Found privilege", privilage);
                return_object.privilege = privilage.name;

                if (privilage.name == "admin") {
                    user_result = await databse_instance.get_users();
                }
                else {
                    user_result = await databse_instance.get_users({privilege: privilage._id});
                }  
                console.log("user_result: ", user_result)

                if (user_result.length > 0) {
                    return_object.verified = true;
                    return_object.users = user_result.sort((a, b) => {
                        return a.viktighet - b.viktighet
                    });
                }
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

    await mongoose.connect(databse_instance.db_url, (err) => {
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

        databse_instance.userModel.findOne({name: response.name }, (err, result) => { 
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
