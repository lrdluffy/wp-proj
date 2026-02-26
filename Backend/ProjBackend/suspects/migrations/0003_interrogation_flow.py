from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class Migration(migrations.Migration):

    dependencies = [
        ('suspects', '0002_alter_suspect_id'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='suspect',
            name='sergeant_probability',
            field=models.PositiveSmallIntegerField(
                null=True,
                blank=True,
                validators=[MinValueValidator(1), MaxValueValidator(10)],
                help_text='Probability of guilt (1-10) as assessed by the sergeant',
            ),
        ),
        migrations.AddField(
            model_name='suspect',
            name='sergeant_notes',
            field=models.TextField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name='suspect',
            name='sergeant_officer',
            field=models.ForeignKey(
                related_name='sergeant_interrogations',
                null=True,
                blank=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name='suspect',
            name='sergeant_recorded_at',
            field=models.DateTimeField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name='suspect',
            name='detective_probability',
            field=models.PositiveSmallIntegerField(
                null=True,
                blank=True,
                validators=[MinValueValidator(1), MaxValueValidator(10)],
                help_text='Probability of guilt (1-10) as assessed by the detective',
            ),
        ),
        migrations.AddField(
            model_name='suspect',
            name='detective_notes',
            field=models.TextField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name='suspect',
            name='detective_officer',
            field=models.ForeignKey(
                related_name='detective_interrogations',
                null=True,
                blank=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name='suspect',
            name='detective_recorded_at',
            field=models.DateTimeField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name='suspect',
            name='captain_probability',
            field=models.PositiveSmallIntegerField(
                null=True,
                blank=True,
                validators=[MinValueValidator(1), MaxValueValidator(10)],
                help_text='Final probability of guilt (1-10) decided by the captain',
            ),
        ),
        migrations.AddField(
            model_name='suspect',
            name='captain_statement',
            field=models.TextField(
                null=True,
                blank=True,
                help_text="Captain's reasoning based on statements, evidence, and scores",
            ),
        ),
        migrations.AddField(
            model_name='suspect',
            name='captain_officer',
            field=models.ForeignKey(
                related_name='captain_decisions',
                null=True,
                blank=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name='suspect',
            name='captain_decided_at',
            field=models.DateTimeField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name='suspect',
            name='chief_approved',
            field=models.BooleanField(
                null=True,
                blank=True,
                help_text='Police chief approval of captain decision (only for critical crimes)',
            ),
        ),
        migrations.AddField(
            model_name='suspect',
            name='chief_comment',
            field=models.TextField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name='suspect',
            name='chief_officer',
            field=models.ForeignKey(
                related_name='chief_reviews',
                null=True,
                blank=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name='suspect',
            name='chief_reviewed_at',
            field=models.DateTimeField(null=True, blank=True),
        ),
    ]

