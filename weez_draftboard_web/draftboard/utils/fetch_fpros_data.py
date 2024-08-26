from .decorators import timing_decorator, script_run_decorator
from sleeper_wrapper import League, Drafts, Stats
from datetime import datetime, timedelta
from .fetch_all_players import fetch_all_players
from .fetch_year_projections import fetch_year_projections
import requests
from bs4 import BeautifulSoup
import re
from datetime import datetime
import json
import pandas as pd
from collections import defaultdict, Counter
from typing import List, Tuple


# CONSTANT
YEAR = datetime.now().year
CSV_PATH = "matched_players.csv"

# Function to merge dictionaries handling key duplication as described
def merge_dicts(d1, d2):
    for key, value in d2.items():
        if key in d1:
            if d1[key] != value:
                # If values are different, create a new key
                new_key = f"{key}_duplicate"
                counter = 1
                while new_key in d1:
                    new_key = f"{key}_duplicate{counter}"
                    counter += 1
                d1[new_key] = value
        else:
            d1[key] = value
    return d1

@script_run_decorator(script_name='known_ids', time_threshold=timedelta(hours=0))
@timing_decorator
def load_known_ids(csv_path):
    try:
        df = pd.read_csv(csv_path)
        df = df.fillna('')
        return dict(zip(df['fpros_id'], df['sleeper_id']))
    except FileNotFoundError:
        return {}

def save_ids(player_list, csv_path):
    df = pd.DataFrame(player_list)
    df.to_csv(csv_path, index=False)

def clean_player_name(name):
    if name[-4:] in [' Jr.', ' Sr.', ' III']:
        return name[:-4]
    elif name[-3:] in [' II']:
        return name[:-3]
    return name

def match_sleeper_id(fpros_players: List[dict]) -> Tuple[List[dict], List[dict]]:
    sleeper_players = fetch_all_players()
    matched_players = []
    unmatched_players = []

    for fpros_player in fpros_players:
        fpros_name = clean_player_name(fpros_player['player_name'])
        fpros_team = 'JAX' if fpros_player['player_team_id'] == 'JAC' else fpros_player['player_team_id']
        fpros_position = fpros_player['player_positions']

        if fpros_position == 'DST':
            fpros_player['sleeper_id'] = fpros_team
            matched_players.append(fpros_player)
            continue
        
        position_map = {'FB': 'RB'}
        fpros_position = position_map.get(fpros_position, fpros_position)

        filtered_sleeper_players = [
            player for player in sleeper_players.values()
            if player['position'] == fpros_position and (player['team'] == fpros_team or (fpros_team == 'FA' and not player['team']))
        ]

        fpros_name_parts = fpros_name.split()
        fpros_last_name = ' '.join(fpros_name_parts[1:]) if len(fpros_name_parts) > 2 else fpros_name_parts[-1]
        fpros_first_name = fpros_name_parts[0] if len(fpros_name_parts) > 1 else ''

        matched = False
        for sleeper_player in filtered_sleeper_players:
            if fpros_last_name == sleeper_player['last_name'] and fpros_first_name == sleeper_player['first_name']:
                fpros_player['sleeper_id'] = sleeper_player['player_id']
                matched_players.append(fpros_player)
                matched = True
                break

        if not matched:
            unmatched_players.append(fpros_player)

    return matched_players, unmatched_players

@script_run_decorator(script_name='fpros_ids', time_threshold=timedelta(hours=0))
def fetch_fpros_ids():
    df = pd.read_csv("matched_players.csv")
    # Check for missing fpros_ids and sleeper_ids

    missing_sleeper_ids = df[df['sleeper_id'].isna()]
    print(missing_sleeper_ids.to_dict('records'))
    missing_sleeper_ids = missing_sleeper_ids.fillna('')
    missing_sleeper_ids_list = missing_sleeper_ids.to_dict('records')
    all_sleeper_players = fetch_all_players()
    for player in missing_sleeper_ids_list:
        player_id = match_sleeper_id(player)
        print(player)
    # Save missing sleeper_ids to a CSV
    missing_sleeper_ids.to_csv('missing_sleeper_ids.csv', index=False)
    
    # Remove rows with missing fpros_id or sleeper_id
    df = df.dropna(subset=['fpros_id', 'sleeper_id'])

    # Create dictionary with fpros_id as key and sleeper_id as value
    fpros_ids = dict(zip(df['fpros_id'], df['sleeper_id']))

    for k, v in fpros_ids.items():
        if v.replace('.', '').isdigit():  # Check if v is a float representation
            fpros_ids[k] = str(int(float(v)))  # Convert to int to remove ".0" and then to string
    
    return missing_sleeper_ids_list

def fetch_fpros_page(page):
    url = f"https://www.fantasypros.com/nfl/rankings/{page}-cheatsheets.php"
    response = requests.get(url)
    if response.status_code != 200:
        raise Exception(f"Failed to load page {url}")
    
    # Parse the page and get the players list of dictionaries
    soup = BeautifulSoup(response.content, "html.parser")
    pattern = re.compile(r"(?<=var ecrData = )[^;]+", re.MULTILINE)
    script = soup.find("script", {"type": "text/javascript"}, text=pattern)
    data = pattern.search(script.text).group(0)

    fpros_player_list = json.loads(data)['players']
    fpros_data = {f['player_id']: f for f in fpros_player_list}
    prefix = "ovr" if page == "ppr" else "pos"

    # Update keys with appropriate prefixes, set missing values to None
    for player_id, player_data in fpros_data.items():
        player_data[f'{prefix}_tier'] = player_data.pop('tier', None)
        player_data[f'{prefix}_rank_ecr'] = player_data.pop('rank_ecr', None)

    return fpros_player_list

@script_run_decorator(script_name='fantasy_pros_data', time_threshold=timedelta(hours=24))
@timing_decorator
def fetch_fpros_data():
    page_type = ["ppr", "qb", "rb", "wr", "te"]
    fpros_pages = []
    for p in page_type: 
        fpros_pages.append(fetch_fpros_page(p))

    # Dictionary to store merged results
    merged_dict = defaultdict(dict)
    # df = pd.read_csv("/weez_draftboard_web/draftboard/data/fpros_ids/matched.csv")
    df = pd.read_csv('matched.csv')
    fpros_sleeper_dict = df.set_index('fpros_id')['sleeper_id'].to_dict()

    # Iterate through each table and merge dictionaries by 'player_id'
    for table in fpros_pages:
        for entry in table:
            entry['fpros_id'] = entry.pop('player_id')
            fpros_id = entry.get("fpros_id", None)
            entry['sleeper_id'] = fpros_sleeper_dict.get(fpros_id, None)  # Add sleeper_id from matched_dict
            merged_dict[fpros_id] = merge_dicts(merged_dict[fpros_id], entry)
    
    # Convert merged_dict back to a list of dictionaries
    fpros_players = [v for v in merged_dict.values()]
    sleeper_dict = {v['sleeper_id']: v for v in merged_dict.values()}
    return sleeper_dict # merged_dict

"""
def fetch_fpros_data():
    pages = ['ppr', 'qb', 'ppr-rb', 'ppr-wr', 'ppr-te']

    base_url = f"https://www.fantasypros.com/nfl/rankings/{}-cheatsheets.php"
    # print(f'Fetching {url}')
    response = requests.get(base_url)
    if response.status_code != 200:
        raise Exception(f"Failed to load page {base_url}")

    soup = BeautifulSoup(response.content, "html.parser")
    pattern = re.compile(r"(?<=var ecrData = )[^;]+", re.MULTILINE)
    script = soup.find("script", {"type": "text/javascript"}, text=pattern)
    data = pattern.search(script.text).group(0)

    # make dict of json data
    fpros_data = json.loads(data)

    # get list of fpros players and sleeper players to match
    fpros_players = fpros_data['players']
    sleeper_players = fetch_all_players()
    print(f'Fpros players length {len(fpros_players)}')
    # Create a list to store the matched player data
    matched_players = []

    # Filter and match players
    for fpros_player in fpros_players:
        fpros_id = fpros_player['player_id']
        fpros_name = fpros_player['player_name']
        if fpros_name[-4:] in [' Jr.', ' Sr.', ' III']:
            fpros_name = fpros_name[:-4]
        elif fpros_name[-3:] in [' II']:
            fpros_name = fpros_name[:-3]

        fpros_team = fpros_player['player_team_id']
        if fpros_team == 'JAC':
            fpros_team = 'JAX'

        fpros_position = fpros_player['player_positions']
        matched_sleeper_id = None
        # The sleeper IDs for the defenses are the team abbreviations
        if fpros_position == 'DST':
            matched_sleeper_id = fpros_team
            
        # Filter sleeper players by position and team, including "FA" and null team values
        filtered_sleeper_players = [
            player for player in sleeper_players.values()
            if player['position'] == fpros_position and (player['team'] == fpros_team or (fpros_team == 'FA' and not player['team']))
        ]

        # Extract first and last name components
        fpros_name_parts = fpros_name.split()
        fpros_last_name = ' '.join(fpros_name_parts[1:]) if len(fpros_name_parts) > 2 else fpros_name_parts[-1]
        fpros_first_name_initial = fpros_name_parts[0][0] if len(fpros_name_parts) > 1 else ''

        for sleeper_player in filtered_sleeper_players:
            if fpros_last_name == sleeper_player['last_name']:
                if len(fpros_first_name_initial) > 0 and fpros_first_name_initial == sleeper_player['first_name'][0]:
                    matched_sleeper_id = sleeper_player['player_id']
                    break

        fpros_player['sleeper_id'] = matched_sleeper_id

    # Save the matched players to a CSV file
    df = pd.DataFrame(fpros_players)
    csv_path = "matched_players.csv"
    df.to_csv(csv_path, index=False)
    print(f'Matched players length {len(matched_players)}')
    return fpros_players
    """








