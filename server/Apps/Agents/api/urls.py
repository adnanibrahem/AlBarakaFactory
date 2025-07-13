from django.urls import path
from . import views

app_name = 'Agents'

urlpatterns = [
    path('agent/list/<slug:group>/', views.AgentsList.as_view()),
    path('agent/attendes/', views.AgentsListAttendes.as_view()),
    path('agent/save/salary/', views.AgentsSaveSalary.as_view()),
    
    path('agent/list/', views.AgentsList.as_view()),
    path('agent/create/', views.AgentsCreate.as_view()),
    path('agent/edit/<int:pk>/', views.AgentsEdit.as_view()),
    path('agent/ballnce/<int:details>/<int:id>/<int:yearId>/',
         views.AgentBalance.as_view()),
    path('agent/ballnce/pdf/', views.AgentBalancePDF.as_view()),

#    ----------------------------------------------------
    path('material/list/', views.MaterialList.as_view()),
    path('material/title/list/', views.MaterialTitleList.as_view()),

    path('material/create/', views.MaterialCreate.as_view()),
    path('material/edit/<int:pk>/', views.MaterialEdit.as_view()),    
    path('material/ballnce/<int:details>/<int:id>/<int:yearId>/',
         views.MaterialBalance.as_view()),

#    ----------------------------------------------------
    path('invoice/list/<int:yearId>/', views.InvoiceList.as_view()),
    path('invoice/create/', views.InvoiceCreate.as_view()),
    path('invoice/edit/<int:pk>/', views.InvoiceEdit.as_view()),
    path('invoice/item/create/', views.InvoiceItemCreate.as_view()),
    path('invoice/item/edit/<int:pk>/', views.InvoiceItemsEdit.as_view()),
    
    # ----------------------------------------------------
    path('destination/list/', views.DestinationList.as_view()),
    path('destination/create/', views.DestinationCreate.as_view()),
    path('destination/edit/<int:pk>/', views.DestinationEdit.as_view()),
    # ----------------------------------------------------
    path('withdraw/list/', views.WithdrawList.as_view()),
    path('withdraw/create/', views.WithdrawCreate.as_view()),
    path('withdraw/edit/<int:pk>/', views.WithdrawEdit.as_view()),
    path('withdraw/item/create/', views.WithdrawItemCreate.as_view()),
    path('withdraw/item/edit/<int:pk>/', views.WithdrawItemsEdit.as_view()),
]
