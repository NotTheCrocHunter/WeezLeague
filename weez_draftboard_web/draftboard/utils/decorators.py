import time
import logging
from datetime import timedelta
from django.utils import timezone
from ..models import ScriptRun

# Set up logging
logger = logging.getLogger(__name__)

def timing_decorator(func):
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        logger.info(f"{func.__name__} execution time: {end_time - start_time:.2f} seconds")
        return result
    return wrapper

def script_run_decorator(script_name, time_threshold):
    def decorator(func):
        def wrapper(*args, **kwargs):
            now = timezone.now()
            try:
                script_run = ScriptRun.objects.get(script_name=script_name)
                if now - script_run.last_run_time > time_threshold:
                    print(f"Script {script_name} has not been run recently, so running now")
                    data = func(*args, **kwargs)
                    script_run.last_run_time = now
                    script_run.data = data
                    script_run.save()
                else:
                    print(f'Using the Existing {script_name} Data')
                    data = script_run.data
            except ScriptRun.DoesNotExist:
                print(f"Script {script_name} has never been run before, so running now")
                data = func(*args, **kwargs)
                ScriptRun.objects.create(script_name=script_name, last_run_time=now, data=data)
            return data
        return wrapper
    return decorator