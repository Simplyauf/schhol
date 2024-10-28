import NextAuth, { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import clientPromise from "../../../libs/mongodb";
import bcryptjs from "bcryptjs";
import { NextApiRequest, NextApiResponse } from "next";

interface ExtendedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export const authOptions: NextAuthOptions = {
  debug: true,
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        const client = await clientPromise;
        const usersCollection = client.db().collection("users");
        const user = await usersCollection.findOne({
          email: credentials.email,
        });
        if (!user) {
          return null;
        }
        const isPasswordValid = await bcryptjs.compare(
          credentials.password,
          user.password
        );
        if (!isPasswordValid) {
          return null;
        }
        return { id: user._id.toString(), email: user.email, name: user.name };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && typeof token.id === "string") {
        (session.user as ExtendedUser).id = token.id; // Type-safe assignment
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);

export async function isAuthenticated(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<boolean> {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      console.log("No session found:", {
        headers: req.headers,
        cookies: req.cookies,
      });
      res.status(401).json({ error: "Unauthorized" });
      return false; // Return false instead of the response
    }
    return true;
  } catch (error) {
    console.error("Error getting session:", error);
    res.status(500).json({ message: "Internal Server Error" });
    return false;
  }
}
