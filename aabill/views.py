# Create your views here.
from models import User
from models import Activity, Process
from serializers import UserSerializer, ActivitySerializer, ProcessSerializer
from rest_framework import generics
from django.http import Http404, HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
import json
import sys
import pdb
from django.shortcuts import render_to_response


def index(request):
    return render_to_response("apps/aabill.html")

class UserList(generics.ListCreateAPIView):
    model = User
    serializer_class = UserSerializer

class ActivityList(generics.ListCreateAPIView):
    model = Activity
    serializer_class = ActivitySerializer

"""
activity=["a","b"]
list=[
"name":"your name", "email":"x@x.com", "remain",40
]
"""
class CompactLoadView(APIView):
    def get(self, request, format=None):
        activities = Activity.objects.all()
        serializer = ActivitySerializer(activities, many=True)
        activities_text = "activity_list=" + JSONRenderer().render([i['name'] for i in serializer.data])

        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        users_text = "list=" + JSONRenderer().render(serializer.data)

        text = activities_text + "\n" + users_text

        return HttpResponse(text, mimetype="application/json")


#class UserDetail(APIView):
    #"""
    #Retrieve and delete
    #"""
    #def get_object(self, pk):
        #try:
            #if pk.isdigit():
                #return User.objects.get(pk=pk)
            #else:
                #return User.objects.get(username=pk)
        #except User.DoesNotExist:
            #raise Http404
    #def get(self, request, pk, format=None):
        #u = self.get_object(pk)
        #serializer = UserSerializer(u)
        #return Response(serializer.data)

    #def delete(self, request, pk, format=None):
        #u = self.get_object(pk)
        #u.delete()
        #return Response(status=204)



class SubmitProcess(APIView):
    def post(self, request, format=None):
        date = request.DATA.get('date')
        try:
            activity = Activity.objects.get(name=request.DATA.get('activity'))
        except Activity.DoesNotExist:
            activity = Activity(name=request.DATA.get('activity'), average_price=0)
            activity.save()

        p = Process(date=request.DATA.get('date'), activity=activity, average_price=0)
        p.save()

        consumer_list = json.loads(request.DATA.get('list'))
        user_to_be_saved = []
        total = 0
        try:
            for num, i in enumerate(consumer_list):
                name = i.get('name')
                prepay = i.get('prepay')
                consume = i.get('consume')
                #check name
                user = User.objects.get(name=name)
                p.participants.add(user)

                #user money
                user.remain += prepay - consume

                user_to_be_saved.append(user)
                total += consume
                #send email
        except:
            print sys.exc_info()
            p.delete()
            return Response(status=404)

        #caculate the average price of process
        p.average_price =total/(num +1)
        #caculate the average price of activity
        if p.average_price == 0:
            activity.average_price = p.average_price
        else:
            activity.average_price = (p.average_price + activity.average_price)/2

        p.save()
        for i in user_to_be_saved:
            i.save()
        return Response({"detail":"success"} ,status=200)

class UserDetail(generics.RetrieveDestroyAPIView):
    model = User
    serializer_class = UserSerializer
    def get_object(self, queryset=None):
        user = self.kwargs['pk']
        try:
          if user.isdigit():
              return User.objects.get(id=user)
          else:
              return User.objects.get(name=user)
        except User.DoesNotExist:
            raise Http404


class ProcessList(generics.ListAPIView):
    model = Process
    serializer_class = ProcessSerializer
    def get_queryset(self, queryset=None):
        user = self.kwargs['pk']
        if user.isdigit():
            return Process.objects.filter(participants__id=user)
        else:
            return Process.objects.filter(participants__name=user)

