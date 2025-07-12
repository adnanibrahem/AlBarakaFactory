from datetime import datetime, timezone
from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework.serializers import SerializerMethodField

from Apps.Agents.models import Agents, Attendes, Destination, Invoice, InvoiceItems, Material, Withdraw, WithdrawItems  
from Apps.Users.models import Users

user_profile = User


class AgentsSerializer(serializers.ModelSerializer):
    destinationTitle = SerializerMethodField()
    def get_destinationTitle(self, obj):
        if obj.destination is not None:
            return obj.destination.title
        return None
    class Meta:
        verbose_name = 'Agents List'
        model = Agents
        fields = '__all__'


class DestinationSerializer(serializers.ModelSerializer):
    class Meta:
        verbose_name = 'Destination List'
        model = Destination
        fields = '__all__'
        
class AttendesSerializer(serializers.ModelSerializer):
    class Meta:
        verbose_name = 'Attendes List'
        model = Attendes
        fields = '__all__'


class WithdrawItemsSerializer(serializers.ModelSerializer):
    itemTitle = SerializerMethodField()
    def get_itemTitle(self, obj):
        if obj.material is not None:
            return MaterialTitleSerializer(obj.material).data
        return None
    class Meta:
        verbose_name = 'WithdrawItems List'
        model = WithdrawItems
        fields = '__all__'


class WithdrawSerializer(serializers.ModelSerializer):
    destinationTitle= SerializerMethodField()
    items = SerializerMethodField()
    def get_items(self, obj):
        withdrawList = WithdrawItems.objects.filter(withdraw=obj.pk, deleted=False)
        return WithdrawItemsSerializer(withdrawList, many=True).data
    def get_destinationTitle(self, obj):
        if obj.destination is not None:
            return obj.destination.title
        return None

    class Meta:
        verbose_name = 'Withdraw List'
        model = Withdraw
        fields = '__all__'

class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        verbose_name = 'Material List'
        model = Material
        fields = '__all__'

 
class MaterialTitleSerializer(serializers.ModelSerializer):
    title= SerializerMethodField()
    def get_title(self,obj):
        t= obj.title 
        if obj.length is not None:
            t += ' × '+  str(obj.length)
        if obj.width is not None:
            t += ' × '+  str(obj.width)
        if obj.thickness is not None:
            t += ' × '+  str(obj.thickness)
        return t

    class Meta:
        verbose_name = 'Material List'
        model = Material
        fields = ['id','title']



class InvoiceItemsSerializer(serializers.ModelSerializer):
    materialTitle = SerializerMethodField()
    def get_materialTitle(self, obj):
        if obj.material is not None:
            return obj.material.title

    class Meta:
        verbose_name = 'InvoiceItems List'
        model = InvoiceItems
        fields = '__all__'


 
 
class InvoiceSerializer(serializers.ModelSerializer):
    items = SerializerMethodField()
    
    agentTitle = SerializerMethodField()

    def get_agentTitle(self, obj):
        if obj.agent is not None:
            return obj.agent.title

    def get_items(self, obj):
        invList = InvoiceItems.objects.filter(invoice=obj.pk, deleted=False)
        return InvoiceItemsSerializer(invList, many=True).data

    class Meta:
        verbose_name = 'Invoice List'
        model = Invoice
        fields = '__all__'