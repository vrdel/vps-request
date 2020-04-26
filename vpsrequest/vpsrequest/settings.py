"""
Django settings for vpsrequest project.

Generated by 'django-admin startproject' using Django 2.2.9.

For more information on this file, see
https://docs.djangoproject.com/en/2.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.2/ref/settings/
"""

import os
from configparser import ConfigParser, NoSectionError
from django.core.exceptions import ImproperlyConfigured


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

    ALLOWED_HOSTS = config.get('SECURITY', 'AllowedHosts')
    HOST_CERT = config.get('SECURITY', 'HostCert')
    HOST_KEY = config.get('SECURITY', 'HostKey')
    SECRET_KEY_FILE = config.get('SECURITY', 'SecretKeyFile')

    SAML_METADATA = config.get('SAML2', 'Metadata')

    DBNAME = config.get('DATABASE', 'Name')
    DBUSER = config.get('DATABASE', 'User')
    DBPASSWORD = config.get('DATABASE', 'Password')

    SUPERUSER_NAME = config.get('SUPERUSER', 'Name')
    SUPERUSER_PASS = config.get('SUPERUSER', 'Password')
    SUPERUSER_EMAIL = config.get('SUPERUSER', 'Email')

    PERMISSIONS_STAFF = config.get('PERMISSIONS', 'Staff')
    PERMISSIONS_APPROVE = config.get('PERMISSIONS', 'Approve')

    SRCE_SMTP = config.get('EMAIL', 'SrceSmtp')
    ADMIN_MAIL = config.get('EMAIL', 'AdminMail')
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
                           'authbackend.saml2.backends.SAML2Backend']

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.memcached.MemcachedCache',
        'LOCATION': '127.0.0.1:11211'
    }
}

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
LOGIN_REDIRECT_URL = '{}/ui/prijava'.format(RELATIVE_PATH)
LOGOUT_REDIRECT_URL = '{}/ui/prijava'.format(RELATIVE_PATH)
SAML_CONFIG_LOADER = 'backend.saml2.config.get_saml_config'
SESSION_EXPIRE_AT_BROWSER_CLOSE = True
SESSION_COOKIE_SAMESITE = None
