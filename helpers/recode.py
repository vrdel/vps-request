#!/usr/bin/python3.6

import json
import sys
import pprint


def main():
    recoded_entries = list()

    with open(sys.argv[1]) as fp:
        content = fp.read()
        jsoncontent = json.loads(content)

    for entry in jsoncontent:
        recoded_entries.append(entry)
        if ('backend.request' == entry['model'] or 'backend.user' ==
            entry['model'] or 'backend.vmos' == entry['model']):
            recoded = recoded_entries[-1]
            fields = dict()
            for key, value in recoded['fields'].items():
                if type(value) == str:
                    try:
                        fields[key] = value.encode('latin2').decode('utf8')
                    except (UnicodeEncodeError, UnicodeDecodeError) as exc:
                        # print(entry)
                        # print(key, value)
                        fields[key] = value
                else:
                    fields[key] = value
            recoded['fields'] = fields

    with open(sys.argv[2], mode='w') as fp:
        json.dump(recoded_entries, fp, indent=4)


main()
