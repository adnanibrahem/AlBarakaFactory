from django.contrib import admin

from Apps.Agents.models import Destination


class FormDestination(admin.ModelAdmin):
    list_display = ['title','deleted']

admin.site.register(Destination, FormDestination)
 
