from django.conf.urls.defaults import patterns, include, url
from django.conf import settings

from aabill import views
# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
   url(r'^api-auth/', include('rest_framework.urls')),
   url(r'^aabill/',include('aabill.urls')),
   url(r'^admin/', include(admin.site.urls))
)

urlpatterns+=patterns("",
        (r"^media/(?P<path>.*)$","django.views.static.serve",{'document_root':settings.MEDIA_ROOT}),)
