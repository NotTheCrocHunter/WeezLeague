from django.shortcuts import render
# from .utils.fetch_draftboard_player_pool import fetch_draftboard_player_pool
from .utils.decorators import timing_decorator
from django.http import JsonResponse
from sleeper_wrapper import Players, Stats, Drafts, League
from . import utils

@timing_decorator
def keeper_value_view(request):
    keeper_values = utils.fetch_keeper_value_report()
    return render(request, 'draftboard/keeper_values.html', {'keeper_values': keeper_values})

@timing_decorator
def all_players_view(request):
    all_players = utils.fetch_all_players()
    return render(request, 'draftboard/all_players.html', {'all_players': all_players})

@timing_decorator
def active_players_view(request):
    all_players = utils.fetch_all_players()
    active_players = {key: value for key, value in all_players.items() if value.get('active')}
    return render(request, 'draftboard/active_players.html', {'active_players': active_players})

@timing_decorator
def inactive_qbs_view(request):
    all_players = utils.fetch_all_players()
    inactive_qbs = {
        key: value for key, value in all_players.items()
        if value.get('position') == 'QB' and not value.get('active', True)
    }
    return render(request, 'draftboard/inactive_qbs.html', {'inactive_qbs': inactive_qbs})

@timing_decorator
def active_qbs_view(request):
    all_players = utils.fetch_all_players()
    active_qbs = {
        key: value for key, value in all_players.items()
        if value.get('position') == 'QB' and value.get('active', True)
    }
    return render(request, 'draftboard/active_qbs.html', {'active_qbs': active_qbs})

@timing_decorator
def projections_year_view(request):
    year_projections = utils.fetch_year_projections()
    all_players = utils.fetch_all_players()
    for k in year_projections.keys():
        year_projections[k]['first_name'] = all_players[k]['first_name']
        year_projections[k]['last_name'] = all_players[k]['last_name']
        year_projections[k]['fantasy_positions'] = all_players[k]['fantasy_positions']
    # Sort year_projections by adp_ppr
    sorted_year_projections = dict(sorted(year_projections.items(), key=lambda item: item[1].get('adp_ppr', float('inf'))))
    return render(request, 'draftboard/projections_year.html', {'year_projections': sorted_year_projections})

@timing_decorator
def projections_ppr_view(request):
    filtered_projections = utils.fetch_year_projections()
    return render(request, 'draftboard/projections_ppr.html', {'ppr_projections': filtered_projections})

@timing_decorator
def draftboard_view(request):
    filtered_projections = utils.fetch_year_projections()
    return render(request, 'draftboard/draftboard.html', {'filtered_projections': filtered_projections})

@timing_decorator
def index(request):
    return render(request, 'frontend/index.html')

@timing_decorator
def api_projections_ppr(request):
    print('api_projections_ppr')
    try:
        filtered_projections = utils.fetch_year_projections()
        print('Success')
        for k, v in filtered_projections.items():
            filtered_projections[k]['sleeper_id'] = k
        projections_list = list(filtered_projections.values())
        return JsonResponse(projections_list, safe=False)
    except Exception as e:
        print(f"Error in api_projections_ppr: {e}")
        return JsonResponse({'error': 'An error occurred'}, status=500)
    
@timing_decorator
def api_keeper_values(request):
    keeper_values = utils.fetch_keeper_value_report()
    return JsonResponse(keeper_values, safe=False)

@timing_decorator
def api_draftboard_player_pool(request):
    draftboard_player_pool = utils.fetch_draftboard_player_pool()
    print(len(draftboard_player_pool))
    return JsonResponse(draftboard_player_pool, safe=False)

def api_fpros_data(request):
    fpros_data = utils.fetch_fpros_data()
    return JsonResponse(fpros_data, safe=False)

def download_player_avatars(request):
    success_count, failure_count = utils.fetch_player_avatars()
    return JsonResponse({
        'success_count': success_count,
        'failure_count': failure_count
    })

def api_all_players(request):
    all_players = utils.fetch_all_players()
    all_players = [v for v in all_players.values()]

    # Extract all unique fields
    unique_fields = set()
    for player in all_players:
        unique_fields.update(player.keys())

    return JsonResponse(all_players, safe=False)

def api_draft_lottery(request):
    league = League(1115133350399938560)
    cur_league = league.get_league()
    prev_id = cur_league['previous_league_id']
    prev_league = League(prev_id)
    prev_playoff_results = prev_league.get_playoff_losers_bracket()
    prev_rosters = prev_league.get_rosters()
    prev_id_owner_usernames = prev_league.map_rosterid_to_owner_username(prev_rosters)
    standings = prev_league.get_standings(prev_league.get_rosters(), prev_league.get_users())
    return JsonResponse(prev_id_owner_usernames, safe=False)

def api_league_owners(request):
    owners = utils.fetch_league_owners()
    return JsonResponse(owners, safe=False)