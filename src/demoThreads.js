export async function pullDemoThreads(signal) {
  const res = await fetch("/v1/demo-threads", { signal });
  if (!res.ok) {
    const fail = new Error("demo pull");
    fail.status = res.status;
    throw fail;
  }
  const data = await res.json();
  return Array.isArray(data?.threads) ? data.threads : [];
}

export async function pushDemoThreads(list, signal) {
  const res = await fetch("/v1/demo-threads", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({ threads: list || [] }),
  });
  if (!res.ok) {
    const fail = new Error("demo push");
    fail.status = res.status;
    throw fail;
  }
}
