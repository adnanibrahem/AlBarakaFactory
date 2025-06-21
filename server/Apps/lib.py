from rest_framework import permissions
from rest_framework import pagination
from rest_framework.response import Response


 
from Apps.Agents.api.serializers import InvoiceItemsSerializer, InvoiceSerializer
from Apps.Agents.models import   InitAgentsBalance, InitMaterialQuantity, Invoice, InvoiceItems, Material, WithdrawItems 
from Apps.Box.api.serializers import BoxTransactionSerializer, ManufacturingOrderSerializer
from Apps.Box.models import BoxTransaction, InitBox, ManufacturingOrder
from Apps.Users.models import CommercialYear, Users
from django.contrib.auth.models import User


class HasFullPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        auth = request.user.id
        usrList = Users.objects.filter(auth=auth, permission=1)
        return usrList.count() > 0


class HasAddOnlyPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        auth = request.user.id
        usrList = Users.objects.filter(auth=auth, permission__in=[2, 1])
        return usrList.count() > 0


class StandartPagination100(pagination.PageNumberPagination):
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 1000


class StandartPagination(pagination.PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 1000


def getMigratedYear(yearId):
    cm = CommercialYear.objects.all().order_by('-pk')
    id = 0
    for idx, x in enumerate(cm):
        if x.pk == yearId:
            id = idx+1
    if id <= 0 or id >= len(cm):
        return None
    curYear = cm[id-1]
    oldYear = cm[id]
    return {'curYear': curYear, 'oldYear': oldYear}


class StandartPaginationQuantity(pagination.PageNumberPagination):
    totalQuantity = 0
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 1000

    def get_paginated_response(self, data):
        return Response({
            'totalQuantity': self.totalQuantity,
            'count': self.page.paginator.count,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data
        })


def getPrivilege(id):
    usr = Users.objects.filter(auth=id)
    if usr.count() > 0:
        return usr[0].privilege
    return None

 


def getAgentBallance(agentId, yearId, details):
    initDenar = 0
    initDollar = 0
    denar = 0
    dollar = 0
    id = 0
    qs = InitAgentsBalance.objects.filter(agent=agentId, yearId=yearId)
    if qs.count() > 0:
        initDenar = qs[0].denar
        initDollar = qs[0].dollar
        id = qs[0].pk
    denar = initDenar
    dollar = initDollar 

    fatoraList2 = ManufacturingOrder.objects.filter(agent=agentId,
                                        yearId=yearId,
                                        deleted=False)
    for x in fatoraList2:
        if x.currency:
            denar += x.price 
        else:
            dollar += x.price
 
    invs= Invoice.objects.filter(agent=agentId,
                                      yearId=yearId,
                                      deleted=False)

    for x in invs:
        if x.currency:
            denar -= x.totalCost
        else:
            dollar -= x.totalCost
            

    bx = BoxTransaction.objects.filter(toAgent=agentId,
                                       yearId=yearId,
                                       deleted=False)
    for x in bx:
        if x.toCurrency:
            denar += x.toAmount
        else:
            dollar += x.toAmount    

    bxFrom = BoxTransaction.objects.filter(fromAgent=agentId,
                                           yearId=yearId,
                                           deleted=False)
    for x in bxFrom:
        if x.fromCurrency:
            denar -= x.fromAmount
        else:
            dollar -= x.fromAmount

    detailsItems = []
    if details == 1:
        for x in invs:
            detailsItems.append({'date': x.invoiceDate,
                                 'type': 'invoice',
                                 'd': InvoiceSerializer(x).data})
            
        for x in fatoraList2:
            detailsItems.append({'date': x.dateAt,
                                 'type': 'manufacturingOrder',
                                 'd': ManufacturingOrderSerializer(x).data})
        for x in bx:
            detailsItems.append({'date': x.transactionDate,
                                 'type': 'boxTransaction',
                                 'd': BoxTransactionSerializer(x).data})
        for x in bxFrom:
            detailsItems.append({'date': x.transactionDate,
                                 'type': 'boxTransaction',
                                 'd': BoxTransactionSerializer(x).data})

    return {'initId': id,
            'initDenar': initDenar,
            'initDollar': initDollar,
            'dollar': dollar,
            'denar': denar,
            'details': detailsItems}


def getBoxBallance(yearId, details):
    denar = 0
    dollar=0
    initDenar = 0
    initDollar=0
    initId = 0
    gData = []
    initQs = InitBox.objects.filter(yearId=yearId)
    if initQs.count() > 0:
        initDenar = initQs[0].denar
        initDollar = initQs[0].dollar
        initId = initQs[0].pk
    else:
        year = CommercialYear.objects.get(pk=yearId)
        t = InitBox(yearId=year)
        t.save()
        initId = t.pk
    denar = initDenar
    dollar = initDollar
    

    fromBox = BoxTransaction.objects.filter(yearId=yearId,
                                            deleted=False, fromBox=True)

    toBox = BoxTransaction.objects.filter(yearId=yearId,
                                          deleted=False, toBox=True)
    for x in fromBox:
        if x.fromCurrency:
            denar -= x.fromAmount
        else:
            dollar -= x.fromAmount

    for x in toBox:
        if x.toCurrency:
            denar += x.toAmount
        else:
            dollar += x.toAmount

    if details == 1:
        gData = BoxTransactionSerializer(fromBox,
                                         many=True).data + BoxTransactionSerializer(toBox,
                                                                                    many=True).data
    return {
        'initId': initId,
        'initDenar': initDenar,
        'initDollar': initDollar,
        'denar': denar,
        'dollar': dollar,
        'details': gData}


def getMaterialBallance(matId, yearId, details):
    initQuantity=0
    initUnitCostPrice=0
    initCurrency=True
    lastCost=0
    lastCurrency=True
    initId = 0
    quantity=0
    qs = InitMaterialQuantity.objects.filter(material=matId, yearId=yearId)
    if qs.count() > 0:
        initQuantity = qs[0].quantity
        initUnitCostPrice = qs[0].unitCostPrice
        initCurrency= qs[0].currency
        initId = qs[0].pk
        lastCost=qs[0].unitCostPrice
        lastCurrency= qs[0].currency
    else: 
        cm = CommercialYear.objects.all().order_by('-pk')
        sp = Material.objects.filter(pk=matId)
        b = InitMaterialQuantity(quantity=0,
                                unitCostPrice=0,
                                material=sp[0],
                                yearId=cm[0])
        b.save()
        initId = b.pk
    quantity= initQuantity
    
    wth= WithdrawItems.objects.filter(material=matId,
                                      withdraw__yearId=yearId,
                                      withdraw__deleted=False,
                                      deleted=False)
    for x in wth:
        quantity -= x.quantity


    invc= InvoiceItems.objects.filter(invoice__deleted=False,
                                      invoice__yearId=yearId,
                                      material=matId,
                                      deleted=False)
    for x in invc:
        quantity+= x.quantity
        lastCost = x.unitCostPrice
        lastCurrency= x.invoice.currency

    detailsItems = []
    if details == 1:
        for x in wth:
            detailsItems.append({'date': x.withdraw.withdrawDate,
                                 'type': 'withdraw',
                                 'd': {'quantity': x.quantity,
                                       'unitCostPrice': x.unitCostPrice,
                                       'destination': x.withdraw.destination.title}})
        for x in invc:
            detailsItems.append({'date': x.invoice.invoiceDate,
                                 'type': 'invoiceItem',
                                 'agentTitle': x.invoice.agent.title,
                                 'd': InvoiceItemsSerializer(x).data})
            
 
    return {'initId': initId,
            'initQuantity': initQuantity,
            'initUnitCostPrice': initUnitCostPrice,
            'initCurrency': initCurrency,
            'lastCost': lastCost,
            'lastCurrency': lastCurrency,
            'quantity': quantity,
            'details': detailsItems}
