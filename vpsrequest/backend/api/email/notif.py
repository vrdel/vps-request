from backend import models, serializers
from email.mime.text import MIMEText
from email.header import Header
from dateutil.parser import parse
import smtplib
import socket
import os, re, datetime

class Notification(object):

    SRCE_SMTP = 'smtp.srce.hr'
    SRCE_FROM = 'vps-adminAAA@srce.hr'
    TEMPLATES_DIR = '{}/templates/'.format(os.path.dirname(os.path.realpath(__file__)))
    ADMIN_FRESH_TEMPLATE = TEMPLATES_DIR + 'fresh_request_admin.tpl'
    ADMIN_FRESH_SUBJECT = 'Novi zahtjev za virtualnim poslužiteljem u usluzi VPS'
    USER_FRESH_TEMPLATE = TEMPLATES_DIR + 'fresh_request_user.tpl'
    USER_FRESH_SUBJECT = '[Srce] Zahtjev za virtualnim poslužiteljem u usluzi VPS'
    HEAD_FRESH_TEMPLATE = TEMPLATES_DIR + 'fresh_request_head.tpl'
    HEAD_FRESH_SUBJECT = '[Srce] Zahtjev za virtualnim poslužiteljem u usluzi VPS'

    def __init__(self, requestID, logger = None):
        self.logger = logger
        self.sender = self.SRCE_FROM

        reqData = models.Request.objects.get(pk=requestID)
        serializer = serializers.RequestsListSerializer(reqData, many=False)
        self.request = serializer.data

        #self.request = request #models.Request.objects.get(pk=requestID)

    def composeFreshRequestAdminEmail(self):
        email_text = None
        to = 'hsute@srce.hr'
        email_text = self.prepareMail(self.ADMIN_FRESH_TEMPLATE, self.ADMIN_FRESH_SUBJECT, to)

        if email_text:
            self.send(email_text, to)


    def composeFreshRequestUserEmail(self):
        email_text = None
        to = 'hsute@srce.hr'
        email_text = self.prepareMail(self.USER_FRESH_TEMPLATE, self.USER_FRESH_SUBJECT, to)

        if email_text:
            self.send(email_text, to)

    def composeFreshRequestHeadEmail(self):
        email_text = None
        to = 'hsute@srce.hr'
        email_text = self.prepareMail(self.HEAD_FRESH_TEMPLATE, self.HEAD_FRESH_SUBJECT, to)

        if email_text:
            self.send(email_text, to)


    def prepareMail(self, template, subject, to):
        body = None
        with open(template, mode='r', encoding='utf-8') as fp:
            body = fp.readlines()
        
        import ipdb; ipdb.set_trace()
      

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
            m['Subject'] = Header(subject, 'utf-8')
            
            return m.as_string()    

        return None

    
    def send(self, email_text, to):
        if not email_text:
            self.logger.error('Could not construct an email')

        else:
            try:
                s = smtplib.SMTP(self.SRCE_SMTP, 25, timeout=120)
                s.ehlo()
                s.sendmail(self.sender, ['hsute@srce.hr', self.sender], email_text)
                s.quit()

                return True

            except (socket.error, smtplib.SMTPException) as e:
                self.logger.error(repr(e))

        
