import React, { useEffect, useState, useMemo } from 'react';
import { Backend } from './DataManager';
import { BaseView, LoadingAnim, FilterField, Status } from './UIElements';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import { DateFormatHR } from './Util';

// import 'react-table/react-table.css';
// import './RequestsMy.css';
import { CONFIG } from './Config'
import {
  Badge
} from 'reactstrap';
import { useTable } from 'react-table';


function Table({ columns, data }) {
  // Use the state and functions returned from useTable to build your UI
  const {
    headerGroups,
    rows,
    prepareRow,
  } = useTable({
    columns,
    data,
  })

  // Render the UI for your table
  return (
    <table className="mt-4 text-center align-middle table table-sm table-hover">
      <thead className="table-active align-middle text-center align-self-center p-2">
        {headerGroups.map((headerGroup, thi) => (
          <tr key={thi}>
            {headerGroup.headers.map((column, tri) => (
              <th className="align-self-center align-middle" key={tri}>{column.render('Header')}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {rows.map((row, row_index) => {
          prepareRow(row)
          return (
            <tr key={row_index}>
              {row.cells.map((cell, cell_index) => {
                if (cell_index === 0)
                  return <td key={cell_index} className="align-middle text-center align-self-center">{row_index + 1}</td>
                else
                  return <td key={cell_index} className="align-middle align-self-center">{cell.render('Cell')}</td>
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

const ListRequests = (props) => {
  const apiListRequests = props.typeRequest.api
  const location = props.location;
  const backend = new Backend();
  const isApprovedList = props.typeRequest.api.endsWith('approved')
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState(null);
  const [statsActiveRetired, setActiveRetired] = useState(undefined);
  let apiStatsRequestsApproved = undefined;
  if (isApprovedList)
    apiStatsRequestsApproved = props.typeRequest.apiStats

  useEffect(() => {
    setLoading(true);
    initializeComponent()
  }, [])

  const initializeComponent = async () => {
    const sessionActive = await backend.isActiveSession()

    if (sessionActive.active) {
      let fetched_stats = undefined
      const fetched = await backend.fetchData(apiListRequests)

      if (isApprovedList)
        fetched_stats = await backend.fetchData(apiStatsRequestsApproved)

      setRequests(fetched)
      setActiveRetired(fetched_stats)
      setLoading(false);
    }
  }

  const columns = useMemo(() => [
    {
      id: 'cardNumber',
      Header: 'r. br.',
      accessor: r => Number(requests.length - requests.indexOf(r)),
      width: 150,
    },
    {
      id: 'isApproved',
      Header: 'Status',
      accessor: r => r.approved,
      Cell: props => <Status params={CONFIG['status'][props.value]}/>,
    },
    {
      id: 'requestDate',
      Header: props.typeRequest.headerDate,
      accessor: r => DateFormatHR(eval(`r.${props.typeRequest.dateFieldSearch}`)),
    },
    {
      Header: 'Ustanova',
      accessor: 'head_institution',
    },
    {
      id: 'contactNameLastName',
      Header: 'Kontaktna osoba',
      accessor: r => `${r.user.first_name} ${r.user.last_name}`,
    },
    {
      Header: 'Poslužitelj',
      accessor: 'vm_fqdn',
    },
    {
      id: 'edit',
      Header: props.typeRequest.lastColHeader,
      accessor: r => {
        let linkPath = props.typeRequest.linkPath
        let lastColIcon = props.typeRequest.lastColIcon
        if (r.approved === 3) {
          linkPath = `${linkPath}/${props.typeRequest.linkPathReadOnly}`
          lastColIcon = props.typeRequest.lastColIconReadOnly
        }
        return (
          <Link aria-label={`${linkPath}/${r.id}`} to={`/ui/${linkPath}/${r.id}`}>
            {lastColIcon}
          </Link>
        )
      },
      maxWidth: 70
    }
  ])

  if (loading)
    return (<LoadingAnim />)

  else if (!loading && requests && isApprovedList && statsActiveRetired) {
    return (
      <BaseView
        title={props.typeRequest.title}
        location={location}>
        {
          <span>
            <Badge className="mt-3" color="success" style={{fontSize: '120%'}}>
              Aktivni<Badge className="ml-2" color="light">{statsActiveRetired.active}</Badge>
            </Badge>
            <Badge className="ml-3" color="secondary" style={{fontSize: '120%'}}>
              Umirovljeni<Badge className="ml-2" color="light">{statsActiveRetired.retired}</Badge>
            </Badge>
          </span>
        }
        <Table columns={columns} data={requests}/>
      </BaseView>
    )
  }
  else if (!loading && requests && !isApprovedList) {
    return (
      <BaseView
        title={props.typeRequest.title}
        location={location}>
        <Table columns={columns} data={requests}/>
      </BaseView>
    )
  }
  else
    return null
}

export default ListRequests;
