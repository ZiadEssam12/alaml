import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export function createCartToken(cartId, secret) {
  return jwt.sign({ cartId }, secret, { expiresIn: "30d" });
}
