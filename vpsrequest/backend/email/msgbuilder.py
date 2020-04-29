import re
from dateutil.parser import parse
from backend.api.config import STATUSES

class MsgBuilder(object):

    def __init__(self, file_template):
        self.template = file_template
        self.body = None
        self.placeholders = []
        self.prepare()

    def prepare(self):
        body = None
        with open(self.template, mode='r', encoding='utf-8') as fp:
            body = fp.readlines()

        if body:
            self.body = ''.join(body)
            self.placeholders = re.findall(r"(__[A-Z_]+__)", self.body)

    def processPlaceholders(self, request):
        for ph in self.placeholders:
            db_attr = ph.strip('__').lower()
            if db_attr.startswith('user'):
                userAttr = db_attr.split('user_', 1)[1]
                self.body = self.body.replace(ph, str(request['user'][userAttr]))
            elif 'date' in db_attr:
                dt = parse(request[db_attr])
                self.body = self.body.replace(ph, dt.strftime('%d.%m.%Y. %H:%M:%S'))
            else:
                self.body = self.body.replace(ph, str(request[db_attr]))


    def findDiffs(self, newRequest, oldRequest):
        has_changes = False

        for ph in self.placeholders:
            db_attr = ph.strip('__').lower()
            if db_attr.startswith('user'):
                db_attr = db_attr.split('user_', 1)[1]
                newVal = newRequest['user'][db_attr]
                oldVal = oldRequest['user'][db_attr]
            elif db_attr == 'id':
                self.body = self.body.replace(ph, str(newRequest['id']))
                continue
            else:
                newVal = newRequest[db_attr]
                oldVal = oldRequest[db_attr]
            
            if newVal == oldVal:
                self.body = re.sub("\n.+" + ph + "\n", '', self.body)
            else:
                if db_attr == 'approved':
                    oldVal = STATUSES[oldVal]
                    newVal = STATUSES[newVal]

                self.body = self.body.replace(ph, "\n" + str(oldVal) + "\n\t --> \n" + str(newVal))
                if not has_changes:
                    has_changes = True

        if has_changes:
            found = re.search(r"(#+ Kontaktna osoba Ustanove #+\s+)#+ Zahtjevani", self.body)
            if found:
                self.body = re.sub(found.groups()[0], '', self.body)
            found = re.search(r"(#+ Zahtjevani resursi #+\s+)#+ Sistem", self.body)
            if found:
                self.body = re.sub(found.groups()[0], '', self.body)
            found = re.search(r"(#+ Sistem-inženjer virtualnog poslužitelja #+\s+)#+ Čelnik", self.body)
            if found:
                self.body = re.sub(found.groups()[0], '', self.body)
            found = re.search(r"(#+ Čelnik ustanove #+\s+)#+ Stanje", self.body)
            if found:
                self.body = re.sub(found.groups()[0], '', self.body)
            found = re.search(r"(#+ Stanje #+\s+)S po", self.body)
            if found:
                self.body = re.sub(found.groups()[0], '', self.body)

        else:
            self.body = None