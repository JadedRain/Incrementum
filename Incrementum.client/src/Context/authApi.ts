import { fetchWrapper, apiString } from "./FetchingHelper";
export const signInApi = async (email: string, password: string) => {
  // Don't use fetchWrapper for login - we want to handle errors in the UI, not show a toast
  const res = await fetch(apiString("/api/login"), {
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
// replace
export const signUpApi = async (name: string, phoneNumber: string, email: string, password: string) => {
  const res = await fetchWrapper(()=>fetch(apiString("/api/signup"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, phone_number: phoneNumber, email, password })
  }));
  if (res.ok) {
    const data = await res.json();
    return { apiKey: data.api_key, email };
  }
  return null;
};
