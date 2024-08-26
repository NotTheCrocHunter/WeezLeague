from sleeper_wrapper import League
from .decorators import timing_decorator, script_run_decorator
from datetime import timedelta


@script_run_decorator(script_name='scoring_settings', time_threshold=timedelta(hours=24))
def fetch_scoring_settings(league_id=1115133350399938560):
    league = League(league_id)
    league_data = league.get_league()
    scoring_settings = league_data['scoring_settings']
    return scoring_settings
