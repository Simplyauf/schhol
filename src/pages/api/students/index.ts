import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import clientPromise from "../../../libs/mongodb";
import authOptions from "../auth/[...nextauth]";

import { ObjectId } from "mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const client = await clientPromise;
    const db = client.db();
    const studentsCollection = db.collection("students");

    switch (req.method) {
      case "GET":
        try {
          const students = await studentsCollection.find({}).toArray();
          res.status(200).json(students);
        } catch (error) {
          console.error("Error fetching students:", error);
          res.status(500).json({ error: "Error fetching students" });
        }
        break;
      case "POST":
        try {
          const newStudent = req.body;
          const result = await studentsCollection.insertOne(newStudent);
          res.status(201).json({ ...newStudent, _id: result.insertedId });
        } catch (error) {
          console.error("Error creating student:", error);
          res.status(400).json({ error: "Error creating student" });
        }
        break;
      case "PUT":
        try {
          const updatedStudent = req.body;
          const { _id, ...studentData } = updatedStudent;

          if (!_id) {
            return res.status(400).json({ error: "Student ID is required" });
          }

          const result = await studentsCollection.updateOne(
            { _id: new ObjectId(_id) },
            { $set: studentData }
          );

          if (result.modifiedCount === 1) {
            const updatedDoc = await studentsCollection.findOne({
              _id: new ObjectId(_id),
            });
            res.status(200).json(updatedDoc);
          } else {
            res
              .status(404)
              .json({ message: "Student not found or not updated" });
          }
        } catch (error) {
          console.error("Error updating student:", error);
          res.status(500).json({
            message: "Error updating student",
            error: (error as Error).message,
          });
        }
        break;

      default:
        res.setHeader("Allow", ["GET", "POST", "PUT"]);
        return res
          .status(405)
          .json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({
      error: "Internal server error",
      details: (error as Error).message,
    });
  }
}
