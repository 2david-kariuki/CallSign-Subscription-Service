// DOM Elements
const stepPhone = document.getElementById("step-phone");
const stepOtp = document.getElementById("step-otp");
const stepSuccess = document.getElementById("step-success");
const msisdnInput = document.getElementById("msisdn");
const otpInput = document.getElementById("otp");
const sendOtpBtn = document.getElementById("btn-send-otp");
const verifyOtpBtn = document.getElementById("btn-verify-otp");
const restartBtn = document.getElementById("btn-restart");
const phoneError = document.getElementById("error-phone");
const otpError = document.getElementById("error-otp");

// Utility: Convert 07... or 01... to 2547... or 2541...
function toInternational(phone) {
  let clean = phone.replace(/\D/g, ""); // Remove non-digits
  if (clean.startsWith("0")) {
    return "254" + clean.substring(1);
  }
  return clean;
}

// Clear errors
function clearErrors() {
  phoneError.textContent = "";
  otpError.textContent = "";
}

// Send OTP
sendOtpBtn.addEventListener("click", async () => {
  clearErrors();
  let msisdn = msisdnInput.value.trim();
  if (!msisdn) {
    phoneError.textContent = "Please enter your phone number";
    return;
  }
  const international = toInternational(msisdn);
  if (!/^(2547|2541)\d{8}$/.test(international)) {
    phoneError.textContent = "Invalid number. Use 07XXXXXXXX or 01XXXXXXXX";
    return;
  }

  try {
    const res = await fetch("/api/v1/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        msisdn: international,
        product_name: "Call Sign",
      }),
    });

    const data = await res.json();
    if (res.ok && data.status === "otp_sent") {
      stepPhone.style.display = "none";
      stepOtp.style.display = "block";
    } else {
      phoneError.textContent = data.error || "Failed to send OTP";
    }
  } catch (err) {
    phoneError.textContent = "Network error. Is the server running?";
  }
});

// Verify OTP
verifyOtpBtn.addEventListener("click", async () => {
  clearErrors();
  const otp = otpInput.value.trim();
  const msisdn = toInternational(msisdnInput.value.trim());
  if (!otp || otp.length !== 6) {
    otpError.textContent = "Please enter a 6-digit OTP";
    return;
  }

  try {
    const res = await fetch("/api/v1/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ msisdn, product_name: "Call Sign", otp }),
    });

    const data = await res.json();
    if (res.ok && data.status === "success") {
      stepOtp.style.display = "none";
      stepSuccess.style.display = "block";
    } else {
      otpError.textContent = data.error || "Invalid OTP";
    }
  } catch (err) {
    otpError.textContent = "Verification failed. Try again.";
  }
});

// Restart
restartBtn.addEventListener("click", () => {
  msisdnInput.value = "";
  otpInput.value = "";
  stepSuccess.style.display = "none";
  stepOtp.style.display = "none";
  stepPhone.style.display = "block";
  clearErrors();
});
