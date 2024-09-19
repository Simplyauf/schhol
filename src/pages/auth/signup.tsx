import { useState, FormEvent } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import Link from "next/link";

export default function SignUp() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");

  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      if (response.ok) {
        toast.success("Account created successfully!");
        router.push("/auth/signin");
      } else {
        const errorData: { message?: string } = await response.json();
        toast.error(
          errorData.message || "Failed to create account. Please try again."
        );
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Signup error:", error.message);
      } else {
        console.error("Signup error:", error);
      }
      toast.error("An unexpected error occurred. Please try again later.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="appearance-none relative block w-full px-3 py-2 h-12 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none rounded sm:text-sm"
                placeholder="Full name"
              />
            </div>
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
                className="appearance-none relative block w-full px-3 py-2 h-12 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none rounded sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-black/70 focus:outline-none"
            >
              Sign up
            </button>
          </div>
        </form>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/auth/signin" className="hover:text-black">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
