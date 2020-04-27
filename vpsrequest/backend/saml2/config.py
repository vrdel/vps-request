from distutils.sysconfig import get_python_lib
from configparser import ConfigParser

import saml2
from saml2.config import SPConfig

from django.conf import settings


def get_hostname(request):
    return request.get_host().split(':')[0]

def get_saml_config(request):
    hostname = get_hostname(request)

    config = {
        'xmlsec_binary': '/usr/bin/xmlsec1',
        'entityid': 'https://%s/saml2/metadata/' % hostname,
        'allow_unknown_attributes': True,
        'debug': 1,
        'service': {
            'sp': {
                'name': 'VPS Request',
                'want_assertions_signed': False,
                'want_response_signed': False,
                'endpoints': {
                    'assertion_consumer_service': [
                        ('https://%s/saml2/acs/' % hostname,
                         saml2.BINDING_HTTP_POST),
                    ],
                    'single_logout_service': [
                        ('https://%s/saml2/ls/' % hostname,
                         saml2.BINDING_HTTP_REDIRECT),
                    ],
                },
                'attribute_map_dir': '%s/saml2/attributemaps/' %
                                     get_python_lib(),
            },
        },
        'key_file': settings.HOST_KEY,  # private part
        'cert_file': settings.HOST_CERT,  # public part
        'metadata': {
            'local': [settings.SAML_METADATA]
        }
    }

    return SPConfig().load(config)
