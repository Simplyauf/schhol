import { signIn } from "next-auth/react";
import { useState, FormEvent } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import Link from "next/link";

export default function SignIn() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/",
      });

      if (result && result.error) {
        toast.error(result.error);
      } else {
        toast.success("Signed in successfully!");
        router.push("/students");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again." || error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="appearance-none relative block w-full px-3 py-2 h-12 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none rounded sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="appearance-none  relative block w-full px-3 py-2 border h-12  border-gray-300 placeholder-gray-500 text-gray-900 rounded  focus:outline-none sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-black/70 focus:outline-none "
            >
              Sign in
            </button>
          </div>
        </form>
        <div className="text-center mt-4">
          <Link href="/auth/signup" className="text-sm text-gray-400">
            Do not have an account?{" "}
            <span className="hover:text-black">Register here</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
