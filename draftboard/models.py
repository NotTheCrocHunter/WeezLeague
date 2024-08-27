from django.db import models

# Create your models here.
class ScriptRun(models.Model):
    script_name = models.CharField(max_length=100, unique=True)
    last_run_time = models.DateTimeField()
    data = models.JSONField(null=True, blank=True)  # Field to store the JSON data
    
    def __str__(self):
        return self.script_name