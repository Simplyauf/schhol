import { NextApiRequest, NextApiResponse } from "next";
import { hash } from "bcryptjs";
import clientPromise from "Libs/mongodb";

interface RequestBody {
  email: string;
  password: string;
  name: string;
}

interface ErrorResponse {
  message: string;
}

interface SuccessResponse {
  message: string;
  userId: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  if (req.method === "POST") {
    const { email, password, name } = req.body as RequestBody;
    const client = await clientPromise;
    const db = client.db();

    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      res.status(422).json({ message: "User already exists" });
      return;
    }

    const hashedPassword = await hash(password, 12);
    const result = await db.collection("users").insertOne({
      email,
      password: hashedPassword,
      name,
    });

    res
      .status(201)
      .json({ message: "User created", userId: result.insertedId.toString() });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
