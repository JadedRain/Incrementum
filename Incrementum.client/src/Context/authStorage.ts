export const getAuthFromStorage = () => ({
  apiKey: localStorage.getItem("apiKey") ?? null,
  email: localStorage.getItem("email") ?? null,
});

export const setAuthToStorage = (apiKey: string | null, email: string | null) => {
  if (apiKey && email) {
    localStorage.setItem("apiKey", apiKey);
    localStorage.setItem("email", email);
  } else {
    localStorage.removeItem("apiKey");
    localStorage.removeItem("email");
  }
};
