from app import create_app
from app.extensions import socketio
from app.markets.live_odds import live_odds_engine

app = create_app()

live_odds_engine.init_app(app)

@app.before_request
def start_live_odds():
    if not live_odds_engine.running:
        live_odds_engine.start()

if __name__ == "__main__":
    try:
        live_odds_engine.start()
        print("Live odds engine started")
    except Exception as e:
        print(f"Failed to start live odds engine: {e}")
    socketio.run(
        app,
        debug=True
    )