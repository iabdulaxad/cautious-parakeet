import { useState } from "react";
import api from "../../api/methods";
import { useQuery, useMutation } from "../../hooks/useApi";
import { Loading, ErrorState, EmptyState, Card, Button, Badge, Modal, Textarea, Select } from "../../ui";
import { formatDate } from "../../utils/format";

export default function MyAppointments() {
  const { data, loading, error, reload } = useQuery(() => api.getMyAppointments(), []);
  const docs = useQuery(() => api.getDoctors({ limit: 500 }), []);
  const docMap = {};
  (docs.data?.doctors || []).forEach((d) => (docMap[d.guid] = d));

  const [cancelTarget, setCancelTarget] = useState(null);
  const [reason, setReason] = useState("");
  const [reviewTarget, setReviewTarget] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const cancel = useMutation(() => api.cancelMyAppointment(cancelTarget.guid, reason), {
    successMessage: "Appointment cancelled",
    onSuccess: () => {
      setCancelTarget(null);
      setReason("");
      reload();
    },
  });
  const review = useMutation(
    () => api.createReview({ appointments_id: reviewTarget.guid, rating: Number(rating), comment }),
    {
      successMessage: "Review submitted",
      onSuccess: () => {
        setReviewTarget(null);
        setComment("");
        setRating(5);
        reload();
      },
    }
  );

  if (loading) return <Loading />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  const appts = data?.appointments || [];

  return (
    <div className="py-8">
      <h1 className="text-2xl font-semibold text-gray-800">My appointments</h1>

      {appts.length === 0 ? (
        <EmptyState title="No appointments yet" hint="Book one from the doctors page." icon="📅" />
      ) : (
        <div className="mt-6 space-y-3">
          {appts.map((a) => {
            const d = docMap[a.doctors_id];
            const cancellable = a.status === "scheduled" || a.status === "confirmed";
            return (
              <Card key={a.guid} className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-800">
                    {d?.name || "Doctor"}{" "}
                    <span className="text-sm text-gray-400">· {d?.specialization || ""}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDate(a.appointment_date)} · {a.start_time}–{a.end_time}
                  </p>
                  {a.reason && <p className="text-sm text-gray-500">Reason: {a.reason}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge status={a.status} />
                  {cancellable && (
                    <Button variant="secondary" onClick={() => setCancelTarget(a)}>
                      Cancel
                    </Button>
                  )}
                  {a.status === "completed" && (
                    <Button onClick={() => setReviewTarget(a)}>Leave review</Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel appointment"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCancelTarget(null)}>
              Keep
            </Button>
            <Button
              variant="danger"
              disabled={!reason.trim()}
              loading={cancel.loading}
              onClick={() => cancel.run()}
            >
              Cancel appointment
            </Button>
          </>
        }
      >
        <Textarea
          label="Reason for cancellation"
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Let us know why"
        />
      </Modal>

      <Modal
        open={!!reviewTarget}
        onClose={() => setReviewTarget(null)}
        title="Leave a review"
        footer={
          <>
            <Button variant="secondary" onClick={() => setReviewTarget(null)}>
              Close
            </Button>
            <Button loading={review.loading} onClick={() => review.run()}>
              Submit review
            </Button>
          </>
        }
      >
        <Select label="Rating" value={rating} onChange={(e) => setRating(e.target.value)}>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} ★
            </option>
          ))}
        </Select>
        <Textarea
          label="Comment"
          className="mt-3"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience"
        />
      </Modal>
    </div>
  );
}
