import mongoose from 'mongoose';

class Database {
    constructor() {
        this.test;
        // this.userModel = new mongoose.model("atendences", {
        this.userSchema = new mongoose.Schema({
            name: String,
            role: String,
            status: Boolean,
            latest_change: Date,
            order: Number,
            uri: String, 
            group: mongoose.Types.ObjectId,
            privilege: mongoose.Types.ObjectId
        });
        
        // this.groupModel = new mongoose.model("groups", {
        this.groupSchema = new mongoose.Schema({
            display_name: String
        })

        // this.privilegeModel = new mongoose.model("privileges", {
        this.privilegeSchema = new mongoose.Schema({
            display_name: String,
            control: Number
        });
        
        const check_if_model_defined = (model, schema) => {
            if (!mongoose.models[model]) {
                return new mongoose.model(model, schema);
            } else {
                return new mongoose.model(model);
            }

        }

        this.models = {
            "users": check_if_model_defined("users", this.userSchema),
            "privileges": check_if_model_defined("privileges", this.privilegeSchema),
            "groups": check_if_model_defined("groups", this.groupSchema)
        }
    }

    get_privileges(filter) {
        filter = filter || {};
        return new Promise((resolve, reject) => {
            this.models.privileges.find(filter, (err, result) => {
                if (err) reject(err);
                if (result.length == 1) resolve(result[0]);
                else resolve(result);
                
            });
        })
    }

    get_users(filter) {
        filter = filter || {};
        return new Promise((resolve, reject) => {
            this.models.users.find(filter, (err, result) => {
                // console.log("Found", result.length, "users");
                // console.log(result);
                // console.log(result); 
                if (err) {
                    reject(err);
                }
                if (result.length == 1) return resolve(result[0]);

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
            this.models.groups.find(filter, (err, result) => {
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
        
    async update_user(userId, new_values) {
        /*
            Updates users with new values
        */
        let stuff_to_change = {};
        let allowed_keys = ["name", "role", "status", "latest_change", "order", "uri", "group", "privilege"];
        for (const key in new_values) {
            // We do not want to update a users _id
            if (key == "objectId" || key == "_id") continue;
            
            if (allowed_keys.includes(key)) {
                stuff_to_change[key] = new_values[key];
            }
        }
                    
        return new Promise((resolve, reject) => {

            if (Object.keys(stuff_to_change).length == 0)
                reject("No values to change");


            this.models.users.updateOne({_id: userId}, stuff_to_change, (err, writeResult) => {
                if (err) return reject(err)
                resolve(writeResult)
            })
        })
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
        this.models.users.find({}, (err, result) => {
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
        this.models.users.find({}, (err, result) => {
            console.log("person results uri", result)
            result.forEach((person) => {
                console.log(`${person.name} ${person.role} -> https://narvaro.ntig.net/setstatus?auth=${person.uri}`);
            })
        })
    }

    

}

export default Database;