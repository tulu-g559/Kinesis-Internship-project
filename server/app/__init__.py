from flask import Flask
from flask_cors import CORS

from app.config import Config
from app.extensions import db, jwt, bcrypt, migrate
from app.markets.routes import market_bp

def create_app():
    app = Flask(__name__)

    app.config.from_object(Config)

    CORS(app)

    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    migrate.init_app(app, db)

    from app.models import User, Wallet, Transaction

    from app.auth.routes import auth_bp
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    
    # Registered the market blueprint here
    app.register_blueprint(market_bp, url_prefix="/api/markets")

    return app