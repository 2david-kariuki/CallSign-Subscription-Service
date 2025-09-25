// To run this server, you must first install the required npm packages.
// Open your terminal in the same directory as this file and run the following command:
// npm install express body-parser cors firebase@^9.0.0

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} = require("firebase/firestore");

const app = express();
const PORT = process.env.PORT || 5000;

// You must replace these with your actual Belio credentials.
const BELIO_CLIENT_ID = "7c0fa1f4-5de1-4f49-a495-142101021792";
const BELIO_CLIENT_SECRET = "REPLACE_WITH_YOUR_ACTUAL_CLIENT_SECRET"; // REPLACE THIS WITH YOUR ACTUAL BELIO CLIENT SECRET
const BELIO_SENDER_ID = "f0e09e0d-3bcf-492e-bb0c-3e6c16973947"; // Replace with your actual Belio Sender ID

// Belio API Endpoints
const BELIO_AUTH_ENDPOINT = "https://auth.belio.co.ke/oauth/token";
const BELIO_SMS_ENDPOINT = "https://sms.belio.co.ke/sms/v1/messages/send";

// Firebase configuration (these are provided by the environment, but a default is provided for local testing)
const firebaseConfig =
  typeof __firebase_config !== "undefined"
    ? JSON.parse(__firebase_config)
    : {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_AUTH_DOMAIN",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_STORAGE_BUCKET",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID",
      };
const appId = typeof __app_id !== "undefined" ? __app_id : "default-app-id";

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

// A simple in-memory cache for OTPs and the access token
const otpCache = {};
const tokenCache = {
  accessToken: null,
  expirationTime: null,
};

// Helper function to get the document path
const getDocPath = (msisdn) => `/${appId}/public/data/subscriptions/${msisdn}`;

// Function to get or refresh the Belio access token
const getAccessToken = async () => {
  // Use cached token if it's still valid
  if (tokenCache.accessToken && tokenCache.expirationTime > Date.now()) {
    return tokenCache.accessToken;
  }

  // Request a new token
  try {
    const response = await fetch(BELIO_AUTH_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: BELIO_CLIENT_ID,
        client_secret: BELIO_CLIENT_SECRET,
        grant_type: "client_credentials",
      }),
    });

    if (response.ok) {
      const data = await response.json();
      tokenCache.accessToken = data.access_token;
      // Set expiration time 60 seconds before actual expiration for safety
      tokenCache.expirationTime = Date.now() + data.expires_in * 1000 - 60000;
      return tokenCache.accessToken;
    } else {
      const errorData = await response.json();
      console.error("Failed to get access token:", errorData);
      throw new Error("Failed to authenticate with Belio API.");
    }
  } catch (error) {
    console.error("Error fetching access token:", error);
    throw error;
  }
};

// Subscribe endpoint
app.post("/subscribe", async (req, res) => {
  const { msisdn } = req.body;
  console.log("Received subscription request for:", msisdn);

  if (!msisdn) {
    return res.status(400).json({ error: "MSISDN is required." });
  }

  // Generate a random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Get the access token
  let accessToken;
  try {
    accessToken = await getAccessToken();
  } catch (authError) {
    return res
      .status(500)
      .json({ error: "Authentication failed. Unable to send OTP." });
  }

  // Construct the SMS message for Belio
  const smsBody = {
    to: msisdn,
    from: BELIO_SENDER_ID,
    message: `Your OTP is: ${otp}`,
  };

  try {
    const response = await fetch(BELIO_SMS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`, // Use the Bearer token here
      },
      body: JSON.stringify(smsBody),
    });

    if (response.ok) {
      console.log(`OTP sent successfully to ${msisdn}`);
      const subscriptionRef = doc(db, getDocPath(msisdn));
      await setDoc(
        subscriptionRef,
        { otp, verified: false, timestamp: new Date() },
        { merge: true }
      );
      otpCache[msisdn] = otp;
      res.status(200).json({ message: "OTP sent successfully!" });
    } else {
      const errorData = await response.json();
      console.error("Error sending OTP:", errorData);
      res.status(500).json({ error: "Failed to send OTP." });
    }
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "Failed to send OTP." });
  }
});

// Verify OTP endpoint
app.post("/verify-otp", async (req, res) => {
  const { msisdn, otp } = req.body;
  console.log("Verifying OTP for:", msisdn);
  console.log("Received OTP:", otp);

  const subscriptionRef = doc(db, getDocPath(msisdn));
  const docSnap = await getDoc(subscriptionRef);

  if (!docSnap.exists()) {
    return res
      .status(404)
      .json({ error: "No subscription found for this MSISDN." });
  }

  const subscriptionData = docSnap.data();

  // Check the in-memory cache first, then fall back to Firestore
  const storedOtp = otpCache[msisdn] || subscriptionData.otp;

  if (storedOtp === otp) {
    await updateDoc(subscriptionRef, { verified: true });
    delete otpCache[msisdn]; // Clear the cache after verification
    console.log(`Subscription for ${msisdn} is now verified.`);
    return res.status(200).json({ message: "OTP verified successfully!" });
  } else {
    console.log(`OTP for ${msisdn} is invalid.`);
    return res.status(400).json({ error: "Invalid OTP. Please try again." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
