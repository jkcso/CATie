from django.shortcuts import render
from .models import CalendarEvent
from .serializers import CalendarEventSerializer
from rest_framework import generics


class CalendarEventList(generics.ListCreateAPIView):
    queryset = CalendarEvent.objects.all()
    serializer_class = CalendarEventSerializer


class CalendarEventDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = CalendarEvent.objects.all()
    serializer_class = CalendarEventSerializer
