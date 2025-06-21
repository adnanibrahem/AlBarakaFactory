import os
from django.db import models
from django.contrib.auth import get_user_model
from Apps.Users.models import CommercialYear
 

USER_MODEL = get_user_model()


def get_upload_path(instance, filename):
    return os.path.join("projects", "%s" % instance.jobDay.project.pk + " %s" % instance.jobDay.workDate.strftime("%Y-%m-%d"), filename)


class Agents(models.Model):
    title = models.CharField(max_length=100)
    group = models.CharField(max_length=15, default='worker')  # seller , other
    address = models.TextField(null=True, blank=True)
    phoneNumber = models.CharField(max_length=20, null=True, blank=True)
    deleted = models.BooleanField(default=False)

class InitAgentsBalance(models.Model):
    agent = models.ForeignKey(Agents, on_delete=models.DO_NOTHING)
    denar = models.FloatField(default=0, )
    dollar = models.FloatField(default=0, )
    yearId = models.ForeignKey(CommercialYear, on_delete=models.DO_NOTHING)

class Material(models.Model):
    title = models.CharField(max_length=50)
    length= models.FloatField(null=True,blank=True) 
    width= models.FloatField(null=True,blank=True)
    thickness= models.FloatField(null=True,blank=True)
    deleted = models.BooleanField(default=False)

class InitMaterialQuantity(models.Model):
    material= models.ForeignKey(Material, on_delete=models.DO_NOTHING)
    quantity= models.FloatField()
    currency =models.BooleanField(default=True)
    unitCostPrice= models.FloatField()
    yearId = models.ForeignKey(CommercialYear, on_delete=models.DO_NOTHING)

class Invoice(models.Model):
    agent = models.ForeignKey(Agents, on_delete=models.DO_NOTHING)
    invoiceDate =  models.DateField()
    currency =models.BooleanField(default=True)
    invoiceCode=models.CharField(max_length=10,null=True,blank=True)
    comments = models.TextField(null=True,blank=True)
    totalCost= models.FloatField(default=0)    
    dateAt = models.DateTimeField(auto_now_add=True)
    userAuth = models.ForeignKey(USER_MODEL, on_delete=models.DO_NOTHING)
    yearId = models.ForeignKey(CommercialYear, on_delete=models.DO_NOTHING)
    deleted = models.BooleanField(default=False)

class InvoiceItems(models.Model):
    invoice= models.ForeignKey(Invoice, on_delete=models.DO_NOTHING)    
    material= models.ForeignKey(Material, on_delete=models.DO_NOTHING)
    quantity= models.FloatField()
    unitCostPrice= models.FloatField()
    deleted = models.BooleanField(default=False)

class Destination(models.Model):
    title = models.CharField(max_length=50)
    deleted = models.BooleanField(default=False)

class Withdraw(models.Model):
    destination = models.ForeignKey(Destination, on_delete=models.DO_NOTHING)
    withdrawDate = models.DateField()
    comments = models.TextField(null=True, blank=True)
    dateAt = models.DateTimeField(auto_now_add=True)
    userAuth = models.ForeignKey(USER_MODEL, on_delete=models.DO_NOTHING)
    yearId = models.ForeignKey(CommercialYear, on_delete=models.DO_NOTHING)
    deleted = models.BooleanField(default=False)

class WithdrawItems(models.Model):
    withdraw = models.ForeignKey(Withdraw, on_delete=models.DO_NOTHING)
    material = models.ForeignKey(Material, on_delete=models.DO_NOTHING)
    quantity = models.FloatField()
    unitCostPrice = models.FloatField()
    currency = models.BooleanField(default=True)
    deleted = models.BooleanField(default=False)