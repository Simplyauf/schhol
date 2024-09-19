import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { NextPage } from "next";
import { Session } from "next-auth";

// Adjusting the CustomSession type to extend the default Session type, which includes a user.
interface CustomSession extends Session {
  user: {
    name?: string | null;
    email: string;
  };
}

const Home: NextPage = () => {
  // Using the type assertion to ensure TypeScript knows the session data structure.
  const { data: session } = useSession({ required: false }) as {
    data: CustomSession | null;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center bg-white px-8 py-32 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Student Information Management System
        </h1>
        {session ? (
          <>
            <p className="mb-4">
              Welcome, {session.user.name || session.user.email}
            </p>
            <Link
              href="/students"
              className="inline-block bg-black text-white py-2 px-4 rounded hover:bg-black/70 transition duration-300 mr-4"
            >
              View Student List
            </Link>
            <button
              onClick={() => signOut()}
              className="inline-block bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition duration-300"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link
              href="/auth/signin"
              className="inline-block bg-black text-white py-2 px-4 rounded hover:bg-black/70 transition duration-300 mr-4"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="inline-block text-black py-2 px-4 rounded transition duration-300"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
