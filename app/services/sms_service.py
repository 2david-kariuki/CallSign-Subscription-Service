import json
from flask import current_app

def send_sms(msisdn: str, message: str) -> bool:
    """
    Logs OTP to console for visibility during testing.
    Returns True to simulate success (no real SMS sent).
    """
    current_app.logger.info(f"📱 OTP for {msisdn}: {message}")
    return True
