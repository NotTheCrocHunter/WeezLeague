from .decorators import timing_decorator, script_run_decorator
from sleeper_wrapper import League, Drafts
from datetime import datetime, timedelta
from .fetch_all_players import fetch_all_players
from .fetch_year_projections import fetch_year_projections
import math


# CONSTANT
YEAR = datetime.now().year

@script_run_decorator(script_name='keeper_value_report', time_threshold=timedelta(hours=24))
@timing_decorator
def fetch_keeper_value_report(league_id=1115133350399938560):
    all_players = fetch_all_players() # Dict
    projections = fetch_year_projections() # Dict
    league = League(league_id)
    rosters_full = league.get_rosters()
    # match up owner id to owner team name
    owner_names = league.map_users_to_owner_username() # Dict
    # list of keys to use when filtering the various dicts
    filter_keys = ['adp_ppr', 'gp', 'first_name', 'last_name', 'team', 'position']
    
    # Retrieve draft rounds for the past three years
    draft_data = {}
    for offset in range(1, 4):
        draft_data[offset], year = get_draft_rounds(league_id, offset)

    keeper_value_report = []

    for roster in rosters_full:
        trimmed_roster = {
                            'owner_name': owner_names[roster['owner_id']], 
                            'player_info': []
                          }
        for player_id in roster['players']:
            player_info = filter_dict(all_players.get(player_id, {}), filter_keys)
            player_info['player_display'] = f"{player_info['first_name']} {player_info['last_name']} - {player_info['position']}, {player_info['team']}"
            player_info['sleeper_id'] = player_id
            player_info['owner_name'] = owner_names[roster['owner_id']]
            player_projection = filter_dict(projections.get(player_id, {}), filter_keys)
            player_info.update(player_projection)
            player_info[f'{YEAR}_adp_ppr_round'] = math.ceil(player_info['adp_ppr'] / 12)

            for offset in range(1, 4):
                draft_year = datetime.now().year - offset
                if player_id in draft_data[offset]:
                    player_info[f'{draft_year}_draft_round'] = draft_data[offset][player_id][f'{draft_year}_draft_round']
                    player_info[f'{draft_year}_drafted_by'] = draft_data[offset][player_id][f'{draft_year}_picked_by']
                    player_info[f'{draft_year}_was_keeper'] = draft_data[offset][player_id][f'{draft_year}_was_keeper']
                else:
                    player_info[f'{draft_year}_draft_round'] = "Undrafted"

            current_year = datetime.now().year
            last_year = current_year - 1
            two_years_ago = current_year - 2
            three_years_ago = current_year - 3

            can_keep = True
            keeper_note = ""
            # Logic to determine the proper draft rounds for 2024
            if f'{last_year}_draft_round' not in player_info or player_info[f'{last_year}_draft_round'] == "Undrafted":
                player_info[f'{current_year}_keeper_round'] = 16
                can_keep = True
            elif player_info[f'{last_year}_draft_round'] <= 3:
                player_info[f'{current_year}_keeper_round'] = "NA"
                keeper_note = "Cannot keep player drafted in first 3 rounds"
                can_keep = False
            elif  all(f'{year}_drafted_by' in player_info for year in [two_years_ago, last_year]):  
                if (player_info[f'{two_years_ago}_drafted_by'] == player_info[f'{last_year}_drafted_by'] == trimmed_roster['owner_name']) \
                    and (player_info[f'{two_years_ago}_was_keeper'] and player_info[f'{last_year}_was_keeper']):
                    can_keep = False
                    keeper_note = "Cannot keep player more than 2 consecutive years"
                    player_info[f'{current_year}_keeper_round'] = "NA"
                else:
                    player_info[f'{current_year}_keeper_round'] = player_info[f'{last_year}_draft_round'] - 2
                    can_keep = True
            else:
                player_info[f'{current_year}_keeper_round'] = player_info[f'{last_year}_draft_round'] - 2
                can_keep = True
            if can_keep:
                try:
                    player_info[f'{YEAR}_keeper_value'] = player_info[f'{YEAR}_keeper_round'] - player_info[f'{YEAR}_adp_ppr_round']
                except:
                    player_info[f'{YEAR}_keeper_value'] = 'TEST'
            else:
                player_info[f'{YEAR}_keeper_value'] = "NA"
                player_info['keeper_note'] = keeper_note

            keeper_value_report.append(player_info)
        
    return keeper_value_report

# FUNCTIONS
def filter_dict(data, keys):
    return {k: data[k] for k in keys if k in data}

def get_draft_rounds(league_id, year_offset):
    target_year = YEAR - year_offset

    # Traverse back through previous leagues to get the correct previous league ID
    prev_league_id = league_id
    for _ in range(year_offset):
        prev_league = League(prev_league_id)
        prev_league_id = prev_league._league['previous_league_id']

    prev_draft_id = str(int(prev_league_id) + 1)
    drafts = Drafts(prev_draft_id)
    draft_picks = drafts.get_all_picks()
    
    # Get owner names for the previous league
    prev_league = League(prev_league_id)
    owner_names = prev_league.map_users_to_owner_username()
    
    return {p['player_id']: {f'{target_year}_draft_round': p['round'], 
                             f'{target_year}_picked_by': owner_names[p['picked_by']],
                             f'{target_year}_was_keeper': p['is_keeper']} for p in draft_picks}, target_year
