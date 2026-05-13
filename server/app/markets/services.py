from app.extensions import db
from app.models.market import Market
from app.models.market_outcome import MarketOutcome


def create_market(data, user_id):

    market = Market(
        title=data["title"],
        description=data["description"],
        type=data["type"],
        created_by=user_id
    )

    db.session.add(market)
    db.session.commit()

    outcomes = []

    for outcome in data["outcomes"]:

        market_outcome = MarketOutcome(
            market_id=market.id,
            title=outcome["title"],
            odds=outcome["odds"]
        )

        db.session.add(market_outcome)

        outcomes.append(market_outcome)

    db.session.commit()

    return market, outcomes