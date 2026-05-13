from flask import Blueprint, request
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)

from app.models.market import Market
from app.models.market_outcome import MarketOutcome

from app.markets.services import create_market
from app.extensions import db

market_bp = Blueprint("markets", __name__)


# CREATE MARKET
@market_bp.route("/create", methods=["POST"])
@jwt_required()
def create():

    user_id = get_jwt_identity()

    data = request.get_json()

    market, outcomes = create_market(data, user_id)

    return {
        "message": "Market created",
        "market_id": market.id
    }


# GET ALL MARKETS
@market_bp.route("/", methods=["GET"])
def get_markets():

    markets = Market.query.all()

    result = []

    for market in markets:

        outcomes = MarketOutcome.query.filter_by(
            market_id=market.id
        ).all()

        result.append({
            "id": market.id,
            "title": market.title,
            "description": market.description,
            "type": market.type,
            "status": market.status,
            "outcomes": [
                {
                    "id": outcome.id,
                    "title": outcome.title,
                    "odds": outcome.odds
                }
                for outcome in outcomes
            ]
        })

    return result


# GET SINGLE MARKET
@market_bp.route("/<int:market_id>", methods=["GET"])
def get_market(market_id):

    market = Market.query.get_or_404(market_id)

    outcomes = MarketOutcome.query.filter_by(
        market_id=market.id
    ).all()

    return {
        "id": market.id,
        "title": market.title,
        "description": market.description,
        "type": market.type,
        "status": market.status,
        "outcomes": [
            {
                "id": outcome.id,
                "title": outcome.title,
                "odds": outcome.odds
            }
            for outcome in outcomes
        ]
    }


# UPDATE STATUS
@market_bp.route("/<int:market_id>/status", methods=["PATCH"])
@jwt_required()
def update_status(market_id):

    data = request.get_json()

    market = Market.query.get_or_404(market_id)

    market.status = data["status"]

    db.session.commit()

    return {
        "message": "Status updated"
    }