import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

// useQuery runs an async fetcher on mount and whenever a dep changes.
// Returns { data, loading, error, reload }. Pass enabled:false to defer.
export function useQuery(fetcher, deps = [], { enabled = true } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    fetcherRef
      .current()
      .then((result) => active && setData(result))
      .catch((err) => active && setError(err))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, reload };
}

// useMutation wraps a one-shot action with loading state and toast feedback.
export function useMutation(action, { onSuccess, successMessage } = {}) {
  const [loading, setLoading] = useState(false);

  const run = useCallback(
    async (...args) => {
      setLoading(true);
      try {
        const result = await action(...args);
        if (successMessage) toast.success(successMessage);
        if (onSuccess) await onSuccess(result, ...args);
        return result;
      } catch (err) {
        toast.error(err?.message || "Something went wrong");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [action]
  );

  return { run, loading };
}
