from backend import models, serializers
from email.mime.text import MIMEText
from email.header import Header
from dateutil.parser import parse
import smtplib
import socket
import re
from backend.email.msgbuilder import MsgBuilder
from django.conf import settings

# TESTING_TO = 'dvrcic@srce.hr'
# TESTING_CC = 'dvrcic@srce.hr'
# TESTING_TO = 'hrvoje.sute@srce.hr'
# TESTING_CC = 'sute.hrvoje@gmail.com'
TESTING_TO = 'vps-admin@srce.hr'
TESTING_CC = 'vps-request@srce.hr'

# TESTING_TO = 'hrvoje.sute@srce.hr'
# TESTING_CC = 'sute.hrvoje@gmail.com'
# TESTING_TO = 'vps-admin@srce.hr'
# TESTING_CC = 'vps-request@srce.hr'


class Notification(object):
    def __init__(self, requestID):
        self.sender = settings.ADMIN_MAIL

        reqData = models.Request.objects.get(pk=requestID)
        serializer = serializers.RequestsListSerializer(reqData, many=False)
        self.request = serializer.data

    def sendFreshRequestAdminEmail(self):
        to = TESTING_TO  # settings.RMI_CHEF_MAIL
        cc = TESTING_CC  # self.sender
        msgBuilder = MsgBuilder(settings.ADMIN_FRESH_TEMPLATE)
        msgBuilder.processPlaceholders(self.request)
        self._send(msgBuilder.body, settings.ADMIN_FRESH_SUBJECT, to, cc)

    def sendFreshRequestUserEmail(self):
        to = TESTING_TO  # self.request['user']['email']
        msgBuilder = MsgBuilder(settings.USER_FRESH_TEMPLATE)
        msgBuilder.processPlaceholders(self.request)
        self._send(msgBuilder.body, settings.USER_FRESH_SUBJECT, to)

    def sendFreshRequestHeadEmail(self):
        to = TESTING_TO  # self.request['head_email']
        msgBuilder = MsgBuilder(settings.HEAD_FRESH_TEMPLATE)
        msgBuilder.processPlaceholders(self.request)
        self._send(msgBuilder.body, settings.HEAD_FRESH_SUBJECT, to)

    def sendApprovedRequestEmail(self, sendToUser=False, sendToHead=False):
        to = self._findTo(sendToUser, sendToHead)
        cc = self.sender
        msgBuilder = MsgBuilder(settings.APPROVED_REQ_TEMPLATE)
        msgBuilder.processPlaceholders(self.request)
        self._send(msgBuilder.body, settings.APPROVED_REQ_SUBJECT, to, cc)

    def sendRejecedRequestEmail(self, sendToUser=False, sendToHead=False):
        to = self._findTo(sendToUser, sendToHead)
        cc = self.sender
        msgBuilder = MsgBuilder(settings.REJECTED_REQ_TEMPLATE)
        msgBuilder.processPlaceholders(self.request)
        self._send(msgBuilder.body, settings.REJECTED_REQ_SUBJECT, to, cc)

    def sendFixRequestEmail(self, sendToUser=False, sendToHead=False):
        to = self._findTo(sendToUser, sendToHead)
        cc = self.sender
        msgBuilder = MsgBuilder(settings.FIX_REQ_TEMPLATE)
        msgBuilder.processPlaceholders(self.request)
        self._send(msgBuilder.body, settings.FIX_REQ_SUBJECT, to, cc)

    def sendChangedRequestEmail(self, oldRequest):
        to = TESTING_TO  # self.sender
        msgBuilder = MsgBuilder(settings.CHANGED_REQ_TEMPLATE)
        msgBuilder.findDiffs(self.request, oldRequest)
        self._send(msgBuilder.body, settings.CHANGED_REQ_SUBJECT, to)

    def _send(self, email_text, subject, to, cc=None):
        if not email_text:
            print('MAIL ERROR: Could not construct an email')
        else:
            try:
                m = MIMEText(email_text, 'plain', 'utf-8')
                m['From'] = self.sender
                if type(to) is list:
                    m['To'] = ', '.join(to)
                else:
                    m['To'] = to
                if cc:
                    m['Cc'] = cc
                m['Subject'] = Header(subject, 'utf-8')
                s = smtplib.SMTP(settings.SRCE_SMTP, 25, timeout=120)
                s.ehlo()
                s.sendmail(self.sender, to, m.as_string())
                s.quit()

                print('MAIL OK: Mail sent to={} cc={}'.format(m['To'], m['Cc']))

                return True

            except (socket.error, smtplib.SMTPException) as e:
                print('MAIL ERROR: {}'.format(repr(e)))
                return False

    def _findTo(self, toUser, toHead):
        to = []
        if toUser:
            to.append(TESTING_TO)
            # to.append(self.request['user']['email'])
        if toHead:
            to.append(TESTING_CC)
            # to.append(self.request['head_email'])

        if len(to) > 0:
            return to
        else:
            return [self.sender]
