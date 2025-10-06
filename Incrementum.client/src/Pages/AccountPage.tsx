import React, { useEffect, useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../Components/NavigationBar";
import "../App.css";

const AccountPage: React.FC = () => {
  const { apiKey, signOut } = useAuth();
  const [account, setAccount] = useState<{ name: string; email: string; phone_number: string } | null>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccount = async () => {
      if (!apiKey) return;
      const res = await fetch("/api/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: apiKey })
      });
      if (res.ok) {
        setAccount(await res.json());
      } else {
        setError("Could not fetch account info.");
      }
    };
    fetchAccount();
  }, [apiKey]);

  if (!apiKey) {
    return <div className="account-container">Please log in to view your account.</div>;
  }

  return (
    <div className="min-h-screen bg-[hsl(40,62%,26%)]">
      <NavigationBar />
      <div className="main-content flex flex-col items-center justify-center">
        <div className="account-card bg-white shadow-lg rounded-lg p-8 w-full max-w-md mt-10 relative">
          <button
            className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            onClick={() => { signOut(); navigate('/'); }}
          >
            Log Out
          </button>
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Account Info</h2>
        {account ? (
          <>
            <div className="mb-4">
              <span className="font-semibold text-gray-700">Name:</span> {account.name}
            </div>
            <div className="mb-4">
              <span className="font-semibold text-gray-700">Email:</span> {account.email}
            </div>
            <div className="mb-4">
              <span className="font-semibold text-gray-700">Phone Number:</span> {account.phone_number}
            </div>
          </>
        ) : (
          <div className="text-red-500 text-center">{error || "Loading..."}</div>
        )}
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
