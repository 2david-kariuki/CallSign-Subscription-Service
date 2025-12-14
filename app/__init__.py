from flask import Flask, render_template, session
from app.config import config_by_name

def create_app(config_name="development"):
    app = Flask(__name__,
                template_folder='../templates',
                static_folder='../static')
    app.config.from_object(config_by_name[config_name])
    app.secret_key = app.config.get("SECRET_KEY", "dev-secret")

    @app.route('/')
    def index():
        return render_template('index.html')

    @app.route('/admin')
    def admin_dashboard():
        from app.services.billing_service import get_all_subscriptions
        subs = get_all_subscriptions()
        return render_template('admin/dashboard.html', subscriptions=subs)

    from app.api.v1 import bp as api_v1_bp
    app.register_blueprint(api_v1_bp, url_prefix='/api/v1')

    return app
