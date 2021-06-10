from django.db import models
from django.contrib.auth.models import User

class Bpost(models.Model):
    header = models.CharField(max_length=200)
    main = models.TextField()
    date_added = models.DateTimeField(auto_now_add=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.header
        return self.main
		
		
class Comment(models.Model):
    bpost = models.ForeignKey(Bpost, on_delete=models.CASCADE)
    text = models.TextField()
    date_added = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'comments'
	
    def __str__(self):
        return self.text[:50] + '...'

        
class Lang(models.Model):
    name = models.CharField(max_length=50)
    val = models.IntegerField()
    val_noexp = models.IntegerField()
    res_vac = models.FloatField()
    date_added = models.DateField(auto_now_add=True)
    
    def __str__(self):
        return self.name
    
    def __int__(self):
        return self.val
        return self.val_noexp
    
    def __float__(self):
        return self.res_vac

    def __str__(self):
        return self.date_added

        
class Lang_avg(models.Model):
    avg_vn = models.FloatField()
    avg_rv = models.FloatField()
    date_added = models.DateField(auto_now_add=True)
    
    def __float__(self):
        return self.avg_vn
        return self.avg_rv
        return self.date_added
    
    def __str__(self):
        return self.date_added
        

class Lang_graphs(models.Model):
    Java = models.FloatField()
    Javascript = models.FloatField()
    php = models.FloatField()
    Python = models.FloatField()
    cpp = models.FloatField()
    date_added = models.DateField(auto_now_add=True)
    
    def __float__(self):
        return self.Java
        return self.Javascript
        return self.php
        return self.Python
        return self.cpp
        
    def __str__(self):
        return self.date_added

      
class Ticker(models.Model):
    date_added = models.DateField(auto_now_add=True)
    gspc = models.FloatField()
    vix = models.FloatField()
    tnx = models.FloatField()
    ixic = models.FloatField()
    rut = models.FloatField()
    wti = models.FloatField()
    gold = models.FloatField()
    
    def __float__(self):
        return self.gspc
        return self.vix
        return self.tnx
        return self.ixic
        return self.rut
        return self.wti
        return self.gold
    
    def __str__(self):
        return self.date_added
	

