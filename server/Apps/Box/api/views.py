
import json
from rest_framework.generics import ListAPIView, CreateAPIView, RetrieveUpdateAPIView, RetrieveUpdateDestroyAPIView
from django.contrib.auth.models import User

from rest_framework import pagination


from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timedelta
from rest_framework.views import APIView


from django.views.generic.base import View
from wkhtmltopdf.views import PDFTemplateView, PDFTemplateResponse
from django.db.models.query_utils import Q

from Apps.Box.api.serializers import BoxTransactionSerializer, CategorySerializer, ManufacturingImagesSerializer, ManufacturingOrderSerializer, ManufacturingOrderSerializerBlank, ManufacturingPathSerializer
from Apps.Box.models import BoxTransaction, Category, InitBox, ManufacturingImages, ManufacturingItems, ManufacturingOrder, ManufacturingPath
from Apps.Users.models import CommercialYear, Users
from Apps.lib import getBoxBallance, getPrivilege


user_profile = User


#  Category


class CategoryList(ListAPIView):
    serializer_class = CategorySerializer

    def get_queryset(self):

        qr = Category.objects.filter(deleted=False)
        return qr


class CategoryCreate(CreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class CategoryEdit(RetrieveUpdateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_fields = ('pk')

    def delete(self, request, *args, **kwargs):
        sp = Category.objects.filter(pk=kwargs.get('pk'))
        if sp.count() > 0:
            t = sp[0]
            t.deleted = True
            t.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


# #  BoxTransaction
class BoxTransactionList(ListAPIView):
    serializer_class = BoxTransactionSerializer
    data = []

    def get_queryset(self):
        if len(self. data) == 0:
            toDate = datetime.now().strftime("%Y-%m-%d")
            qr = BoxTransaction.objects.filter(transactionDate=toDate,
                                               deleted=False).order_by('-pk')
        if 'dtFrom' in self.data.keys() and 'dtTo' in self.data.keys():
            dtFrom = self.data['dtFrom']
            dtTo = self.data['dtTo']
            qr = BoxTransaction.objects.filter(transactionDate__gte=dtFrom,
                                               transactionDate__lte=dtTo,
                                               deleted=False).order_by('-pk')
        return qr

    def post(self, request, *args, **kwargs):
        self.data = request.data
        return self.list(request, *args, **kwargs)


class BoxTransactionCreate(CreateAPIView):
    queryset = BoxTransaction.objects.all()
    serializer_class = BoxTransactionSerializer

    def post(self, request, *args, **kwargs):
        cm = CommercialYear.objects.all().order_by('-pk')
        request.data['userAuth'] = self.request.user.id
        request.data['yearId'] = cm[0].pk
        return super().post(request, *args, **kwargs)


# class CalculateProfits(APIView):
#     def post(self, request):

#         auth = self.request.user.pk
#         pri = getPrivilege(auth)
#         if pri != 'admin':
#             return Response(False,  status=status.HTTP_401_UNAUTHORIZED)
#         r = getProfit(self.request.data)
#         return Response(r,  status=status.HTTP_201_CREATED)


class BoxTransactionEdit(RetrieveUpdateAPIView):
    queryset = BoxTransaction.objects.all()
    serializer_class = BoxTransactionSerializer
    lookup_fields = ('pk')

    def delete(self, request, *args, **kwargs):
        sp = BoxTransaction.objects.filter(pk=kwargs.get('pk'))
        if sp.count() > 0:
            t = sp[0]
            t.deleted = True
            t.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class BoxInitBalance(APIView):
    def post(self, request):
        bnls = InitBox.objects.filter(pk=request.data['initId'])
        if bnls.count() > 0:
            t = bnls[0]
            t.denar = request.data['initDenar']
            t.save()

        return Response(True,  status=status.HTTP_201_CREATED)


class BoxBalance(APIView):
    def get(self, request, details, yearId):
        r = getBoxBallance(yearId, details)
        return Response(r,  status=status.HTTP_201_CREATED)

# ManufacturingOrder
class ManufacturingOrderList(ListAPIView):
    serializer_class = ManufacturingOrderSerializer
    data = []
    def get_queryset(self):
        prv= getPrivilege(self.request.user.pk)
        dtFrom = datetime.now().strftime("%Y-%m-%d")+ ' 00:00:00'
        dtTo = datetime.now().strftime("%Y-%m-%d")+ ' 23:59:59'        
        if prv == 'admin' or prv == 'accountant':

            if self.data != [] and 'dtFrom' in self.data.keys() and 'dtTo' in self.data.keys():
                dtFrom = self.data['dtFrom']+ ' 00:00:00'
                dtTo = self.data['dtTo']+ ' 23:59:59'
            
            qr = ManufacturingOrder.objects.filter(deleted=False,
                                                   dateAt__gte=dtFrom,
                                                   dateAt__lte=dtTo).order_by('-pk')
        elif prv == 'drawing':
            qr = ManufacturingOrder.objects.filter(deleted=False,
                                                    done=False,
                                                    destination__isnull=True,
                                                    ).order_by('-pk')
            items= []
            for item in qr:
                mf=ManufacturingPath.objects.filter(order=item.pk)
                if mf.count() == 0:
                    items.append(item)
            qr = items
        else:
            qr =  []
            path= ManufacturingPath.objects.filter(order__done=False, 
                                                   order__deleted=False,
                                                   done=False,
                                                   step=prv,
                                                   ).order_by('-order__pk')
            for p in path:
                qr.append(p.order)

        return qr
    def post(self, request, *args, **kwargs):
        self.data = request.data
        return self.list(request, *args, **kwargs)
    
class ManufacturingOrderCreate(CreateAPIView):
    queryset = ManufacturingOrder.objects.all()
    serializer_class = ManufacturingOrderSerializer

    def post(self, request, *args, **kwargs):
        cm = CommercialYear.objects.all().order_by('-pk')
        # if '_mutable' in request.data.keys() :
        request.data._mutable=True 
            
        request.data['userAuth'] = self.request.user.id
        request.data['yearId'] = cm[0].pk
 
        request.data._mutable=False
        r= super().post(request, *args, **kwargs)
        if   'paths' in request.data.keys() and request.data['paths'] is not None and request.data['paths'] != '':
            for path in json.loads(request.data['paths'])  :
                p= ManufacturingPath()
                p.order = ManufacturingOrder.objects.get(pk=r.data['id'])
                p.step = path['step']
                p.index = path['index']
                p.save()
        if 'items' in request.data.keys() and request.data['items'] is not None and request.data['items'] != '':
            for item in json.loads(request.data['items']) :
                img = ManufacturingItems()
                img.title = item['title']
                img.quantity = item['quantity']
                img.unitCostPrice = item['unitCostPrice']
                img.width = item['width']
                img.length = item['length']
                img.thickness = item['thickness']
                img.order = ManufacturingOrder.objects.get(pk=r.data['id'])
                img.save()
        return r
    
class ManufacturingOrderEdit(RetrieveUpdateAPIView):
    queryset = ManufacturingOrder.objects.all()
    serializer_class = ManufacturingOrderSerializer
    lookup_fields = ('pk')
    def put(self, request, *args, **kwargs):
        if 'paths' in request.data.keys() and request.data['paths'] is not None:
            paths = ManufacturingPath.objects.filter(order__pk=kwargs.get('pk'))
            for p in paths:
                p.delete()
              
            for path in  json.loads(request.data['paths'] ):
                if  path['id'] !=-1:
                    p = ManufacturingPath.objects.get(pk=path['id'])
                else:
                     p= ManufacturingPath()
                p.order = ManufacturingOrder.objects.get(pk=kwargs.get('pk'))
                p.step = path['step']
                p.index = path['index']
                p.save()
         
        if 'items' in request.data.keys() and request.data['items'] is not None :
            for item in json.loads(request.data['items']) :
                if item['id'] != -1:
                    img = ManufacturingItems.objects.get(pk=item['id'])
                    img.deleted = item['deleted']
                else:
                    img = ManufacturingItems()
                img.title = item['title']
                img.quantity = item['quantity']
                img.unitCostPrice = item['unitCostPrice']
                img.width = item['width']
                img.length = item['length']
                img.thickness = item['thickness']
                img.order = ManufacturingOrder.objects.get(pk=kwargs.get('pk'))
                img.save()
 
        r=super().put(request, *args, **kwargs)
        return r

    def delete(self, request, *args, **kwargs):
        sp = ManufacturingOrder.objects.filter(pk=kwargs.get('pk'))
        if sp.count() > 0:
            t = sp[0]
            t.deleted = True
            t.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

 
#   ManufacturingPath
class ManufacturingPathList(ListAPIView):
    serializer_class = ManufacturingPathSerializer
    def get_queryset(self):
        prv= getPrivilege(self.request.user.pk)
        qr = ManufacturingPath.objects.filter(step=prv,
                                              order__done=False,
                                              order__deleted=False,
                                              done=False).order_by('-pk')
        items = []
        for item in qr:
            if item.index==1 :
                items.append(item)
            else:
                t= ManufacturingPath.objects.filter(order=item.order.pk,
                                                    index=item.index-1)
                if t.count() > 0:
                    if t[0].done:
                        items.append(item)

        return items

class ManufacturingPathCreate(CreateAPIView):
    queryset = ManufacturingPath.objects.all()
    serializer_class = ManufacturingPathSerializer


class ManufacturingPathEdit(RetrieveUpdateAPIView):
    queryset = ManufacturingPath.objects.all()
    serializer_class = ManufacturingPathSerializer
    lookup_fields = ('pk')

    def delete(self, request, *args, **kwargs):
        sp = ManufacturingPath.objects.filter(pk=kwargs.get('pk'))
        if sp.count() > 0:
            t = sp[0]
            t.deleted = True
            t.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ManufacturingPathFinish(APIView):
    def get(self, request,pk):
        sp = ManufacturingPath.objects.filter(pk=pk)
        if sp.count() > 0:
            t = sp[0]
            t.done = True
            t.doneAt = datetime.now()
            t.userDoneId = User.objects.get(pk=self.request.user.id)
            t.save()
            lst= ManufacturingPath.objects.filter(order=t.order.pk,
                                                  done=False,)
            if lst.count() == 0:
                ord = ManufacturingOrder.objects.get(pk=t.order.pk)
                ord.done = True
                ord.save()
                
        return Response(status=status.HTTP_204_NO_CONTENT)


# ManufacturingImages
class ManufacturingImagesCreate(CreateAPIView):
    queryset = ManufacturingImages.objects.all()
    serializer_class = ManufacturingImagesSerializer
    
class ManufacturingImagesEdit(RetrieveUpdateAPIView):
    queryset = ManufacturingImages.objects.all()
    serializer_class = ManufacturingImagesSerializer
    lookup_fields = ('pk')

    def delete(self, request, *args, **kwargs):
        sp = ManufacturingImages.objects.filter(pk=kwargs.get('pk'))
        if sp.count() > 0:
            t = sp[0]
            t.deleted = True
            t.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
   