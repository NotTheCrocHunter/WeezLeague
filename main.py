from sleeper_wrapper import Players, Stats, Drafts, League

league_id = '981251192351240193'
drafts = Drafts(league_id)
draft = drafts.get_all_picks()
print(draft)
"""def check_json_response(url):
    response = requests.get(url)
    # Print first 500 characters of the response to check if it's HTML
    print(response.text[:500])

check_json_response("http://127.0.0.1:8000/api/projections_ppr/")
print('stop')

"""
"""
# Stats testing
stats = Stats()

# pulls all of the stats for week 1 of the 2023 regular season
week_stats = stats.get_week_stats("regular", 2023, 1)

# retrieves stats for the Detroit defense for the provided week
score = stats.get_player_week_score(week_stats, "DET")
mahomes_id = '4046'
print(week_stats['7004'])
projections = stats.get_all_projections(season_type="regular", season="2024")
print(projections)
"""