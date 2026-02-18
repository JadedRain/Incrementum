import '../styles/SignIn.css';
import React, { useState, useCallback } from "react";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import AuthInput from "../Components/AuthInput";
import NavigationBar from "../Components/NavigationBar";

const LogInPage: React.FC = () => {
  const { signIn, apiKey, email: userEmail } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const success = await signIn(email, password);
    if (success) {
      navigate("/screener");
    } else {
      setError("Invalid email or password");
    }
  }, [email, password, signIn, navigate]);

  // Show if logged in
  if (apiKey) {
    return (
      <>
        <NavigationBar />
        <div className="signin-container">
          <div className="signin-wrapper">
            <div className="signin-form">
              <h2 className="signin-title">✓ Logged In</h2>
              <p className="signin-success-email">{userEmail}</p>
              <button className="signin-button" onClick={() => navigate("/screener")}>
                Go to Screener
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavigationBar />
      <div className="signin-container">
        <div className="signin-wrapper">
          <div className="signin-left-section"></div>
          <form className="signin-form" onSubmit={handleSubmit}>
            <h2 className="signin-title">Login</h2>
            <AuthInput label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            <AuthInput label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            {error && <div className="signin-error">{error}</div>}
            <button className="signin-button" type="submit">Login</button>
            <button
              className="signin-button mt-2"
              type="button"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default LogInPage;
