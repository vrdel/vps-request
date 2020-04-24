from backend import models, serializers
from email.mime.text import MIMEText
from email.header import Header
from dateutil.parser import parse
import smtplib
import socket
import re
from backend.email.msgbuilder import MsgBuilder
from django.conf import settings

TESTING_TO = 'hsute@srce.hr'
TESTING_CC = 'hrvoje.sute@srce.hr'


class Notification(object):
    def __init__(self, requestID, logger=None):
        self.logger = logger
        self.sender = settings.ADMIN_MAIL

        reqData = models.Request.objects.get(pk=requestID)
        serializer = serializers.RequestsListSerializer(reqData, many=False)
        self.request = serializer.data

    def composeFreshRequestAdminEmail(self):
        to = TESTING_TO
        cc = TESTING_CC
        msgBuilder = MsgBuilder(settings.ADMIN_FRESH_TEMPLATE)
        msgBuilder.processPlaceholders(self.request)
        self.send(msgBuilder.body, settings.ADMIN_FRESH_SUBJECT, to, cc)

    def composeFreshRequestUserEmail(self):
        to = TESTING_TO
        msgBuilder = MsgBuilder(settings.USER_FRESH_TEMPLATE)
        msgBuilder.processPlaceholders(self.request)
        self.send(msgBuilder.body, settings.USER_FRESH_SUBJECT, to)

    def composeFreshRequestHeadEmail(self):
        to = TESTING_TO
        msgBuilder = MsgBuilder(settings.HEAD_FRESH_TEMPLATE)
        msgBuilder.processPlaceholders(self.request)
        self.send(msgBuilder.body, settings.HEAD_FRESH_SUBJECT, to)

    def sendChangedRequestEmail(self, oldRequest):
        to = TESTING_TO
        msgBuilder = MsgBuilder(settings.CHANGED_REQ_TEMPLATE)
        msgBuilder.findDiffs(self.request, oldRequest)
        self.send(msgBuilder.body, settings.CHANGED_REQ_SUBJECT, to)

       
    def send(self, email_text, subject, to, cc = None):
        if not email_text:
            self.logger.error('Could not construct an email')
        else:
            try:
                m = MIMEText(email_text, 'plain', 'utf-8')
                m['From'] = self.sender
                m['To'] = to
                if cc:
                    m['Cc'] = cc
                m['Subject'] = Header(subject, 'utf-8')
                s = smtplib.SMTP(settings.SRCE_SMTP, 25, timeout=120)
                s.ehlo()
                s.sendmail(self.sender, [TESTING_TO, self.sender], m.as_string())
                s.quit()

                return True

            except (socket.error, smtplib.SMTPException) as e:
                self.logger.error(repr(e))
