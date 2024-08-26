from sleeper_wrapper import Stats
from datetime import timedelta
from .decorators import timing_decorator, script_run_decorator


@script_run_decorator(script_name='year_projections', time_threshold=timedelta(hours=24))
@timing_decorator
def fetch_year_projections():
    # Your script logic here
    stats = Stats()
    # gets all NFL players in the Sleeper system
    year_projections = stats.get_all_projections(season_type='regular', season=2024)
    return year_projections