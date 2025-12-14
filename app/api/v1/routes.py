import re
from flask import request, jsonify, render_template, redirect, url_for, session
from . import bp
from app.services.otp_service import generate_and_send_otp, verify_otp, otp_store
from app.services.billing_service import activate_subscription, record_subscription

# In-memory CP credentials (replace with DB in prod)
CP_CREDENTIALS = {
    "lamahuraan": "secret123"
}

def is_valid_msisdn(msisdn: str) -> bool:
    return bool(re.fullmatch(r"254[17]\d{8}", msisdn))

@bp.route('/subscribe', methods=['GET'])
def subscribe_form():
    # Optional: pre-fill CP/product from URL params
    cp_id = request.args.get('cp', '')
    product = request.args.get('product', 'Call Sign')
    channel = request.args.get('channel', 'web')
    return render_template('index.html', cp_id=cp_id, product_name=product, channel_id=channel)

@bp.route('/subscribe', methods=['POST'])
def subscribe():
    data = request.get_json() or {}
    msisdn = data.get("msisdn", "").strip()
    product_name = data.get("product_name", "").strip()
    channel_id = data.get("channel_id", "web")
    cp_id = data.get("cp_id", "default")

    if not msisdn or not product_name:
        return jsonify({"error": "Missing msisdn or product_name"}), 400

    if not is_valid_msisdn(msisdn):
        return jsonify({"error": "Invalid MSISDN. Use 2547XXXXXXXX or 2541XXXXXXXX"}), 400

    if "otp" not in data:
        success = generate_and_send_otp(msisdn)
        if success:
            otp_code = otp_store[msisdn]["code"]
            return jsonify({
                "status": "otp_sent",
                "message": "OTP sent to your phone",
                "otp_debug": otp_code  # REMOVE IN PROD
            })
        else:
            return jsonify({"error": "Failed to send OTP"}), 500
    else:
        otp = data["otp"]
        if verify_otp(msisdn, otp):
            # Mock billing
            activate_subscription(msisdn, product_name)
            # Record subscription with CP context
            record_subscription(cp_id, msisdn, product_name, channel_id)
            return jsonify({"status": "success", "message": f"Subscribed to {product_name}!"})
        else:
            return jsonify({"error": "Invalid or expired OTP"}), 400

# CP Routes
@bp.route('/cp/login', methods=['GET', 'POST'])
def cp_login():
    if request.method == 'POST':
        cp_id = request.form.get('cp_id')
        password = request.form.get('password')
        if CP_CREDENTIALS.get(cp_id) == password:
            session['cp_id'] = cp_id
            return redirect('/api/v1/cp/dashboard')
        else:
            return "Invalid credentials", 401
    return render_template('cp/login.html')

@bp.route('/cp/dashboard')
def cp_dashboard():
    cp_id = session.get('cp_id')
    if not cp_id:
        return redirect('/api/v1/cp/login')
    from app.services.billing_service import get_cp_subscriptions
    subs = get_cp_subscriptions(cp_id)
    return render_template('cp/dashboard.html', cp_id=cp_id, subscriptions=subs)
