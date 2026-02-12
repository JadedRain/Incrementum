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
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const navigate = useNavigate();
  const { signUp, signIn } = useAuth();
  const { redirectToRegistration } = useKeycloak();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setPhoneError("");

    const result = await signUp(name, phoneNumber, email, password);
    if (result.success) {
      const loginSuccess = await signIn(email, password);
      if (loginSuccess) {
        navigate("/screener");
      }
    } else {
      const errorMsg = result.error || "Signup failed";
      if (errorMsg.includes("Email already in use")) {
        setEmailError(errorMsg);
      } else if (errorMsg.includes("Phone number already in use")) {
        setPhoneError(errorMsg);
      }
    }
  };

  return (
    <div className="signin-container">
      <div className="signup-wrapper">
        <div className="signup-left-section" />
        <form className="signup-form" onSubmit={handleSubmit}>
          <h2 className="signin-title">Sign Up</h2>
        <input
          className="signin-input"
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
            required
        />
        <div>
          <input
            className="signin-input"
            type="text"
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={e => setPhoneNumber(e.target.value)}
            required
          />
          {phoneError && <div className="signin-error">{phoneError}</div>}
        </div>
        <div>
          <input
            className="signin-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          {emailError && <div className="signin-error">{emailError}</div>}
        </div>
        <input
          className="signin-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
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
