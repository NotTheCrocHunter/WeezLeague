from sleeper_wrapper import League
from .decorators import script_run_decorator
from datetime import timedelta

"""
Function to retrieve a dictionary of the owners and their various user names and IDs. 
"""
@script_run_decorator(script_name='league_owners', time_threshold=timedelta(hours=24))
def fetch_league_owners(league_id=1115133350399938560):
    league = League(league_id)
    league_data = league.get_league()
    scoring_settings = league_data['scoring_settings']
    # owners = league.map_rosterid_to_owner_username()
    rosters_full = league.get_rosters()
    # match up owner id to owner team name
    owners = league.map_users_to_owner_username() # Dict
    owner_names = [o for o in owners.values()]
    return owners
