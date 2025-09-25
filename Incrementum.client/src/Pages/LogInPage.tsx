import React, { useState, useCallback } from "react";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import '../App.css';
import AuthInput from "../Components/AuthInput";

const LogInPage: React.FC = () => {
  const { signIn } = useAuth();
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

  return (
    <div className="signin-container">
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
  );
};

export default LogInPage;
