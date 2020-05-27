#!/usr/bin/env python

import argparse
import json


def main():
    parser = argparse.ArgumentParser(description="DB import from MySQL DB JSON dump")
    parser.add_argument('-f', required=True, help='MySQL DB JSON dump', dest='dump')
    parser.add_argument('-o', required=True, help='Reformatted DB JSON dump', dest='out')
    parser.add_argument('--skip-user', type=int, required=True,
                        help='Skip number of users already in DB',
                        dest='numskipusers')
    args = parser.parse_args()

    user_map = {
        'user_lastname': 'last_name',
        'user_firstname': 'first_name',
        'user_aaieduhr': ['username', 'aaieduhr'],
        'user_institution': 'institution',
        'user_email': 'email',
        'user_role': 'role'
    }

    entries = list()
    users = list()
    requests = list()
    num_request = 1
    num_user = args.numskipusers + 1
    looked_users = set()

    with open(args.dump) as fp:
        js = json.load(fp)

    for request in js['request']:
        user = dict()
        for (k, v) in user_map.items():
            if type(v) is list:
                for val in v:
                    user[val] = request[k]
            else:
                user[v] = request[k]
            request.pop(k)

        request[u'user'] = [user['username']]
        ts = request.pop('ts')
        request['timestamp'] = ts
        request['id'] = num_request
        if request['vm_ready'] == 1:
            request['approved'] = 2
        if request['vm_dismissed'] is not None:
            request['approved'] = 3
        request.pop('vm_ready')
        request.pop('vm_host')
        for (k, v) in request.items():
            if type(v) is str or type(v) is unicode:
                request[k] = v.replace('\r\n', '\n')
        try:
            reason_lines = request['vm_reason'].splitlines()
            if (reason_lines
                and reason_lines[0].startswith('Adresa zahtjeva')
                and reason_lines[1].startswith('http://vps.srce.hr/zahtjev/index.php')):
                reason_lines.pop(0)
                reason_lines.pop(0)
                reason_lines.pop(0)
            if (reason_lines
                and reason_lines[0].startswith('Adresa zahtjeva')
                and reason_lines[1] == ''
                and reason_lines[2].startswith('http://vps.srce.hr/zahtjev/index.php')):
                reason_lines.pop(0)
                reason_lines.pop(0)
                reason_lines.pop(0)
            request['vm_reason'] = '\n'.join(reason_lines)
        except Exception as e:
            print(reason_lines)
            print(e)
            raise SystemExit(1)
        num_request += 1
        requests.append(request)

        if user['username'] in looked_users:
            continue

        looked_users.add(user['username'])
        user['id'] = num_user
        num_user += 1
        users.append(user)

    for user in users:
        tmp = dict()
        tmp['model'] = 'backend.user'
        tmp['fields'] = user
        entries.append(tmp)

    for request in requests:
        tmp = dict()
        tmp['model'] = 'backend.request'
        tmp['fields'] = request
        entries.append(tmp)

    with open(args.out, 'w') as fo:
        json.dump(entries, fo, indent=4)


if __name__ == '__main__':
    main()
