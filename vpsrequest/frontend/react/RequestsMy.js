import React, { useState, useEffect, useMemo} from 'react';
import { Backend } from './DataManager';
import { BaseView, LoadingAnim, Status } from './UIElements';
import { useTable } from 'react-table';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CONFIG } from './Config'
import {
  faPencilAlt,
  faSearch
  } from '@fortawesome/free-solid-svg-icons';
import { DateFormatHR } from './Util'

// import 'react-table/react-table.css';
// import './RequestsMy.css'

const MyRequests = (props) => {
    const location = props.location;
    const backend = new Backend();
    const apiListRequests = `${CONFIG.listReqUrl}/mine`
    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState(null);
    const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    setLoading(true);
    const initializeComponent = async () => {
      let sessionActive = await backend.isActiveSession();

      if (sessionActive.active) {
        let fetched = await backend.fetchData(apiListRequests);
        setRequests(fetched);
        setUserDetails(sessionActive.userdetails)
      }
    }

    initializeComponent();
    setLoading(false);
  }, [])


  if (loading)
    return (<LoadingAnim />)

  else if (!loading && requests && userDetails) {
    const columns = [
      {
        id: 'cardNumber',
        Header: 'r. br.',
        accessor: r => Number(requests.indexOf(r) + 1),
        maxWidth: 50,
      },
      {
        id: 'isApproved',
        Header: 'Status',
        accessor: r => {
            return (<Status params={CONFIG['status'][r.approved]} renderToolTip={true}/>)
        },
        maxWidth: 90,
      },
      {
        id: 'requestDate',
        Header: 'Datum podnošenja',
        accessor: r => DateFormatHR(r.request_date),
        maxWidth: 180
      },
      {
        Header: 'Ustanova',
        accessor: 'head_institution',
      },
      {
        id: 'contactNameLastName',
        Header: 'Kontaktna osoba',
        accessor: r => `${userDetails.first_name} ${userDetails.last_name}`,
        maxWidth: 180
      },
      {
        Header: 'Poslužitelj',
        accessor: 'vm_fqdn',
        maxWidth: 180
      },
      {
        id: 'edit',
        Header: 'Akcija',
        accessor: r => {
          let url = ''
          let icon = undefined

          if (r.approved === 3 || r.approved === 0) {
            let path_segment = r.approved === 3 ? 'umirovljen' : 'odbijen'
            url = `/ui/stanje-zahtjeva/${path_segment}/${r.id}`
            icon = <FontAwesomeIcon className="text-primary" size="lg" icon={faSearch}/>
          }
          else {
            url = '/ui/stanje-zahtjeva/' + r.id
            icon = <FontAwesomeIcon className="text-success" size="lg" icon={faPencilAlt}/>
          }

          return (
            <Link to={url}>
              {icon}
            </Link>
          )
        },
        maxWidth: 70
      }
    ]
    return (
      <BaseView
        title='Stanje zahtjeva'
        location={location}>
        {requests}
      </BaseView>
    )
  }
  else
    return null
}

export default MyRequests;
