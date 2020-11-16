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
    date_added = models.DateField(auto_now_add=True)
    
    def __str__(self):
      return self.name
      return self.val
      return self.val_noexp
      return self.date_added
	

