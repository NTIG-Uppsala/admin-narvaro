import mongoose from 'mongoose';

class Database {
    constructor() {
        this.userSchema = new mongoose.Schema({
            name: { type: String, required: true, 'default': 'Inget namn' },
            role: { type: String, required: true, 'default': 'Ingen roll' },
            status: { type: Boolean, required: true, 'default': false },
            latest_change: { type: Date, required: true, 'default': Date.now },
            order: { type: Number, required: true, 'default': -1 },
            uri: { type: String, required: true, 'default': this.makeid(10) },
            group: mongoose.Types.ObjectId,
            privilege: mongoose.Types.ObjectId
        });

        this.groupSchema = new mongoose.Schema({
            display_name: String
        })

        this.privilegeSchema = new mongoose.Schema({
            display_name: String,
            control: Number
        });

        this.adminUserSchema = new mongoose.Schema({
            username: String,
            password: String
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
            "groups": check_if_model_defined("groups", this.groupSchema),
            "adminUsers": check_if_model_defined("adminusers", this.adminUserSchema)
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


            this.models.users.updateOne({ _id: userId }, stuff_to_change, (err, writeResult) => {
                if (err) return reject(err)
                resolve(writeResult)
            })
        })
    }

    async verify_login(user_name, password_to_check) {
        /*
            Checks database for the correct admin password
        */
        return new Promise((resolve, reject) => {
            this.models.adminUsers.find({ name: user_name }, (err, result) => {
                if (err) reject(err);
                if (result.length == 0) reject("Could not find admin user");
                if (result[0].password == password_to_check) resolve(true);
                else resolve(false);
            })
        })
    }

    async add_user(user) {
        /*
            Adds a user to the database
        */
        let _user = {
            name: user.name,
            role: user.role,
            status: false,
            latest_change: new Date(),
            order: -1,
            uri: this.makeid(10),
            group: user.group,
            privilege: user.privilege
        }
        return new Promise((resolve, reject) => {
            this.models.users.create(_user, (err, result) => {
                if (err) reject(err);
                resolve(result);
            })
        });
    }

    makeid(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    regenerate_uri() {


        this.models.users.find({}, (err, result) => {
            console.log(result)
            result.forEach((person) => {
                console.log("Found privilege", person.name, "with uri", person.uri);
                person.uri = this.makeid(10);
                person.save((err) => {
                    if (err) throw err;
                    console.log("Saved privilege", person.name, "with uri", person.uri)
                });
            })

        })



    }

    print_uris() {
        this.models.users.find({}, (err, result) => {
            result.forEach((person) => {
                console.log(`${person.name} ${person.role} -> https://narvaro.ntig.net/setstatus?auth=${person.uri}`);
            })
        })
    }



}

export default Database;