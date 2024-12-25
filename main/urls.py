from django.urls import path

from main import views

app_name = 'main'

urlpatterns = [
    path ('', views.index, name='index'),
    path ('about/', views.about, name='about'),
    path ('contacts/', views.contacts, name='contacts'),
    path ('delivery_information/', views.delivery_information, name='delivery_information'),
]