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

    const { id } = req.query;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Invalid student ID" });
    }

    const client = await clientPromise;
    const db = client.db();
    const studentsCollection = db.collection("students");

    switch (req.method) {
      case "GET":
        try {
          const student = await studentsCollection.findOne({
            _id: new ObjectId(id),
          });

          if (!student) {
            return res.status(404).json({ message: "Student not found" });
          }

          return res.status(200).json(student);
        } catch (error) {
          console.error("Error fetching student:", error);
          return res.status(500).json({
            message: "Error fetching student",
            error: (error as Error).message,
          });
        }
        break;
      case "PUT":
        try {
          const updatedStudent = req.body;

          if (Object.keys(updatedStudent).length === 0) {
            return res.status(400).json({ message: "No update data provided" });
          }

          // Fetch the current document first
          const currentDoc = await studentsCollection.findOne({
            _id: new ObjectId(id),
          });
          if (!currentDoc) {
            return res.status(404).json({ message: "Student not found" });
          }

          let hasChanges = false;
          for (const [key, value] of Object.entries(updatedStudent)) {
            if (currentDoc[key] !== value) {
              hasChanges = true;
              break;
            }
          }

          if (!hasChanges) {
            return res.status(200).json({
              message: "No changes detected, document remains the same",
            });
          }

          const result = await studentsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updatedStudent }
          );

          if (result.modifiedCount === 1) {
            const updatedDoc = await studentsCollection.findOne({
              _id: new ObjectId(id),
            });
            res.status(200).json(updatedDoc);
          } else {
            res.status(500).json({ message: "Failed to update the document" });
          }
        } catch (error) {
          console.error("Error updating student:", error);
          res.status(500).json({
            message: "Error updating student",
            error: (error as Error).message,
          });
        }
        break;
      case "DELETE":
        try {
          const result = await studentsCollection.deleteOne({
            _id: new ObjectId(id),
          });
          if (result.deletedCount === 1) {
            res.status(200).json({ message: "Student deleted successfully" });
          } else {
            res.status(404).json({ message: "Student not found" });
          }
        } catch (error) {
          console.error("Error deleting student:", error);
          res.status(500).json({
            message: "Error deleting student",
            error: (error as Error).message,
          });
        }
        break;
      default:
        res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
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
