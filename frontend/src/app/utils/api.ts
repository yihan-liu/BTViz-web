export async function uploadTagsForMeasurement(
  measurementId: string,
  tags: Record<string, string[]>
) {
  const res = await fetch(`/api/measurements/${measurementId}/tags`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tags }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}