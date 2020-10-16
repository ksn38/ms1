from django import forms
from mybl.models import Bpost, Comment


class BpostForm(forms.ModelForm):
    class Meta:
        model = Bpost
        fields = ['header', 'main']
        labels = {'header': 'Заголовок'}
        labels = {'main': ''}


class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ['text']
        labels = {'text': ''}
        widgets = {'text': forms.Textarea(attrs={'cols': 80})}
