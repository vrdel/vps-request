"""
WSGI config for vpsrequest project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/2.2/howto/deployment/wsgi/
"""

import os
import sys
from distutils.sysconfig import get_python_lib
from django.core.wsgi import get_wsgi_application

sys.path.insert(0, get_python_lib() + '/vpsrequest/')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vpsrequest.settings')

application = get_wsgi_application()
