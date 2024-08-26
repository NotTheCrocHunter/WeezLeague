from .decorators import timing_decorator
import requests
import os
from .fetch_all_players import fetch_all_players


@timing_decorator
def fetch_player_avatars_from_sleeper():
    all_players = fetch_all_players() # Dict
    # Define the base directory where images will be stored
    base_dir = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'public', 'assets', 'player_images')

    # Create the directory if it does not exist
    os.makedirs(base_dir, exist_ok=True)

    success_count = 0
    failure_count = 0


    for k in all_players.keys():
        url = f'https://sleepercdn.com/content/nfl/players/{k}.jpg'
        image_path = os.path.join(base_dir, f'{k}.jpg')

        # Fetch the image and save it to the specified path
        try:
            response = requests.get(url)
            response.raise_for_status()  # Raise an error on a bad response

            with open(image_path, 'wb') as f:
                f.write(response.content)

            print(f'Successfully downloaded {k}.jpg')
            success_count += 1

        except requests.exceptions.RequestException as e:
            print(f'Failed to download {k}.jpg: {e}')
            failure_count += 1
    
    return success_count, failure_count