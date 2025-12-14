import random
import time
from flask import current_app

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
    message = f"Your OTP is: {otp} (valid 10 min)"
    current_app.logger.info(f"✅ NEW OTP for {msisdn}: {otp}")
    return True

def verify_otp(msisdn: str, user_otp: str) -> bool:
    record = otp_store.get(msisdn)
    if not record:
        return False

    window = current_app.config["RATE_LIMIT_WINDOW"]
    max_attempts = current_app.config["RATE_LIMIT_MAX"]

    record["attempts"] += 1
    now = time.time()

    if record["attempts"] > max_attempts:
        del otp_store[msisdn]
        current_app.logger.info(f"❌ OTP for {msisdn} failed: too many attempts")
        return False

    if now - record["timestamp"] > window:
        del otp_store[msisdn]
        current_app.logger.info(f"❌ OTP for {msisdn} expired")
        return False

    if record["code"] == user_otp:
        del otp_store[msisdn]
        current_app.logger.info(f"✅ OTP for {msisdn} verified successfully")
        return True

    current_app.logger.info(f"⚠️  OTP for {msisdn} wrong (attempt {record['attempts']})")
    return False
