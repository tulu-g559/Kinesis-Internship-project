import { useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../api/axios";
import useAuthStore from "../store/authStore";

export default function Login() {

  const navigate = useNavigate();

  const loginStore = useAuthStore((state) => state.login);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      const res = await API.post("/auth/register", form)

      loginStore(
        res.data.user,
        res.data.access_token
      );

      navigate("/dashboard");

    } catch (err) {
      console.log(err);
      alert("Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">

      <form
        onSubmit={handleSubmit}
        className="bg-zinc-900 p-8 rounded-xl w-[400px] space-y-4"
      >

        <h1 className="text-3xl font-bold">
          Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 rounded bg-zinc-800"
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 rounded bg-zinc-800"
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value,
            })
          }
        />

        <button
          className="w-full bg-green-500 p-3 rounded font-bold"
        >
          Login
        </button>

      </form>

    </div>
  );
}