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

    DEBUG_REWRITE_DB_USERS() {
        console.log("UNCOMMENT CODE IF YOU WANT TO REWRITE DB")
        // console.log("Connected to database DELETING ALL USERS");
        // // databse_instance.userModel.deleteMany({}, (err) => { if (err) throw err})
        // // let USERS = []
        // statusArray.forEach(async (person) => {
        //     let ny_modell = new databse_instance.userModel({
        //         name: person.name,
        //         role: person.role,
        //         status: person.status,
        //         latest_change: person.latest_change,
        //         viktighet: -1,
        //         privilege: null
        //     });
            
        //     // USERS.push(ny_modell)

        //     await ny_modell.save((err) => { if (err) throw err; console.log("Saved user to database", ny_modell.name)});
            
        // });
        // databse_instance.userModel.insertMany(USERS, (err) => { if (err) throw err; console.log("Saved users to database")});

        // userModel.insertMany(users, (err) => { if (err) throw err});
        // ny_modell.save((err) => { if (err) throw err});

    }

    regenerate_uris() {
        const makeid = (length) => {
            var result           = '';
            var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var charactersLength = characters.length;
            for ( var i = 0; i < length; i++ ) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        }
        
        this.privilegeModel.find({}, (err, privilage_result) => {
            
            privilage_result.forEach((privilege) => {
                console.log("Found privilege", privilege.name, "with uri", privilege.uri);
                privilege.uri = makeid(10);
                privilege.save((err) => { 
                    if (err) throw err; 
                    console.log("Saved privilege", privilege.name, "with uri", privilege.uri)
                });
            })
        
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
    server.get('/api/getstatus', (req, res) => {
        databse_instance.userModel.find({}, (err, result) => { 
            // console.log(result); 
            if (err) {
                console.log("Could not retrive data from database", err)
                return res.json(statusArray)
            }
            /* Sort result array after priority key */
            let sorted_result = result.sort((a, b) => {
                return a.viktighet - b.viktighet
            })

            return res.json(sorted_result)

            // return res.json(result); 
        });
    });

    server.post('/api/verifyurl', (req, res) => {
        let uri = req.body.uri;

        databse_instance.privilegeModel.findOne({uri: uri}, (err, privilage_result) => {
            
            if (err) {
                console.log("Could not retrive data from database", err)
                return res.json({verified: false, users: null});
            }

            /* If privilage is returned search for user with privilage id */
            if (privilage_result) {
                let privilege_id = privilage_result._id;
                let privilege_name = privilage_result.name;
                
                console.log(privilage_result)
                if (privilege_name == "admin") {
                    databse_instance.userModel.find({}, (err, user_result) => {
                        if (err) {
                            console.log("Could not retrive data from database", err)
                            return res.json({
                                verified: false, 
                                privilege: null, 
                                users: null
                            });
                        }

                        let sorted_result = user_result.sort((a, b) => {
                            return a.viktighet - b.viktighet
                        })

                        return res.json({
                            verified: true, 
                            privilege: privilege_name, 
                            users: sorted_result
                        });
                    })
                } else {

                    databse_instance.userModel.find({privilege: privilege_id}, (err, user_result) => {
                        if (err) {
                            console.log("Could not retrive data from database", err);
                            return res.json({
                                verified: false, 
                                privilege: null, 
                                users: null
                            });
                        }
                        /* if users has privilage return users */
                        if (user_result) {
                            return res.json({
                                verified: true, 
                                privilege: privilege_name, 
                                users: user_result
                            });
                        }
                        
                    });

                }
            }
            else {
                return res.json({
                    verified: false, 
                    privilege: null, 
                    users: null
                });
            }
            
        });

        
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
