from .decorators import timing_decorator, script_run_decorator
from .fetch_all_players import fetch_all_players
from .fetch_year_projections import fetch_year_projections
from .fetch_scoring_settings import fetch_scoring_settings
from .fetch_fpros_data import fetch_fpros_data, merge_dicts
from sleeper_wrapper import League, Drafts
from datetime import datetime, timedelta


"""
http://localhost:8000/api/draftboard_player_pool/

"""
@script_run_decorator(script_name='draftboard', time_threshold=timedelta(hours=24))
@timing_decorator
def fetch_draftboard_player_pool():
    filter_keys = ['adp_ppr', 'first_name', 'last_name', 'team', 'position']
    cols_to_skip = ['pts_std', 'pts_half_ppr', 
                    'adp_std', 'adp_rookie', 'adp_idp', 'adp_half_ppr', 
                    'adp_dynasty_std', 'adp_dynasty_ppr', 'adp_dynasty_half_ppr',
                    'adp_dynasty_2qb', 'adp_dynasty', 'adp_2qb']
    
    all_players = fetch_all_players() # Dict
    year_projections = fetch_year_projections() # Dict
    scoring_settings = fetch_scoring_settings()
    fpros_data = fetch_fpros_data()
    player_pool = []
    # combined_fpros_year_projections = merge_dicts(year_projections, fpros_data)
    fpros_cols = ['pos_rank', 'ovr_tier', 'ovr_rank_ecr', 'pos_tier', 'pos_rank_ecr']

    for key, projection in year_projections.items():
        if key not in fpros_data.keys():
            continue
        else:
            current_player = {'sleeper_id': key, 'adp_ppr': projection['adp_ppr']}
            # Calculate custom points
            current_player_points = 0
            for k, v in projection.items():
                if k in scoring_settings.keys():
                    current_player_points += (v * scoring_settings[k])
            current_player['pts'] = round(current_player_points, 1)
            current_player['first_name'] = all_players[key]['first_name']
            current_player['last_name'] = all_players[key]['last_name']
            current_player['team'] = all_players[key]['team']
            current_player['position'] = all_players[key]['position']
           
            for col in fpros_cols:
                if col in fpros_data[key].keys():
                    current_player[col] = fpros_data[key][col]

        player_pool.append(current_player)
    
    # Sort draftboard by 'adp_ppr'
    player_pool = sorted(player_pool, key=lambda x: x.get('adp_ppr', float('inf')))
    for i, player in enumerate(player_pool):
        player['adp_sort'] = i + 1
        player['picked_by'] = None
        player['pick_no'] = None
        player['is_keeper'] = None
        player['round'] = None
        player['draft_slot'] = None
    
    return player_pool[:216]  # fpros_data, str(type(all_players)), year_projections # player_pool[:216]