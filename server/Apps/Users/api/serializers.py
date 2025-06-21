from rest_framework import serializers
from django.contrib.auth.models import User

from ..models import CommercialYear,  Users
from Backend.lists import  PRIVILEGE
from rest_framework.serializers import SerializerMethodField
import string
import random


class pUserSerializer(serializers.ModelSerializer):
    class Meta:
        verbose_name = 'User List'
        model = User
        fields = ['id',
                  'username',
                  'is_staff',
                  'first_name',
                  'last_name',
                  'is_active']


class CommercialYearSerializer(serializers.ModelSerializer):

    class Meta:
        verbose_name = 'CommercialYear List'
        model = CommercialYear
        fields = '__all__'


# class UsersSerializer(serializers.ModelSerializer):
#     username = SerializerMethodField()
#     firstName = SerializerMethodField()
#     token = SerializerMethodField()

#     def get_token(self, obj):
#         return ''

#     def get_username(self, obj):
#         if obj.auth is not None:
#             return obj.auth.username
#         return None

#     def get_firstName(self, obj):
#         return obj.auth.first_name

#     class Meta:
#         verbose_name = 'Users List'
#         model = Users
#         fields = '__all__'


class UsersInfoSerializer(serializers.ModelSerializer):
    def getRstCode(self, dd, x):
        chars = string.ascii_lowercase + dd+string.ascii_uppercase
        code = ''.join(random.choice(chars) for _ in range(255))
        r = random.randint(3, 240)
        return code[r:]+x+code[:r]

    username = SerializerMethodField()
    firstName = SerializerMethodField()
    token = SerializerMethodField()

    optionTime = SerializerMethodField()

    enable = SerializerMethodField()

    #   3 = admin
    #   4 = drawing
    #   2 = accountant
    #   1 = cutting
    #   0 = bending
    #   5 = cnc
    #   6 = plasma


    def get_optionTime(self, obj):
        if obj.auth:
            if obj.auth.is_staff or obj.privilege == 'admin':
                cipher = self.getRstCode('012456789', '3')
                return cipher

            if obj.privilege == 'drawing':
                cipher = self.getRstCode('01256789', '4')
                return cipher

            if obj.privilege == 'accountant':
                cipher = self.getRstCode('0156789', '2')
                return cipher
            
            if obj.privilege == 'cutting':
                cipher = self.getRstCode('056789', '1')
                return cipher            
            
            if obj.privilege == 'bending':
                cipher = self.getRstCode('56789', '0')
                return cipher
            
            if obj.privilege == 'cnc':
                cipher = self.getRstCode('6789', '5')
                return cipher
            
            if obj.privilege == 'plasma':
                cipher = self.getRstCode('789', '6')
                return cipher
            
        return ''

    def get_token(self, obj):
        return ''

    def get_enable(self, obj):
        if obj.auth is not None:
            return obj.auth.is_active

    def get_username(self, obj):
        if obj.auth is not None:
            return obj.auth.username

    def get_firstName(self, obj):
        if obj.auth is not None:
            return obj.auth.first_name

    class Meta:
        verbose_name = 'Users info'
        model = Users
        fields = '__all__'
