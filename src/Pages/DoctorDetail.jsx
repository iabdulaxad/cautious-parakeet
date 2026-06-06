import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/methods";
import { useQuery, useMutation } from "../hooks/useApi";
import { useAuth } from "../Context/AuthContext";
import { useApp } from "../Context/AppContext";
import { Loading, ErrorState, Button, Input, Card } from "../ui";
import { formatDate, weekdayName } from "../utils/format";
import { ROLES } from "../utils/roles";
import RelatedDoctor from "../Component/RelatedDoctor";

export default function DoctorDetail() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const { formatMoney } = useApp();

  const profileQ = useQuery(() => api.getDoctorProfile(doctorId), [doctorId]);
  const reviewsQ = useQuery(() => api.getDoctorReviews(doctorId), [doctorId]);
  const slotsQ = useQuery(() => api.getAvailableSlots(doctorId, 7), [doctorId]);

  const [activeDay, setActiveDay] = useState(0);
  const [slot, setSlot] = useState(null);
  const [reason, setReason] = useState("");

  const book = useMutation((payload) => api.bookAppointment(payload), {
    successMessage: "Appointment booked!",
    onSuccess: () => navigate("/my-appointments"),
  });

  if (profileQ.loading) return <Loading />;
  if (profileQ.error) return <ErrorState error={profileQ.error} onRetry={profileQ.reload} />;

  const doctor = profileQ.data?.doctor || {};
  const user = profileQ.data?.user || {};
  const name = user.name || doctor.name || "Doctor";
  const availability = (slotsQ.data?.availability || []).filter((d) => (d.slots || []).length > 0);
  const reviews = reviewsQ.data?.reviews || [];
  const avg = reviewsQ.data?.average_rating ?? doctor.average_rating ?? 0;
  const day = availability[activeDay];

  const onBook = () => {
    if (!isAuthenticated) {
      toast.info("Please sign in to book an appointment");
      navigate("/login");
      return;
    }
    if (role !== ROLES.PATIENT) {
      toast.error("Only patients can book appointments");
      return;
    }
    if (!day || !slot) {
      toast.error("Please pick a day and time slot");
      return;
    }
    book.run({
      doctors_id: doctorId,
      appointment_date: day.date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      reason,
    });
  };

  return (
    <div className="py-8">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="flex h-60 w-full items-center justify-center overflow-hidden rounded-2xl bg-primary md:w-72">
          {doctor.photo_url ? (
            <img src={doctor.photo_url} alt={name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-7xl text-white">🩺</span>
          )}
        </div>
        <Card className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-800">{name}</h1>
          <p className="mt-1 text-gray-500">
            {doctor.specialization} · {doctor.experience_years || 0} yrs experience
          </p>
          <p className="mt-1 text-sm text-amber-500">
            ★ {Number(avg).toFixed(1)} ({reviewsQ.data?.count || reviews.length} reviews)
          </p>
          {doctor.languages && (
            <p className="mt-1 text-sm text-gray-500">Languages: {doctor.languages}</p>
          )}
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            {doctor.bio || "No bio provided."}
          </p>
          <p className="mt-4 text-lg font-semibold text-gray-800">
            {formatMoney(doctor.consultation_fee)}
          </p>
        </Card>
      </div>

      {/* Booking */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-gray-800">Book a slot</h2>
        {slotsQ.loading ? (
          <Loading />
        ) : availability.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">
            No available slots in the next 7 days. The doctor may not have set a schedule yet.
          </p>
        ) : (
          <>
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {availability.map((d, i) => (
                <button
                  key={d.date}
                  onClick={() => {
                    setActiveDay(i);
                    setSlot(null);
                  }}
                  className={`flex min-w-[64px] flex-col items-center rounded-2xl px-4 py-3 text-sm ${
                    activeDay === i ? "bg-primary text-white" : "border border-gray-200 text-gray-600"
                  }`}
                >
                  <span>{weekdayName(d.day_of_week).slice(0, 3)}</span>
                  <span className="text-lg font-semibold">{d.date.slice(8)}</span>
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {(day?.slots || []).map((s) => (
                <button
                  key={s.start_time}
                  onClick={() => setSlot(s)}
                  className={`rounded-full px-4 py-2 text-sm ${
                    slot?.start_time === s.start_time
                      ? "bg-primary text-white"
                      : "border border-gray-200 text-gray-600 hover:border-primary"
                  }`}
                >
                  {s.start_time}
                </button>
              ))}
            </div>

            <Input
              className="mt-4 max-w-md"
              label="Reason for visit"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. general checkup"
            />
            <Button className="mt-4" loading={book.loading} onClick={onBook}>
              Book appointment
            </Button>
          </>
        )}
      </div>

      {/* Reviews */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold text-gray-800">Patient reviews</h2>
        {reviews.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">No reviews yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {reviews.map((r) => (
              <Card key={r.guid}>
                <div className="flex items-center justify-between">
                  <span className="text-amber-500">
                    {"★".repeat(r.rating)}
                    {"☆".repeat(Math.max(0, 5 - r.rating))}
                  </span>
                  <span className="text-xs text-gray-400">{formatDate(r.created_at)}</span>
                </div>
                {r.comment && <p className="mt-1 text-sm text-gray-600">{r.comment}</p>}
              </Card>
            ))}
          </div>
        )}
      </div>

      <RelatedDoctor speciality={doctor.specialization} excludeId={doctorId} />
    </div>
  );
}
