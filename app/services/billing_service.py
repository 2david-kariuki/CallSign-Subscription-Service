from flask import current_app
import time

# In-memory list (dev only)
subscriptions = []

def activate_subscription(msisdn: str, product_name: str) -> bool:
    subscriptions.append({
        "msisdn": msisdn,
        "product_name": product_name,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    })
    current_app.logger.info(f"✅ Subscribed: {msisdn} → {product_name}")
    return True

def get_all_subscriptions():
    return subscriptions
