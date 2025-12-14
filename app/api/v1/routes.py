import re
from flask import request, jsonify
from . import bp
from app.services.otp_service import generate_and_send_otp, verify_otp
from app.services.billing_service import activate_subscription

def is_valid_msisdn(msisdn: str) -> bool:
    return bool(re.fullmatch(r"254[17]\d{8}", msisdn))

@bp.route('/subscribe', methods=['POST'])
def subscribe():
    data = request.get_json() or {}
    msisdn = data.get("msisdn", "").strip()
    product_name = data.get("product_name", "").strip()

    if not msisdn or not product_name:
        return jsonify({"error": "Missing msisdn or product_name"}), 400

    if not is_valid_msisdn(msisdn):
        return jsonify({"error": "Invalid MSISDN. Use 2547XXXXXXXX or 2541XXXXXXXX"}), 400

    if "otp" not in data:
        success = generate_and_send_otp(msisdn)
        if success:
            return jsonify({"status": "otp_sent", "message": "OTP sent to your phone"})
        else:
            return jsonify({"error": "Failed to send OTP"}), 500
    else:
        otp = data["otp"]
        if verify_otp(msisdn, otp):
            activate_subscription(msisdn, product_name)
            return jsonify({"status": "success", "message": f"Subscribed to {product_name}!"})
        else:
            return jsonify({"error": "Invalid or expired OTP"}), 400