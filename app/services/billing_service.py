from flask import current_app, session
import time

# In-memory storage
subscriptions = []

def activate_subscription(msisdn: str, product_name: str) -> bool:
    current_app.logger.info(f"✅ Subscribed: {msisdn} → {product_name}")
    return True

def record_subscription(cp_id: str, msisdn: str, product_name: str, channel_id: str):
    subscriptions.append({
        "cp_id": cp_id,
        "msisdn": msisdn,
        "product_name": product_name,
        "channel_id": channel_id,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    })

def get_cp_subscriptions(cp_id: str):
    return [s for s in subscriptions if s["cp_id"] == cp_id]

def get_all_subscriptions():
    return subscriptions
