import jwt from "jsonwebtoken";

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  return secret;
}

export const signToken = (userId: string) => {
  const SECRET = getSecret();
  return jwt.sign({ userId }, SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string) => {
  const SECRET = getSecret();
  return jwt.verify(token, SECRET) as { userId: string };
};