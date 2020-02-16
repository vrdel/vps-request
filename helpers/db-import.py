#!/usr/bin/python

import argparse
import json
import pprint

def main():
    parser = argparse.ArgumentParser(description="DB import from MySQL DB JSON dump")
    parser.add_argument('-f', required=True, help='MySQL DB JSON dump', dest='dump')
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
        pprint.pprint(js)

    import ipdb; ipdb.set_trace()


if __name__ == '__main__':
    main()
