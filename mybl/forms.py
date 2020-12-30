from django import forms
from mybl.models import Bpost, Comment


class BpostForm(forms.ModelForm):
    class Meta:
        model = Bpost
        fields = ['header', 'main']
        labels = {'header': 'Заголовок', 'main': ''}
        widgets = {'header': forms.TextInput(attrs={'size': 50}),
         'main': forms.Textarea(attrs={'cols': 80, 'rows': 10})}


class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ['text']
        labels = {'text': ''}
        widgets = {'text': forms.Textarea(attrs={'rows': 5})}
        
