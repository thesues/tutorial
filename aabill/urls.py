from django.conf.urls.defaults import patterns, include, url
from django.conf import settings
import views

urlpatterns = patterns('',
   url(r'^api/user/$', views.UserList.as_view()),
   url(r'^api/user/(?P<pk>\w+)/$', views.UserDetail.as_view()),
   url(r'^api/activity/$', views.ActivityList.as_view()),
   url(r'^api/process/(?P<pk>\w+)/$', views.ProcessList.as_view()),
   url(r'^api/submitprocess/$', views.SubmitProcess.as_view()),
   url(r'^api/compact_load/$', views.CompactLoadView.as_view()),
   url(r'^$', views.index),
)
