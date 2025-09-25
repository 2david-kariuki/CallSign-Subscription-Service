import React, { useState } from "react";
import "./HomePage.css";
import OTPForm from "../../components/OTPForm/OTPForm.jsx";
import "../../App.css";

const HomePage = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isOTPSent, setIsOTPSent] = useState(false);

  const handleSubscribe = async (event) => {
    event.preventDefault();
    console.log("Subscribing phone number:", phoneNumber);

    try {
      const response = await fetch("http://localhost:5000/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ msisdn: phoneNumber }),
      });

      if (response.ok) {
        setIsOTPSent(true);
        console.log("OTP sent successfully!");
      } else {
        console.error("Failed to send OTP:", response.statusText);
      }
    } catch (error) {
      console.error("Error during subscription:", error);
    }
  };

  const handleVerifyOTP = async (otp) => {
    console.log("Verifying OTP:", otp);

    try {
      const response = await fetch("http://localhost:5000/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ msisdn: phoneNumber, otp }),
      });

      if (response.ok) {
        console.log("Subscription successful!");
        alert("Subscription successful!");
        setIsOTPSent(false);
        setPhoneNumber("");
      } else {
        console.error("Failed to verify OTP:", response.statusText);
        alert("Failed to verify OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error during OTP verification:", error);
      alert("Error during OTP verification. Please try again.");
    }
  };

  return (
    <div className="homepage-container">
      <h1 className="title">Call SignSubscription API</h1>
      <div className="content">
        {isOTPSent ? (
          <OTPForm onVerify={handleVerifyOTP} />
        ) : (
          <div className="subscribe-container">
            <h2 className="title">Subscribe to Content</h2>
            <p className="description">
              Enter your phone number to get started.
            </p>
            <form onSubmit={handleSubscribe} className="subscribe-form">
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number (MSISDN)"
                required
                className="phone-input"
              />
              <button type="submit" className="subscribe-btn">
                Subscribe
              </button>
            </form>
          </div>
        )}

        <div className="card-container">
          <div className="card">
            <h3>Content Provider</h3>
            <p>Manage and upload your content.</p>
          </div>
          <div className="card">
            <h3>End User</h3>
            <p>View and manage your subscriptions.</p>
          </div>
          <div className="card">
            <h3>Safaricom Operator</h3>
            <p>Administer the system.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
