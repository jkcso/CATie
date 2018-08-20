from django.db.transaction import atomic


def next_id(calling_class, fk, attr_name):
    with atomic():
        next_id_on_site = calling_class.objects\
            .filter(parent=fk)\
            .order_by('-' + attr_name)\
            .values_list(attr_name, flat=True)
        if next_id_on_site:
            return next_id_on_site[0] + 1
        else:
            return 1
