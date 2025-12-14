# In app/__init__.py, inside create_app()
from flask import Flask, render_template

def create_app(config_name="development"):
    app = Flask(__name__, 
                template_folder='../templates',   # tells Flask where templates are
                static_folder='../static')        # tells Flask where static files are
    app.config.from_object(config_by_name[config_name])

    @app.route('/')
    def index():
        return render_template('index.html')

    from app.api.v1 import bp as api_v1_bp
    app.register_blueprint(api_v1_bp, url_prefix='/api/v1')

    return app