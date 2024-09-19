import NextAuth from "next-auth";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import clientPromise from "Libs/mongodb";
import bcryptjs from "bcryptjs";
import { getServerSession } from "next-auth/next";
import { NextApiRequest, NextApiResponse } from "next";
import authOptions from "./[...nextauth]";
interface ExtendedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export default NextAuth({
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
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
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
        (session.user as ExtendedUser).id = token.id;
      }
      return session;
    },
  },
});

export async function isAuthenticated(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<boolean> {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).json({ message: "Unauthorized" });
    return false;
  }
  return true;
}
