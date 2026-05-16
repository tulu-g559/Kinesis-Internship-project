import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import API from "../api/axios";
import useAuthStore from "../store/authStore";

export default function Login() {

  const navigate = useNavigate();

  const loginStore = useAuthStore((state) => state.login);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {

      const res = await API.post("/auth/login", form);

      loginStore(
        res.data.user,
        res.data.access_token
      );

      if (res.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      console.log(err);
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-500">AGON</h1>
          <p className="text-zinc-400 mt-2">Betting Exchange Platform</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800/50 p-8 rounded-2xl space-y-5"
        >

          <h2 className="text-2xl font-bold text-center">Welcome Back</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-zinc-300 uppercase tracking-wider mb-2">Email</label>
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-300 uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              placeholder="Your password"
              className="w-full p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-400 p-3 rounded-xl font-bold text-black transition-all hover:shadow-[0_0_30px_rgba(34,197,94,0.3)]"
          >
            Login
          </button>

          <p className="text-center text-sm text-zinc-500">
            Don't have an account?{" "}
            <Link to="/register" className="text-green-500 hover:underline">
              Register here
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
}