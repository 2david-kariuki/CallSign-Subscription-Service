import random
import time
from flask import current_app
from app.services.sms_service import send_sms

otp_store = {}

def generate_otp() -> str:
    return str(random.randint(100000, 999999))

def generate_and_send_otp(msisdn: str) -> bool:
    otp = generate_otp()
    otp_store[msisdn] = {
        "code": otp,
        "timestamp": time.time(),
        "attempts": 0
    }
    message = f"Your Call Sign subscription OTP is: {otp}. Valid for 10 minutes."
    return send_sms(msisdn, message)

def verify_otp(msisdn: str, user_otp: str) -> bool:
    record = otp_store.get(msisdn)
    if not record:
        return False

    window = current_app.config["RATE_LIMIT_WINDOW"]
    max_attempts = current_app.config["RATE_LIMIT_MAX"]

    record["attempts"] += 1
    if record["attempts"] > max_attempts:
        del otp_store[msisdn]
        return False

    if time.time() - record["timestamp"] > window:
        del otp_store[msisdn]
        return False

    if record["code"] == user_otp:
        del otp_store[msisdn]
        return True
    return False