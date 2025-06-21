import calendar
import pytesseract
from PIL import Image
from django.utils import tree
import openpyxl
from rest_framework.generics import ListAPIView, CreateAPIView, RetrieveUpdateAPIView, RetrieveUpdateDestroyAPIView
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from rest_framework import pagination
import pytz
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timedelta
from rest_framework.views import APIView

from django.views.generic.base import View
from wkhtmltopdf.views import PDFTemplateView, PDFTemplateResponse
from django.db.models.query_utils import Q

from Apps.Agents.api.serializers import AgentsSerializer, DestinationSerializer, InvoiceItemsSerializer, InvoiceSerializer, MaterialSerializer, MaterialTitleSerializer, WithdrawItemsSerializer, WithdrawSerializer 
from Apps.Agents.models import Agents, Destination,   InitAgentsBalance, InitMaterialQuantity, Invoice, InvoiceItems, Material, Withdraw, WithdrawItems 
from Apps.Users.models import CommercialYear
from Apps.lib import HasAddOnlyPermission, HasFullPermission, getAgentBallance, getMaterialBallance


user_profile = User

#  Agents
class AgentsList(ListAPIView):
    serializer_class = AgentsSerializer

    def get_queryset(self):
        if 'group' in self.kwargs.keys():
            group = self.kwargs['group']  # other
            qr = Agents.objects.filter(group=group,
                                       deleted=False)
            return qr
        qr = Agents.objects.filter(deleted=False)
        return qr


class AgentsCreate(CreateAPIView):
    queryset = Agents.objects.all()
    serializer_class = AgentsSerializer
    permission_classes = [HasAddOnlyPermission]

    def create(self, request, *args, **kwargs):
        if not HasAddOnlyPermission.has_object_permission(self, request, None, None):
            return Response(status=status.HTTP_403_FORBIDDEN)
        auth = self.request.user.id
        data = request.data
        request.data['userAuth'] = auth

        r = super().create(request, *args, **kwargs)
        cm = CommercialYear.objects.all().order_by('-pk')
        sp = Agents.objects.filter(pk=r.data['id'])
        b = InitAgentsBalance(denar=data['initDenar'],
                              dollar=data['initDollar'],
                              agent=sp[0], yearId=cm[0])
        b.save()
        return r


class AgentsEdit(RetrieveUpdateAPIView):
    queryset = Agents.objects.all()
    serializer_class = AgentsSerializer
    permission_classes = [HasFullPermission, ]
    lookup_fields = ('pk')

    def put(self, request, *args, **kwargs):
        data = request.data
        r = self.update(request, *args, **kwargs)
        if data['initId'] is not None:
            tInit = InitAgentsBalance.objects.filter(pk=data['initId'])
            if tInit.count() > 0:
                t = tInit[0]
                t.denar = data['initDenar']
                t.dollar = data['initDollar']
                t.save()
        return r

    def delete(self, request, *args, **kwargs):
        if not HasFullPermission.has_object_permission(self, request, None, None):
            return Response(status=status.HTTP_403_FORBIDDEN)
        sp = Agents.objects.filter(pk=kwargs.get('pk'))
        if sp.count() > 0:
            t = sp[0]
            t.deleted = True
            t.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AgentBalance(APIView):
    def get(self, request, details, id, yearId):
        r = getAgentBallance(id, yearId, details)
        return Response(r,  status=status.HTTP_201_CREATED)


#  Material
class MaterialList(ListAPIView):
    serializer_class = MaterialSerializer
    def get_queryset(self):
        qr = Material.objects.filter(deleted=False)
        return qr

class MaterialTitleList(ListAPIView):
    serializer_class = MaterialTitleSerializer
    def get_queryset(self):
        qr = Material.objects.filter(deleted=False)
        return qr


class MaterialCreate(CreateAPIView):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer
    permission_classes = [HasAddOnlyPermission]

    def create(self, request, *args, **kwargs):
        if not HasAddOnlyPermission.has_object_permission(self, request, None, None):
            return Response(status=status.HTTP_403_FORBIDDEN)
        auth = self.request.user.id
        data = request.data
        request.data['userAuth'] = auth

        r = super().create(request, *args, **kwargs)
        cm = CommercialYear.objects.all().order_by('-pk')
        sp = Material.objects.filter(pk=r.data['id'])
        b = InitMaterialQuantity(quantity=data['initQuantity'],
                                currency=data['initCurrency'],
                                unitCostPrice=data['initUnitCostPrice'],
                                material=sp[0],
                                yearId=cm[0])
        b.save()
        return r


class MaterialEdit(RetrieveUpdateAPIView):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer
    permission_classes = [HasFullPermission, ]
    lookup_fields = ('pk')

    def put(self, request, *args, **kwargs):
        data = request.data
        r = self.update(request, *args, **kwargs)
        if data['initId'] is not None:
            tInit = InitMaterialQuantity.objects.filter(pk=data['initId'])
            if tInit.count() > 0:
                t = tInit[0]
                t.quantity = data['initQuantity']
                t.currency = data['initCurrency']
                t.unitCostPrice= data['initUnitCostPrice']
                t.save()
        return r

    def delete(self, request, *args, **kwargs):
        if not HasFullPermission.has_object_permission(self, request, None, None):
            return Response(status=status.HTTP_403_FORBIDDEN)
        sp = Material.objects.filter(pk=kwargs.get('pk'))
        if sp.count() > 0:
            t = sp[0]
            t.deleted = True
            t.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class MaterialBalance(APIView):
    def get(self, request, details, id, yearId):
        r = getMaterialBallance(id, yearId, details)
        return Response(r,  status=status.HTTP_201_CREATED)
    


#  Invoice 
class InvoiceList(ListAPIView):
    serializer_class = InvoiceSerializer

    def get_queryset(self):
        yearId = self.kwargs['yearId']
        qr = Invoice.objects.filter(yearId=yearId,
                                    deleted=False).order_by('-invoiceDate')
        return qr


class InvoiceCreate(CreateAPIView):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [HasAddOnlyPermission]

    def create(self, request, *args, **kwargs):
        if not HasAddOnlyPermission.has_object_permission(self, request, None, None):
            return Response(status=status.HTTP_403_FORBIDDEN)
        auth = self.request.user.id
        request.data['userAuth'] = auth
        cm = CommercialYear.objects.all().order_by('-pk')
        request.data['yearId'] = cm[0].pk
        r=super().create(request, *args, **kwargs)
        invc= Invoice.objects.get(pk= r.data['id'])
        for x in request.data['items']:
            mt= Material.objects.get(pk=x['material'])
            imt= InvoiceItems(invoice=invc,
                              material=mt,
                              quantity=x['quantity'],
                              unitCostPrice=x['unitCostPrice'])
            imt.save()

        return  r


class InvoiceEdit(RetrieveUpdateAPIView):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [HasFullPermission, ]
    lookup_fields = ('pk')
    def put(self, request, *args, **kwargs):
        r=super().put(request, *args, **kwargs)
        invc= Invoice.objects.get(pk= r.data['id'])
        for x in request.data['items']:
            mt= Material.objects.get(pk=x['material'])
            if x['id']==-1:
                imt= InvoiceItems(invoice=invc,
                                material=mt,
                                quantity=x['quantity'],
                                unitCostPrice=x['unitCostPrice'])
                imt.save()
            else:
                imt=InvoiceItems.objects.get(pk=x['id'])
                imt.material= mt
                imt.quantity= x['quantity']
                imt.unitCostPrice = x['unitCostPrice']
                imt.save()
        
        r.data= InvoiceSerializer(invc).data
        return r
 
    def delete(self, request, *args, **kwargs):
        if not HasFullPermission.has_object_permission(self, request, None, None):
            return Response(status=status.HTTP_403_FORBIDDEN)
        sp = Invoice.objects.filter(pk=kwargs.get('pk'))
        if sp.count() > 0:
            t = sp[0]
            t.deleted = True
            t.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

class InvoiceItemCreate(CreateAPIView):
    queryset = InvoiceItems.objects.all()
    serializer_class = InvoiceItemsSerializer
    permission_classes = [HasAddOnlyPermission]

class InvoiceItemsEdit(RetrieveUpdateAPIView):
    def updateTotalCost(self, invoice):
        total = 0
        for x in InvoiceItems.objects.filter(invoice=invoice, deleted=False):
            total += x.quantity * x.unitCostPrice
        invoice.totalCost = total
        invoice.save()
        
    queryset = InvoiceItems.objects.all()
    serializer_class = InvoiceItemsSerializer
    permission_classes = [HasFullPermission, ]
    lookup_fields = ('pk')
    def put(self, request, *args, **kwargs):
        r = self.update(request, *args, **kwargs)
        if r.status_code == status.HTTP_200_OK:
            t = InvoiceItems.objects.get(pk=r.data['id'])
            self.updateTotalCost(t.invoice)
        return r
 
    def delete(self, request, *args, **kwargs):
        if not HasFullPermission.has_object_permission(self, request, None, None):
            return Response(status=status.HTTP_403_FORBIDDEN)
        sp = InvoiceItems.objects.filter(pk=kwargs.get('pk'))
        if sp.count() > 0:
            t = sp[0]
            t.deleted = True
            t.save()
            self.updateTotalCost(t.invoice)
        return Response(status=status.HTTP_204_NO_CONTENT)
    
#  Destination
class DestinationList(ListAPIView):
    serializer_class = DestinationSerializer
    def get_queryset(self):
        qr = Destination.objects.filter(deleted=False)
        return qr
class DestinationCreate(CreateAPIView):
    queryset = Destination.objects.all()
    serializer_class = DestinationSerializer
    permission_classes = [HasAddOnlyPermission]

class DestinationEdit(RetrieveUpdateAPIView):
    queryset = Destination.objects.all()
    serializer_class = DestinationSerializer
    permission_classes = [HasFullPermission, ]
    lookup_fields = ('pk')

    def delete(self, request, *args, **kwargs):
        if not HasFullPermission.has_object_permission(self, request, None, None):
            return Response(status=status.HTTP_403_FORBIDDEN)
        sp = Destination.objects.filter(pk=kwargs.get('pk'))
        if sp.count() > 0:
            t = sp[0]
            t.deleted = True
            t.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
#  Withdraw
class WithdrawList(ListAPIView):
    serializer_class = WithdrawSerializer

    def get_queryset(self):
         
        qr = Withdraw.objects.filter(deleted=False).order_by('-withdrawDate')
        return qr   
class WithdrawCreate(CreateAPIView):
    queryset = Withdraw.objects.all()
    serializer_class = WithdrawSerializer
    permission_classes = [HasAddOnlyPermission]

    def create(self, request, *args, **kwargs):
        if not HasAddOnlyPermission.has_object_permission(self, request, None, None):
            return Response(status=status.HTTP_403_FORBIDDEN)
        auth = self.request.user.id
        request.data['userAuth'] = auth
        cm = CommercialYear.objects.all().order_by('-pk')
        request.data['yearId'] = cm[0].pk
        r=super().create(request, *args, **kwargs)
        invc= Withdraw.objects.get(pk= r.data['id'])
        for x in request.data['items']:
            mt= Material.objects.get(pk=x['material'])
            mtint= InitMaterialQuantity.objects.filter(material=x['material'],
                                                        yearId=cm[0].pk)
            imt= WithdrawItems(withdraw=invc,
                                material=mt,
                                currency=mtint[0].currency,
                                unitCostPrice=mtint[0].unitCostPrice,
                                quantity=x['quantity'])
            imt.save()

        return  r
class WithdrawEdit(RetrieveUpdateAPIView):
    queryset = Withdraw.objects.all()
    serializer_class = WithdrawSerializer
    permission_classes = [HasFullPermission, ]
    lookup_fields = ('pk')
    def put(self, request, *args, **kwargs):
        r=super().put(request, *args, **kwargs)
        invc= Withdraw.objects.get(pk= r.data['id'])

        for x in request.data['items']:
            mt= Material.objects.get(pk=x['material'])
            mtint= InitMaterialQuantity.objects.filter(material=x['material'],
                                                        yearId=invc.yearId.pk)            
            if x['id']==-1:
                imt= WithdrawItems(withdraw=invc,
                                material=mt,
                                currency=mtint[0].currency,
                                unitCostPrice=mtint[0].unitCostPrice,
                                quantity=x['quantity'])
                imt.save()
            else:
                imt=WithdrawItems.objects.get(pk=x['id'])
                imt.material= mt
                imt.currency=mtint[0].currency
                imt.unitCostPrice= mtint[0].unitCostPrice
                imt.save()
        
        r.data= WithdrawSerializer(invc).data
        return r
 
    def delete(self, request, *args, **kwargs):
        if not HasFullPermission.has_object_permission(self, request, None, None):
            return Response(status=status.HTTP_403_FORBIDDEN)
        sp = Withdraw.objects.filter(pk=kwargs.get('pk'))
        if sp.count() > 0:
            t = sp[0]
            t.deleted = True
            t.save()
        return Response(status=status.HTTP_204_NO_CONTENT)  
    
class WithdrawItemCreate(CreateAPIView):
    queryset = WithdrawItems.objects.all()
    serializer_class = WithdrawItemsSerializer
    permission_classes = [HasAddOnlyPermission]
    
class WithdrawItemsEdit(RetrieveUpdateAPIView):
        
    queryset = WithdrawItems.objects.all()
    serializer_class = WithdrawItemsSerializer
    permission_classes = [HasFullPermission, ]
    lookup_fields = ('pk')
 
    def delete(self, request, *args, **kwargs):
        if not HasFullPermission.has_object_permission(self, request, None, None):
            return Response(status=status.HTTP_403_FORBIDDEN)
        sp = WithdrawItems.objects.filter(pk=kwargs.get('pk'))
        if sp.count() > 0:
            t = sp[0]
            t.deleted = True
            t.save()
        return Response(status=status.HTTP_204_NO_CONTENT)