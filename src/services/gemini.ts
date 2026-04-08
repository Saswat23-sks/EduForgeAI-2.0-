
export async function generateCourse(input, options) {
  const res = await fetch("/api/generate-course", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input, options }),
  });

  if (!res.ok) {
    throw new Error("Failed to generate course");
  }

  const data = await res.json();

  if (data.fallback) {
    console.log("Using fallback AI");
    return JSON.parse(data.data);
  }

  return data;
}
