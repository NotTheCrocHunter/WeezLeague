# draftboard/custom_filters.py

from django import template

register = template.Library()

@register.filter
def in_list(value, arg):
    """Checks if a value is in a list"""
    return value in arg.split(',')
