import requests
import base64
import json
from flask import current_app

def send_sms(msisdn: str, message: str) -> bool:
    """
    Belio Dev Mode:
    - Logs the full Belio API request (URL, headers, payload)
    - Does NOT actually call Belio (saves your credit)
    - Returns True to simulate success
    """
    url = current_app.config.get("BELIO_API_URL")
    client_id = current_app.config.get("BELIO_CLIENT_ID")
    client_secret = current_app.config.get("BELIO_CLIENT_SECRET")

    if not all([url, client_id, client_secret]):
        current_app.logger.error("❌ Belio credentials missing in .env")
        return False

    # Basic Auth
    credentials = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()
    headers = {
        "Authorization": f"Basic {credentials}",
        "Content-Type": "application/json"
    }
    payload = {
        "to": msisdn,
        "message": message
    }

    # 🔍 LOG THE FULL REQUEST (for debugging)
    current_app.logger.info(f"📤 [BELIO DEV MODE] Would send SMS to {msisdn}")
    current_app.logger.info(f"   URL: {url}")
    current_app.logger.info(f"   Headers: {json.dumps(headers, indent=2)}")
    current_app.logger.info(f"   Payload: {json.dumps(payload, indent=2)}")
    current_app.logger.info("   → Skipping real call to save credit (dev mode)")

    # ✅ Simulate success
    return True