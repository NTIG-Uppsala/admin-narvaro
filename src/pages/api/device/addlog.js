import { isTokenValid } from "../../../libs/jwt";
import axios from "axios";
export default async function handler(req, res) {
  /* If not a post request, reject the request */
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  /* Check headers for authorization and verify the Bearer token */
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  try {
    let token_payload = await isTokenValid(token);
  } catch (error) {
    return res.sendStatus(401);
  }

  console.log(req.body);
  res.sendStatus(200);

  try {
    res.status(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
}
