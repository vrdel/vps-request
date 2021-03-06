"""
Django settings for vpsrequest project.

Generated by 'django-admin startproject' using Django 2.2.9.

For more information on this file, see
https://docs.djangoproject.com/en/2.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.2/ref/settings/
"""

import os
import datetime
from configparser import ConfigParser, NoSectionError
from django.core.exceptions import ImproperlyConfigured

import logging

# logger = logging.getLogger('djangosaml2')

# logger.setLevel(logging.DEBUG)
# logger.addHandler(logging.handlers.SysLogHandler('/dev/log', logging.handlers.SysLogHandler.LOG_USER))
# logger.addHandler(logging.StreamHandler())

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# Config parse
# -vrdel
VENV = '/data/vps-request/'
APP_PATH = os.path.abspath(os.path.split(__file__)[0])
CONFIG_FILE = '{}/etc/vpsrequest/vpsrequest.conf'.format(VENV)

try:
    config = ConfigParser()

    if not config.read([CONFIG_FILE], encoding='utf-8'):
        raise ImproperlyConfigured('Unable to parse config file %s' % CONFIG_FILE)

    # General
    DEBUG = bool(config.getboolean('GENERAL', 'Debug'))
    RELATIVE_PATH = config.get('GENERAL', 'RelativePath')
    VMISACTIVE_RESPONSEDATE = config.get('GENERAL', 'VmIsActiveResponseDate')
    VMISACTIVE_RESPONSEASK = config.getboolean('GENERAL', 'VmIsActiveResponseAsk')
    TODAY = datetime.datetime.today().replace(hour=0, minute=0, second=0, microsecond=0)
    DATETO = datetime.datetime.strptime('{}.{}'.format(VMISACTIVE_RESPONSEDATE, TODAY.year), '%d.%m.%Y')
    VMISACTIVE_RESPONSEDATE = datetime.datetime.strftime(DATETO, '%d.%m.%Y')
    if (TODAY <= DATETO and VMISACTIVE_RESPONSEASK):
        VMISACTIVE_SHOULDASK_DATE = True
    else:
        VMISACTIVE_SHOULDASK_DATE = False

    ALLOWED_HOSTS = config.get('SECURITY', 'AllowedHosts')
    HOST_CERT = config.get('SECURITY', 'HostCert')
    HOST_KEY = config.get('SECURITY', 'HostKey')
    SECRET_KEY_FILE = config.get('SECURITY', 'SecretKeyFile')

    SAML_METADATA = config.get('SAML2', 'Metadata')

    DBNAME = config.get('DATABASE', 'Name')
    DBUSER = config.get('DATABASE', 'User')
    DBPASSWORD = config.get('DATABASE', 'Password')
    DBHOST = config.get('DATABASE', 'Host')

    SUPERUSER_NAME = config.get('SUPERUSER', 'Name')
    SUPERUSER_PASS = config.get('SUPERUSER', 'Password')
    SUPERUSER_EMAIL = config.get('SUPERUSER', 'Email')

    PERMISSIONS_STAFF = config.get('PERMISSIONS', 'Staff')
    PERMISSIONS_APPROVE = config.get('PERMISSIONS', 'Approve')

    MAIL_SEND = config.getboolean('EMAIL', 'Send')
    SRCE_SMTP = config.get('EMAIL', 'SrceSmtp')
    ADMIN_MAIL = config.get('EMAIL', 'AdminMail')
    RMI_CHEF_MAIL = config.get('EMAIL', 'RMIChefMail')
    ADMIN_FRESH_TEMPLATE = config.get('EMAIL', 'AdminFreshTemplate')
    ADMIN_FRESH_SUBJECT = config.get('EMAIL', 'AdminFreshSubject')
    USER_FRESH_TEMPLATE = config.get('EMAIL', 'UserFreshTemplate')
    USER_FRESH_SUBJECT = config.get('EMAIL', 'UserFreshSubject')
    HEAD_FRESH_TEMPLATE = config.get('EMAIL', 'HeadFreshTemplate')
    HEAD_FRESH_SUBJECT = config.get('EMAIL', 'HeadFreshSubject')
    APPROVED_REQ_TEMPLATE = config.get('EMAIL', 'ApprovedRequestTemplate')
    APPROVED_REQ_SUBJECT = config.get('EMAIL', 'ApprovedRequestSubject')
    REJECTED_REQ_TEMPLATE = config.get('EMAIL', 'RejectedRequestTemplate')
    REJECTED_REQ_SUBJECT = config.get('EMAIL', 'RejectedRequestSubject')
    CHANGED_REQ_TEMPLATE = config.get('EMAIL', 'ChangedRequestTemplate')
    CHANGED_REQ_SUBJECT = config.get('EMAIL', 'ChangedRequestSubject')
    FIX_REQ_TEMPLATE = config.get('EMAIL', 'FixRequestTemplate')
    FIX_REQ_SUBJECT = config.get('EMAIL', 'FixRequestSubject')

except NoSectionError as e:
    print(e)
    raise SystemExit(1)

except ImproperlyConfigured as e:
    print(e)
    raise SystemExit(1)

if ',' in ALLOWED_HOSTS:
    ALLOWED_HOSTS = [h.strip() for h in ALLOWED_HOSTS.split(',')]
else:
    ALLOWED_HOSTS = [ALLOWED_HOSTS]

if ',' in PERMISSIONS_STAFF:
    PERMISSIONS_STAFF = [u.strip() for u in PERMISSIONS_STAFF.split(',')]
else:
    PERMISSIONS_STAFF = [PERMISSIONS_STAFF]

if ',' in PERMISSIONS_APPROVE:
    PERMISSIONS_APPROVE = [u.strip() for u in PERMISSIONS_APPROVE.split(',')]
else:
    PERMISSIONS_APPROVE = [PERMISSIONS_APPROVE]


AUTHENTICATION_BACKENDS = ['django.contrib.auth.backends.ModelBackend',
                           'backend.auth.saml2.backends.SAML2Backend']


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/2.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
try:
    SECRET_KEY = open(SECRET_KEY_FILE, 'r').read()
except Exception as e:
    print(SECRET_KEY_FILE + ': %s' % repr(e))
    raise SystemExit(1)

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

AUTH_USER_MODEL = 'backend.User'

# Application definition
INSTALLED_APPS = [
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'djangosaml2',
    'rest_framework',
    'rest_framework.authtoken',
    'rest_auth',
    'webpack_loader',
    'frontend',
    'backend',
]


MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'djangosaml2.middleware.SamlSessionMiddleware'
]


ROOT_URLCONF = 'vpsrequest.urls'


TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': ['{}/templates/'.format(BASE_DIR)],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]


# Django REST Framework settings

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ]
}


WSGI_APPLICATION = 'vpsrequest.wsgi.application'


# Database
# https://docs.djangoproject.com/en/2.2/ref/settings/#databases

DATABASES = {
    'default': {
        'HOST': DBHOST,
        'NAME': DBNAME,
        'ENGINE': 'django.db.backends.mysql',
        'USER': DBUSER,
        'PASSWORD': DBPASSWORD
    }
}


# Password validation
# https://docs.djangoproject.com/en/2.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/2.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Europe/Zagreb'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.2/howto/static-files/

STATIC_URL = '{}/static/'.format(RELATIVE_PATH)
STATIC_ROOT = '{}/share/vpsrequest/static/'.format(VENV)
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'frontend/bundles/')]

WEBPACK_LOADER = {
    'DEFAULT': {
        'BUNDLE_DIR_NAME': 'reactbundle/',
        'STATS_FILE': os.path.join(BASE_DIR, 'frontend/webpack-stats.json')
    }
}

# load SAML settings
LOGIN_REDIRECT_URL = '{}/ui/proxy'.format(RELATIVE_PATH)
LOGOUT_REDIRECT_URL = '{}/ui/proxy'.format(RELATIVE_PATH)
SAML_CONFIG_LOADER = 'backend.auth.saml2.config.get_saml_config'
SESSION_EXPIRE_AT_BROWSER_CLOSE = True
SESSION_COOKIE_SAMESITE = None

STATUSESVMACTIVE = {
    1: 'Da',
    0: 'Ne',
    'Da': 1,
    'Ne': 0,
    '': -1,
    -1: -1
}

STATUSES = {
    -1: 'Novi',
    0: 'Odbijen',
    1: 'Odobren',
    2: 'Izdan VM',
    3: 'Umirovljen',
    'Novi': -1,
    'Odbijen': 0,
    'Odobren': 1,
    'Izdan VM': 2,
    'Umirovljen': 3,
}
