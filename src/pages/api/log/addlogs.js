import { isTokenValid } from "../../../libs/jwt";
import Database from "../../../libs/Database";

export default async function handler(req, res) {
  /* If not a post request, reject the request */
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  /* Check headers for authorization and verify the Bearer token */
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  try {
    let token_payload = await isTokenValid(token);

    const database_instance = new Database();

    const data = req.body;
    if (!data.logs) {
      res.sendStatus(400).json({ error: "No data provided" });
    }
    if (!data.id) {
      res.sendStatus(400).json({ error: "No ID provided" });
    }
    console.log(data);

    let id = data.id.replace(/[ -]/g, "").toLowerCase();

    const collection_name = `${id}logs`;

    let add_logs = await database_instance.add_logs(collection_name, data.logs);

    console.log(add_logs);

    res.sendStatus(200);
  } catch (error) {
    return res.sendStatus(401);
  }
}
