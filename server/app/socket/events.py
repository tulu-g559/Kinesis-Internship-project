from flask_socketio import emit


def emit_odds_update(data, socketio):
    socketio.emit(
        "odds_update",
        data
    )


def emit_market_update(data, socketio):
    socketio.emit(
        "market_update",
        data
    )


def emit_bet_matched(data, socketio):
    socketio.emit(
        "bet_matched",
        data
    )


def emit_orderbook_update(data, socketio):
    socketio.emit(
        "orderbook_update",
        data
    )


def emit_live_activity(data, socketio):
    socketio.emit(
        "live_activity",
        data
    )


def emit_admin_transaction_notification(user_id, data, socketio):
    """Emit transaction notification to specific admin user"""
    socketio.emit(
        "admin_transaction",
        data,
        room=f"user_{user_id}"
    )
