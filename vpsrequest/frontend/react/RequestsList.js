import React, { useMemo } from 'react';
import { Backend } from './DataManager';
import { BaseView, LoadingAnim, Status } from './UIElements';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import { DateFormatHR } from './Util';
import { CONFIG } from './Config'
import {
  Input,
  Badge,
  Table
} from 'reactstrap';
import { useTable, useFilters } from 'react-table';
import { useQuery } from 'react-query';


const DefaultColumnFilter = ({column: { filterValue, setFilter }}) => {
  return (
    <Input className="text-center"
      type="text"
      aria-label='Pretraži'
      placeholder="Pretraži"
      value={filterValue || ''}
      onChange={e => {setFilter(e.target.value || undefined)}}
    />
  )
}


function RequestsTable({ columns, data }) {
  const defaultColumn = useMemo(
    () => ({
      Filter: DefaultColumnFilter,
    }),[])

  const {
    headerGroups,
    rows,
    prepareRow,
  } = useTable({
    columns,
    data,
    defaultColumn
  }, useFilters)

  return (
    <Table responsive hover size="sm" className="mt-4 text-center align-middle">
      <thead className="table-active align-middle text-center align-self-center p-2">
        {headerGroups.map((headerGroup, thi) => (
          <React.Fragment key={thi}>
            <tr>
              {headerGroup.headers.map((column, tri) => {
                let width = undefined;

                if (tri === 0)
                  width = '50px'
                else if (tri === 1)
                  width = '90px'
                else if (tri === 2)
                  width = '180px'
                else if (tri === 3)
                  width = undefined
                else if (tri === 4)
                  width = '180px'
                else if (tri === 5)
                  width = undefined
                else if (tri === 6)
                  width = '70px'

                return (
                  <th style={{width: width}}
                    className="align-self-center align-middle"
                    key={tri}>
                    {column.render('Header')}
                  </th>
                )
              })}
            </tr>
            <tr className="p-0 m-0">
              {headerGroup.headers.map((column, tri) => {
                if (tri === 0)
                  return(
                    <th className="p-1 m-1 align-middle" key={tri + 11}>
                      <FontAwesomeIcon icon={faSearch}/>
                    </th>
                  )
                else if (tri === 2 || tri === 3 || tri === 4 || tri === 5)
                  return (
                    <th className="p-1 m-1" key={tri + 11}>
                      {column.canFilter ? column.render('Filter') : null}
                    </th>
                  )
                else
                  return (
                    <th key={tri + 11}>
                    </th>
                  )
              })}
            </tr>
          </React.Fragment>
        ))}
      </thead>
      <tbody>
        {rows.map((row, row_index) => {
          prepareRow(row)
          return (
            <tr key={row_index}>
              {row.cells.map((cell, cell_index) =>
                <td key={cell_index}
                  className="align-middle align-self-center">
                  {cell.render('Cell')}
                </td>
              )}
            </tr>
          )
        })}
      </tbody>
    </Table>
  )
}

const ListRequests = (props) => {
  const apiListRequests = props.typeRequest.api
  const location = props.location;
  const backend = new Backend();
  const isApprovedList = props.typeRequest.api.endsWith('approved')
  let apiStatsRequestsApproved = undefined;
  if (isApprovedList)
    apiStatsRequestsApproved = props.typeRequest.apiStats

  const { data: userDetails, error: errorUserDetails, isLoading: loadingUserDetails } = useQuery(
    `session-userdetails`, async () => {
      const sessionActive = await backend.isActiveSession()
      if (sessionActive.active) {
        return sessionActive.userdetails
      }
    }
  );

  const { data: requests, error: errorRequest, isLoading: loadingRequests } = useQuery(
    `request_${props.typeRequest.linkPath}`, async () => {
      const fetched = await backend.fetchData(apiListRequests)
      return fetched
    },
    {
      enabled: userDetails
    }
  );

  const { data: stats, error: errorStats, isLoading: loadingStats } = useQuery(
    `stats_${props.typeRequest.linkPath}`, async () => {
      let fetched = undefined
      if (isApprovedList)
        fetched = await backend.fetchData(apiStatsRequestsApproved)
        return fetched
    },
    {
      enabled: requests
    }
  );

  const columns = useMemo(() => [
    {
      id: 'cardNumber',
      Header: 'r. br.',
      accessor: (r, i) => Number(requests.length - i)
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
    }
  ])

  if (loadingRequests || loadingStats)
    return (<LoadingAnim />)

  else if (!loadingRequests && !loadingStats && requests && isApprovedList && stats) {
    return (
      <BaseView
        title={props.typeRequest.title}
        location={location}>
        {
          <span>
            <Badge className="mt-3" color="success" style={{fontSize: '120%'}}>
              Aktivni<Badge className="ml-2" color="light">{stats.active}</Badge>
            </Badge>
            <Badge className="ml-3" color="secondary" style={{fontSize: '120%'}}>
              Umirovljeni<Badge className="ml-2" color="light">{stats.retired}</Badge>
            </Badge>
          </span>
        }
        <RequestsTable columns={columns} data={requests}/>
      </BaseView>
    )
  }
  else if (!loadingRequests && requests && !isApprovedList) {
    return (
      <BaseView
        title={props.typeRequest.title}
        location={location}>
        <RequestsTable columns={columns} data={requests}/>
      </BaseView>
    )
  }
  else
    return null
}

export default ListRequests;
