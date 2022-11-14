import Database from "../../libs/Database"
const EMIT_STATUS_UPDATE = () => {

    fetch(`${process.env.HOST_URL}/io/emit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            event: "status update",
            data: data
        })
    })
}

const database_instance = new Database();

export default async function handler(req, res) {
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
}