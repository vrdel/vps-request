import {faCog,
faTimes,
faCheckDouble,
faCheck,
faCouch
} from '@fortawesome/free-solid-svg-icons';


export const CONFIG = {
    'vmosUrl': '/api/v1/internal/vmos/',
    'listReqUrl': '/api/v1/internal/requests/',
    'status': {
        '-1': {
            'classname': 'text-warning',
            'id': 'Novi',
            'label': 'Novi',
            'icon': faCog
        },
        '0': {
            'classname': 'text-danger',
            'id': 'Odbijen',
            'label': 'Odbijen',
            'icon': faTimes
        },
        '1': {
            'classname': 'text-primary',
            'id': 'Odobren',
            'label': 'Odobren',
            'icon': faCheck
        },
        '2': {
            'classname': 'text-success',
            'id': 'IzdatVM',
            'label': 'Izdat VM',
            'icon': faCheckDouble
        },
        '3': {
            'classname': 'text-secondary',
            'id': 'Umirovljen',
            'label': 'Umirovljen',
            'icon': faCouch
        },
        
    }
}
