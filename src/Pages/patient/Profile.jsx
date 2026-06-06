import { useEffect, useState } from "react";
import api from "../../api/methods";
import { useAuth } from "../../Context/AuthContext";
import { useQuery, useMutation } from "../../hooks/useApi";
import { Loading, ErrorState, Card, Input, Button } from "../../ui";

export default function Profile() {
  const { refreshMe } = useAuth();
  const { data, loading, error, reload } = useQuery(() => api.getMe(), []);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [extra, setExtra] = useState({
    date_of_birth: "",
    gender: "",
    blood_type: "",
    address: "",
  });
  const [pw, setPw] = useState({ old_password: "", new_password: "" });

  useEffect(() => {
    if (data?.user) {
      setForm({
        name: data.user.name || "",
        phone: data.user.phone || "",
        email: data.user.email || "",
      });
    }
    if (data?.profile) {
      setExtra({
        date_of_birth: data.profile.date_of_birth || "",
        gender: data.profile.gender || "",
        blood_type: data.profile.blood_type || "",
        address: data.profile.address || "",
      });
    }
  }, [data]);

  const save = useMutation(() => api.updateProfile({ ...form, ...extra }), {
    successMessage: "Profile updated",
    onSuccess: async () => {
      await refreshMe();
      reload();
    },
  });
  const changePw = useMutation(() => api.changePassword(pw.old_password, pw.new_password), {
    successMessage: "Password changed",
    onSuccess: () => setPw({ old_password: "", new_password: "" }),
  });

  if (loading) return <Loading />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const setF = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setE = (k) => (e) => setExtra((x) => ({ ...x, [k]: e.target.value }));
  const setP = (k) => (e) => setPw((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="max-w-2xl py-8">
      <h1 className="text-2xl font-semibold text-gray-800">My profile</h1>

      <Card className="mt-6">
        <h2 className="font-semibold text-gray-700">Personal information</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input label="Name" value={form.name} onChange={setF("name")} />
          <Input label="Phone" value={form.phone} onChange={setF("phone")} />
          <Input label="Email" value={form.email} onChange={setF("email")} />
          <Input label="Date of birth" type="date" value={extra.date_of_birth} onChange={setE("date_of_birth")} />
          <Input label="Gender" value={extra.gender} onChange={setE("gender")} />
          <Input label="Blood type" value={extra.blood_type} onChange={setE("blood_type")} />
          <Input label="Address" className="sm:col-span-2" value={extra.address} onChange={setE("address")} />
        </div>
        <Button className="mt-4" loading={save.loading} onClick={() => save.run()}>
          Save changes
        </Button>
      </Card>

      <Card className="mt-6">
        <h2 className="font-semibold text-gray-700">Change password</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input label="Current password" type="password" value={pw.old_password} onChange={setP("old_password")} />
          <Input label="New password" type="password" value={pw.new_password} onChange={setP("new_password")} />
        </div>
        <Button
          className="mt-4"
          variant="secondary"
          disabled={!pw.old_password || !pw.new_password}
          loading={changePw.loading}
          onClick={() => changePw.run()}
        >
          Update password
        </Button>
      </Card>
    </div>
  );
}
