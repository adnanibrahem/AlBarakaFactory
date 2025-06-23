from datetime import datetime
import os
from django.db import models
from django.contrib.auth import get_user_model


from Apps.Agents.models import Agents   
from Apps.Users.models import CommercialYear, Users
from Backend.lists import  PRIVILEGE

USER_MODEL = get_user_model()


def get_upload_path(instance, filename):
    return os.path.join("Box", "%s" % instance.boxTransaction.yearId.title +
                        " %s" % instance.boxTransaction.dateAt.strftime("%Y-%m-%d"), filename)

def get_document_upload_path(instance, filename):
    return os.path.join("Box", "%s" % 'ManufacturingOrder'+
                        " %s" % datetime.now().strftime("%Y-%m-%d"), filename)

class InitBox(models.Model):
    denar = models.FloatField(default=0)
    dollar = models.FloatField(default=0)
    yearId = models.ForeignKey(CommercialYear, on_delete=models.DO_NOTHING)


class Category(models.Model):
    title = models.CharField(max_length=90)
    inProfit = models.BooleanField(default=True)
    deleted = models.BooleanField(default=False)


class BoxTransaction(models.Model):
    fromAmount = models.FloatField(default=0, help_text='المبلغ')
    toAmount = models.FloatField(default=0)
    fromCurrency= models.BooleanField(default=True)
    toCurrency = models.BooleanField(default=True)
    fromOther= models.BooleanField(default=True)
    toOther= models.BooleanField(default=True)

    fromBox = models.BooleanField(default=False)
    toBox = models.BooleanField(default=False)

    fromAgent = models.ForeignKey(Agents, on_delete=models.DO_NOTHING,
                                  related_name='ffrrooAgent', null=True, blank=True)
    toAgent = models.ForeignKey(Agents, on_delete=models.DO_NOTHING,
                                related_name='ttooAgent', null=True, blank=True)

    category = models.ForeignKey(Category, on_delete=models.DO_NOTHING,
                                 null=True, blank=True)

    comments = models.TextField(null=True, blank=True)
    transactionDate = models.DateField()
    dateAt = models.DateTimeField(auto_now_add=True)
    userAuth = models.ForeignKey(USER_MODEL, on_delete=models.DO_NOTHING)
    deleted = models.BooleanField(default=False)
    yearId = models.ForeignKey(CommercialYear, on_delete=models.DO_NOTHING)


class Documents(models.Model):
    boxTransaction = models.ForeignKey(BoxTransaction,
                                       on_delete=models.DO_NOTHING)
    img = models.ImageField(upload_to=get_upload_path)
    deleted = models.BooleanField(default=False)


class ManufacturingOrder(models.Model):
    agent = models.ForeignKey(Agents, on_delete=models.DO_NOTHING)
    dateAt = models.DateTimeField(auto_now_add=True)
    currency = models.BooleanField(default=True)
    price= models.FloatField()
    otherPrice= models.FloatField(default=0)
    comments = models.TextField(null=True, blank=True)
    designFile=models.FileField(upload_to=get_document_upload_path, null=True, blank=True)
    yearId = models.ForeignKey(CommercialYear, on_delete=models.DO_NOTHING)
    done= models.BooleanField(default=False)
    otherOrder = models.BooleanField(default=False)
    userAuth = models.ForeignKey(USER_MODEL, on_delete=models.DO_NOTHING)
    deleted = models.BooleanField(default=False)

class ManufacturingPath(models.Model):
    order = models.ForeignKey(ManufacturingOrder, on_delete=models.DO_NOTHING)
    step = models.CharField(max_length=15)
    index = models.IntegerField()
    doneAt = models.DateTimeField(null=True, blank=True)
    done = models.BooleanField(default=False)   
    userDoneId =models.ForeignKey(USER_MODEL, on_delete=models.DO_NOTHING, null=True, blank=True)
 
class ManufacturingImages(models.Model):
    order = models.ForeignKey(ManufacturingOrder, on_delete=models.DO_NOTHING)
    image = models.ImageField(upload_to=get_document_upload_path)
    deleted = models.BooleanField(default=False)

  
class ManufacturingItems(models.Model):
    order = models.ForeignKey(ManufacturingOrder, on_delete=models.DO_NOTHING)
    title = models.CharField(max_length=50)
    quantity = models.FloatField(default=0)
    unitCostPrice = models.FloatField(default=0)
    width = models.FloatField(null=True, blank=True)
    length = models.FloatField(null=True, blank=True)
    thickness = models.FloatField(null=True, blank=True)
    deleted = models.BooleanField(default=False)
