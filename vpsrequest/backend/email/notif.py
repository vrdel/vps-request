from backend import models, serializers
from email.mime.text import MIMEText
from email.header import Header
from email.utils import formatdate
import email.utils
import smtplib
import socket
from backend.email.msgbuilder import MsgBuilder
from django.conf import settings

# TESTING_TO = 'to@foo'
# TESTING_CC = 'cc@foo'


class Notification(object):
    def __init__(self, requestID):
        self.sender = settings.ADMIN_MAIL

        reqData = models.Request.objects.get(pk=requestID)
        serializer = serializers.RequestsListSerializer(reqData, many=False)
        self.request = serializer.data

    def sendFreshRequestAdminEmail(self):
        to = settings.RMI_CHEF_MAIL
        cc = self.sender
        msgBuilder = MsgBuilder(settings.ADMIN_FRESH_TEMPLATE)
        msgBuilder.processPlaceholders(self.request)
        self._send(msgBuilder.body, settings.ADMIN_FRESH_SUBJECT, to, cc)

    def sendFreshRequestUserEmail(self):
        to = self.request['user']['email']
        msgBuilder = MsgBuilder(settings.USER_FRESH_TEMPLATE)
        msgBuilder.processPlaceholders(self.request)
        self._send(msgBuilder.body, settings.USER_FRESH_SUBJECT, to)

    def sendFreshRequestHeadEmail(self):
        to = self.request['head_email']
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
        to = self.sender
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
                m['Date'] = formatdate(localtime=True)
                s = smtplib.SMTP(settings.SRCE_SMTP, 25, timeout=120)
                s.ehlo()
                if cc and type(to) is list:
                    s.sendmail(self.sender, to + [cc], m.as_string())
                elif cc and type(to) is str:
                    s.sendmail(self.sender, [to, cc], m.as_string())
                else:
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
            to.append(self.request['user']['email'])
        if toHead:
            to.append(self.request['head_email'])

        if len(to) > 0:
            return to
        else:
            return [self.sender]
