from setuptools import setup, find_packages
import os
import glob
import sys

NAME = 'vpsrequest'


def get_files(install_prefix, directory):
    files = []
    for root, _, filenames in os.walk(directory):
        subdir_files = []
        for filename in filenames:
            subdir_files.append(os.path.join(root, filename))
        if filenames and subdir_files:
            files.append((os.path.join(install_prefix, root), subdir_files))
    return files


setup(name=NAME,
      version='1.1.2',
      description='VPS Request - web application for requesting VM within Virtual Private Server service of SRCE',
      author='SRCE',
      author_email='dvrcic@srce.hr, hsute@srce.hr',
      license='Apache License 2.0',
      long_description=open('README.md').read(),
      long_description_content_type='text/markdown',
      url='https://github.com/vrdel/vps-request',
      classifiers=(
          "Programming Language :: Python :: 3",
          "License :: OSI Approved :: Apache Software License",
          "Operating System :: POSIX :: Linux",
      ),
      scripts=['bin/vpsreq-db', 'bin/vpsreq-genseckey', 'bin/vpsreq-manage'],
      data_files=[
          ('bin/', glob.glob('bin/*')),
          ('etc/vpsrequest', ['etc/vpsrequest.conf.template']),
          ('etc/cron.d/', ['cron/vpsreq-clearsessions']),
          ('etc/vpsrequest/email_templates', glob.glob('etc/email_templates/*.tpl')),
          ('etc/apache2/sites-available/', ['apache/vpsrequest.example.com.conf']),
          ('var/log/vpsrequest', ['helpers/empty']),
          ('var/lib/vpsrequest', ['helpers/empty']),
      ] + get_files('share/', 'vpsrequest/static/'),
      include_package_data=True,
      packages=find_packages(),
      package_data={
          'vpsrequest': ['templates/*'] + ['backend/fixtures/*'] + ['frontend/*.json'],
      },
      package_dir={'vpsrequest': 'vpsrequest/'}
)
