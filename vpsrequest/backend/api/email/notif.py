from backend import models, serializers
from email.mime.text import MIMEText
from email.header import Header
from dateutil.parser import parse
import smtplib
import socket
import os, re, datetime
from django.conf import settings

class Notification(object):

    def __init__(self, requestID, logger = None):
        self.logger = logger
        self.sender = settings.ADMIN_MAIL

        reqData = models.Request.objects.get(pk=requestID)
        serializer = serializers.RequestsListSerializer(reqData, many=False)
        self.request = serializer.data


    def composeFreshRequestAdminEmail(self):
        email_text = None
        to = 'hsute@srce.hr'
        cc = 'hrvoje.sute@srce.hr'
        email_text = self.prepareMail(settings.ADMIN_FRESH_TEMPLATE, settings.ADMIN_FRESH_SUBJECT, to, cc)

        if email_text:
            self.send(email_text, to)


    def composeFreshRequestUserEmail(self):
        email_text = None
        to = 'hsute@srce.hr'
        email_text = self.prepareMail(settings.USER_FRESH_TEMPLATE, settings.USER_FRESH_SUBJECT, to)

        if email_text:
            self.send(email_text, to)

    def composeFreshRequestHeadEmail(self):
        email_text = None
        to = 'hsute@srce.hr'
        email_text = self.prepareMail(settings.HEAD_FRESH_TEMPLATE, settings.HEAD_FRESH_SUBJECT, to)

        if email_text:
            self.send(email_text, to)


    def prepareMail(self, template, subject, to, cc = None):
        body = None
        with open(template, mode='r', encoding='utf-8') as fp:
            body = fp.readlines()
        
        if body:
            body = ''.join(body)
            placeholders = re.findall(r"(__[A-Z_]+__)", body)

            for ph in placeholders:
                db_attr = ph.strip('__').lower()
                if db_attr.startswith('user'):
                    userAttr = db_attr.split('user_', 1)[1]
                    body = body.replace(ph, str(self.request['user'][userAttr]))
                elif 'date' in db_attr:
                    dt = parse(self.request[db_attr])
                    body = body.replace(ph, dt.strftime('%d.%m.%Y. %H:%M:%S'))
                else:
                    body = body.replace(ph, str(self.request[db_attr]))

            m = MIMEText(body, 'plain', 'utf-8')
            m['From'] = self.sender
            m['To'] = to
            if cc:
                m['Cc'] = cc
            m['Subject'] = Header(subject, 'utf-8')
            
            return m.as_string()    

        return None

    
    def send(self, email_text, to):
        if not email_text:
            self.logger.error('Could not construct an email')

        else:
            try:
                s = smtplib.SMTP(settings.SRCE_SMTP, 25, timeout=120)
                s.ehlo()
                s.sendmail(self.sender, ['hsute@srce.hr', self.sender], email_text)
                s.quit()

                return True

            except (socket.error, smtplib.SMTPException) as e:
                self.logger.error(repr(e))

        
