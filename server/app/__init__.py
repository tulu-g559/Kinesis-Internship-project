from flask import Flask
from flask_cors import CORS

from app.config import Config
from app.extensions import db, jwt, bcrypt, migrate, socketio
from app.markets.routes import market_bp
from app.bets.routes import bet_bp

def create_app():
    app = Flask(__name__)

    app.config.from_object(Config)

    CORS(app)

    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    migrate.init_app(app, db)
    socketio.init_app(app)

    from app.models import User, Wallet, Transaction, Bet

    from app.auth.routes import auth_bp
    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    app.register_blueprint(market_bp, url_prefix="/api/markets")

    app.register_blueprint(bet_bp, url_prefix="/api/bets")

    from app.admin.routes import admin_bp
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    from app.wallet.routes import wallet_bp
    app.register_blueprint(wallet_bp, url_prefix="/api/wallet")

    return app