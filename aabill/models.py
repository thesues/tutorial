from django.db import models
from django.contrib import admin

class User(models.Model):
    name = models.CharField(max_length=100, unique=True)
    email = models.CharField(max_length=100)
    #remain = models.DecimalField(decimal_places=1,max_digits=6)
    remain = models.FloatField()

class Activity(models.Model):
    name = models.CharField(max_length=100,unique=True)
    #average_price = models.DecimalField(decimal_places=1,max_digits=6)
    average_price = models.FloatField()

    #date = models.IntegerField()

class Process(models.Model):
    participants = models.ManyToManyField (User, related_name='activities')
    activity = models.ForeignKey(Activity, related_name='activities')
    #average_price = models.DecimalField(decimal_places=1,max_digits=6)
    average_price = models.FloatField()
    date = models.DateField()

