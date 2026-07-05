import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Login() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const isRegister = mode === "register";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isRegister) {
        await api.post("/auth/register", { email, password });
        setMode("login");
        setMessage("Account created. You can log in now.");
        setPassword("");
        return;
      }

      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f1eb] text-zinc-950">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-zinc-950 text-white lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(245,158,11,0.35),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(34,197,94,0.20),transparent_28%)]" />
          <div className="relative flex h-full flex-col justify-between p-12">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-amber-400 text-xl font-black text-zinc-950">
                C
              </div>
              <div>
                <p className="text-lg font-bold">CarCare</p>
                <p className="text-sm text-zinc-400">Maintenance cockpit</p>
              </div>
            </div>

            <div className="max-w-xl">
              <p className="mb-4 inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-amber-100">
                Services, costs, reminders
              </p>
              <h1 className="text-6xl font-black leading-[0.95]">
                Keep every vehicle in shape.
              </h1>
              <p className="mt-6 text-lg leading-8 text-zinc-300">
                Track spend, service history and upcoming work from one calm,
                focused dashboard.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {["History", "Costs", "Reminders"].map((item) => (
                <div key={item} className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                  <p className="text-sm font-semibold text-zinc-200">{item}</p>
                  <div className="mt-3 h-1.5 rounded-full bg-amber-300" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-10">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-700">CarCare</p>
              <h1 className="mt-2 text-4xl font-black">Maintenance cockpit</h1>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-[0_24px_70px_rgba(24,24,27,0.12)] sm:p-8">
              <div className="mb-7">
                <p className="text-sm font-semibold text-amber-700">
                  {isRegister ? "Start tracking today" : "Welcome back"}
                </p>
                <h2 className="mt-2 text-3xl font-black">
                  {isRegister ? "Create account" : "Login to dashboard"}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block">
                  <span className="text-sm font-semibold text-zinc-700">Email</span>
                  <input
                    className="mt-2 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"
                    placeholder="you@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-zinc-700">Password</span>
                  <input
                    className="mt-2 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </label>

                {message && (
                  <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
                    {message}
                  </p>
                )}

                <button
                  disabled={loading}
                  className="w-full rounded-lg bg-zinc-950 py-3.5 font-bold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Please wait..." : isRegister ? "Create account" : "Login"}
                </button>
              </form>

              <button
                onClick={() => {
                  setMode(isRegister ? "login" : "register");
                  setMessage("");
                }}
                className="mt-5 w-full rounded-lg border border-zinc-200 py-3 text-sm font-bold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
              >
                {isRegister ? "Already have an account? Login" : "Need an account? Register"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
