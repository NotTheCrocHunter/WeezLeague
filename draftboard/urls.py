from django.urls import path
from . import views

urlpatterns = [
    path('all_players/', views.all_players_view, name='all_players'),
    path('active_players/', views.active_players_view, name='active_players'),  # New URL pattern
    path('inactive_qbs/', views.inactive_qbs_view, name='inactive_qbs'),
    path('active_qbs/', views.active_qbs_view, name='active_qbs'),
    path('projections_year/', views.projections_year_view, name='projections_year'),
    path('projections_ppr/', views.projections_ppr_view, name='projections_ppr'),
    path('draftboard/', views.draftboard_view, name='draftboard'),
    path('keeper_values/', views.keeper_value_view, name='keeper_values'),
    path('api/projections_ppr/', views.api_projections_ppr, name='api_projections_ppr'),
    path('api/keeper_values/', views.api_keeper_values, name='api_keeper_values'),
    path('api/draftboard_player_pool/', views.api_draftboard_player_pool, name='api_draftboard'),
    path('api/fpros_data/', views.api_fpros_data, name='api_fpros_data'),
    path('api/all_players', views.api_all_players, name='api_all_players'),
    path('api/download-player-avatars/', views.download_player_avatars, name='download_player_avatars'),
    path('api/draft_lottery', views.api_draft_lottery, name='api_draft_lottery'),
    path('api/owners', views.api_league_owners, name='api_league_owners')
]