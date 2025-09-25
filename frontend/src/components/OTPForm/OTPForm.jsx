import React, { useState } from "react";

const OTPForm = ({ onVerify }) => {
  const [otp, setOtp] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    onVerify(otp);
  };

  return (
    <div className="otp-container">
      <h2 className="title">Enter OTP</h2>
      <p className="description">An OTP has been sent to your phone number.</p>
      <form onSubmit={handleSubmit} className="otp-form">
        <input
          type="number"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter the 6-digit OTP"
          required
          className="otp-input"
        />
        <button type="submit" className="verify-btn">
          Verify
        </button>
      </form>
    </div>
  );
};

export default OTPForm;
