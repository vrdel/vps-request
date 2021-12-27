#!/usr/bin/python3.6

import json
import sys
import pprint


def main():
    with open(sys.argv[1]) as fp:
        js = json.load(fp)
        pprint.pprint(js)


main()
