export const signInApi = async (email: string, password: string) => {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (res.ok) {
    const data = await res.json();
    return { apiKey: data.api_key, email };
  }
  return null;
};

export const signUpApi = async (name: string, phoneNumber: string, email: string, password: string) => {
  const res = await fetch("/api/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, phone_number: phoneNumber, email, password })
  });
  if (res.ok) {
    const data = await res.json();
    return { apiKey: data.api_key, email };
  }
  return null;
};
