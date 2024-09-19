import NextAuth, { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import clientPromise from "Libs/mongodb";
import bcryptjs from "bcryptjs";
import { NextApiRequest, NextApiResponse } from "next";

interface ExtendedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export const authOptions: NextAuthOptions = {
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
    console.log(session);
    if (!session) {
      res.status(401).json({ message: "Unauthorized" });
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error getting session:", error);
    res.status(500).json({ message: "Internal Server Error" });
    return false;
  }
}
