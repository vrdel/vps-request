#!/usr/bin/python

import argparse
import json


def main():
    parser = argparse.ArgumentParser(description="DB import from MySQL DB JSON dump")
    parser.add_argument('-f', required=True, help='MySQL DB JSON dump', dest='dump')
    parser.add_argument('-o', required=True, help='reformatted DB JSON dump', dest='out')
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
        users.append(user)
        requests.append(request)

    for user in users:
        tmp = dict()
        tmp['model'] = 'backend.user'
        tmp['fields'] = user
        entries.append(tmp)

    for request in requests:
        tmp = dict()
        tmp['model'] = 'backend.requests'
        tmp['fields'] = request
        entries.append(tmp)

    with open(args.out, 'w') as fo:
        json.dump(entries, fo, indent=4)


if __name__ == '__main__':
    main()
