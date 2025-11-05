import '../styles/SignIn.css';
import '../App.css'
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { useKeycloak } from "../hooks/useKeycloak";

const SignupPage: React.FC = () => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { signUp, signIn } = useAuth();
  const { redirectToRegistration } = useKeycloak();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const signupSuccess = await signUp(name, phoneNumber, email, password);
    if (signupSuccess) {
      // Immediately log in the user after signup to ensure context is set as with login
      const loginSuccess = await signIn(email, password);
      if (loginSuccess) {
        navigate("/screener");
      } else {
        setError("Login failed after signup");
      }
    } else {
      setError("Signup failed");
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-wrapper">
        <div className="signin-left-section" />
        <form className="signin-form" onSubmit={handleSubmit}>
          <h2 className="signin-title">Sign Up</h2>
        <input
          className="signin-input"
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          className="signin-input"
          type="text"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={e => setPhoneNumber(e.target.value)}
        />
        <input
          className="signin-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          className="signin-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <div className="signin-error">{error}</div>}
        <button className="signin-button" type="submit">Sign Up</button>
          <button
            className="signin-button mt-2"
            type="button"
            onClick={redirectToRegistration}
          >
            Register with Keycloak
          </button>
          <button
            className="signin-button mt-2"
            type="button"
            onClick={() => navigate("/")}
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
