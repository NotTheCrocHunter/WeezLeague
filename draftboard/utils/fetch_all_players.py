from sleeper_wrapper import Players
from .decorators import script_run_decorator, timing_decorator
from datetime import timedelta


@script_run_decorator(script_name='all_players', time_threshold=timedelta(hours=24))
@timing_decorator
def fetch_all_players():
    # Your script logic here
    players = Players()
    # gets all NFL players in the Sleeper system
    all_players = players.get_all_players(sport="nfl")
    return all_players