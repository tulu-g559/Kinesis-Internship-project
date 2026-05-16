from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.bets.services import place_bet, get_user_bets, get_user_positions
from app.markets.services import get_orderbook
from app.middleware.auth_middleware import user_required

bet_bp = Blueprint("bets", __name__)


@bet_bp.route("/place", methods=["POST"])
@jwt_required()
@user_required
def place():
    user_id = get_jwt_identity()
    data = request.get_json()

    bet, error = place_bet(
        user_id=user_id,
        market_id=data.get("market_id"),
        outcome_id=data.get("outcome_id"),
        side=data.get("side"),
        stake=data.get("stake"),
        odds=data.get("odds")
    )

    if error:
        return {"error": error}, 400

    return {
        "message": "Bet placed successfully",
        "bet": {
            "id": bet.id,
            "market_id": bet.market_id,
            "outcome_id": bet.outcome_id,
            "side": bet.side,
            "stake": bet.stake,
            "odds": bet.odds,
            "status": bet.status,
            "remaining_amount": bet.remaining_amount
        }
    }, 201


@bet_bp.route("/my", methods=["GET"])
@jwt_required()
@user_required
def my_bets():
    user_id = get_jwt_identity()
    bets = get_user_bets(user_id)

    return {"bets": bets}, 200


@bet_bp.route("/positions", methods=["GET"])
@jwt_required()
@user_required
def my_positions():
    user_id = get_jwt_identity()
    positions = get_user_positions(user_id)

    return {"positions": positions}, 200


@bet_bp.route("/market/<int:market_id>/orderbook", methods=["GET"])
def orderbook(market_id):
    orderbook = get_orderbook(market_id)

    if not orderbook:
        return {"error": "Market not found"}, 404

    return orderbook, 200