import { isTokenValid } from "../../../libs/jwt";
export default async function handler(req, res) {
  /* If not a post request, reject the request */
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  /* Check headers for authorization and verify the Bearer token */
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  try {
    let token_payload = await isTokenValid(token);

    const data = req.body;
    if (!data.logs) {
      res.sendStatus(400).json({ error: "No data provided" });
    }
    console.log(data);

    res.sendStatus(200);
  } catch (error) {
    return res.sendStatus(401);
  }
}
