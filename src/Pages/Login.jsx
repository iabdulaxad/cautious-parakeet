import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/methods";
import { useAuth } from "../Context/AuthContext";
import { useMutation } from "../hooks/useApi";
import { roleHome } from "../utils/roles";
import { Button, Input, Card } from "../ui";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, role } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [form, setForm] = useState({
    login: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
  });

  // Already signed in → bounce to the right home.
  useEffect(() => {
    if (isAuthenticated) navigate(location.state?.from || roleHome(role), { replace: true });
  }, [isAuthenticated, role, navigate, location.state]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = useMutation(
    async () => {
      if (mode === "signup") {
        if (!form.login || !form.password || !form.first_name) {
          throw new Error("Name, login and password are required");
        }
        await api.registerPatient(form);
      }
      const r = await login(form.login, form.password);
      return r;
    },
    {
      onSuccess: (r) => {
        toast.success(mode === "signup" ? "Account created!" : "Welcome back!");
        navigate(location.state?.from || roleHome(r), { replace: true });
      },
    }
  );

  return (
    <div className="flex min-h-[70vh] items-center justify-center py-10">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-semibold text-gray-800">
          {mode === "login" ? "Sign in" : "Create your account"}
        </h1>
        <p className="mb-6 mt-1 text-sm text-gray-500">
          {mode === "login"
            ? "Sign in to book and manage your appointments."
            : "Register as a patient to start booking."}
        </p>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit.run();
          }}
        >
          {mode === "signup" && (
            <div className="grid grid-cols-2 gap-3">
              <Input label="First name" required value={form.first_name} onChange={set("first_name")} />
              <Input label="Last name" value={form.last_name} onChange={set("last_name")} />
            </div>
          )}

          <Input label="Login (username)" required value={form.login} onChange={set("login")} />
          <Input
            label="Password"
            type="password"
            required
            value={form.password}
            onChange={set("password")}
          />

          {mode === "signup" && (
            <div className="grid grid-cols-2 gap-3">
              <Input label="Phone" value={form.phone} onChange={set("phone")} placeholder="+998…" />
              <Input label="Email" type="email" value={form.email} onChange={set("email")} />
            </div>
          )}

          <Button type="submit" className="w-full" loading={submit.loading}>
            {mode === "login" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          {mode === "login" ? "New patient?" : "Already have an account?"}{" "}
          <button
            className="font-medium text-primary"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
          >
            {mode === "login" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </Card>
    </div>
  );
}
