import React, { useMemo, useState } from 'react';
import { Backend } from './DataManager';
import { BaseView, LoadingAnim, Status } from './UIElements';
import { useTable, usePagination } from 'react-table';
import { Link } from 'react-router-dom';
import {
  Pagination,
  PaginationItem,
  PaginationLink,
  Row,
  Col,
  Table
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CONFIG } from './Config'
import {
  faPencilAlt,
  faSearch
  } from '@fortawesome/free-solid-svg-icons';
import { DateFormatHR } from './Util'
import { useQuery } from 'react-query';
import Cookies from 'universal-cookie';


const EmptyTable = ({ columns, data }) => {
  const {
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data,
    },
  )

  return (
    <Table responsive hover size="sm">
      <thead className="table-active align-middle text-center">
        {headerGroups.map((headerGroup, thi) => (
          <tr key={thi}>
            {headerGroup.headers.map((column, tri) => (
              <th key={tri}>{column.render('Header')}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {
          [...Array(3)].map((e, ri) => {
            return (
              <tr key={ri}>
                {
                  ri === 1 && rows.length === 0 ?
                    <td colSpan={7} style={{height: '45px'}} className="align-middle text-center text-muted">{'Nema zahtjeva'}</td>
                  :
                    [...Array(7)].map((e, ci) => {
                      return <td style={{height: '45px'}} key={ci} className="align-middle text-center">{''}</td>
                    })
                }
              </tr>
            )
          })
        }
      </tbody>
    </Table>
  )
}


const RequestsTable = ({ columns, data }) => {
  const {
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 20 }
    },
    usePagination
  )

  return (
    <React.Fragment>
      <Row>
        <Col>
          <Table aria-label='Stanje zahtjeva' responsive hover size="sm" className="mt-4">
            <thead className="table-active align-middle text-center">
              {headerGroups.map((headerGroup, thi) => (
                <tr key={thi}>
                  {headerGroup.headers.map((column, tri) => {
                    let width = undefined;

                    if (tri === 0)
                      width = '50px'
                    else if (tri === 1)
                      width = '90px'
                    else if (tri === 2)
                      width = '180px'
                    else if (tri === 6)
                      width = '70px'
                    else
                      width = undefined

                    return (
                      <th style={{width: width}}
                        key={tri}>
                        {column.render('Header')}
                      </th>
                    )
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {page.map((row, row_index) => {
                prepareRow(row)
                return (
                  <tr key={row_index}>
                    {row.cells.map((cell, cell_index) => {
                      if (cell_index === 0)
                        return <td key={cell_index} className="align-middle text-center">{row_index + 1}</td>
                      else
                        return <td key={cell_index} className="align-middle text-center">{cell.render('Cell')}</td>
                    })}
                  </tr>
                )
              })}
            </tbody>
          </Table>
        </Col>
      </Row>
      <Row>
        <Col className="d-flex justify-content-center">
          <Pagination className="mt-5">
            <PaginationItem disabled={!canPreviousPage}>
              <PaginationLink aria-label="Prva stranica" first onClick={() => gotoPage(0)}/>
            </PaginationItem>
            <PaginationItem disabled={!canPreviousPage}>
              <PaginationLink aria-label="Prethodna" previous onClick={() => previousPage()}/>
            </PaginationItem>
            {
              [...Array(pageCount)].map((e, i) =>
                <PaginationItem active={ pageIndex === i ? true : false } key={i}>
                  <PaginationLink onClick={() => gotoPage(i)}>
                    { i + 1}
                  </PaginationLink>
                </PaginationItem>
              )
            }
            <PaginationItem disabled={!canNextPage}>
              <PaginationLink aria-label="Sljedeca" next onClick={() => nextPage()}/>
            </PaginationItem>
            <PaginationItem disabled={!canNextPage}>
              <PaginationLink aria-label="Posljednja stranica" last onClick={() => gotoPage(pageCount - 1)}/>
            </PaginationItem>
            <PaginationItem className="pl-2">
              <select
                style={{width: '180px'}}
                className="custom-select text-primary"
                aria-label="Broj zahtjeva"
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value))
                }}
              >
                {[20, 40, 80].map(pageSize => (
                  <option label={`${pageSize} zahtjeva`} key={pageSize} value={pageSize}>
                    {pageSize} zahtjeva
                  </option>
                ))}
              </select>
            </PaginationItem>
          </Pagination>
        </Col>
      </Row>
    </React.Fragment>
  )
}


const MyRequests = (props) => {
  const location = props.location;
  const backend = new Backend();
  const apiListRequests = `${CONFIG.listReqUrl}/mine`
  const [alertVisible, setAlertVisible] = useState(true);
  var cookie = new Cookies()
  var cookieAlert = cookie.get('alertDismiss')

  const { data: userDetails, error: errorUserDetails, isLoading: loadingUserDetails } = useQuery(
    `session-userdetails`, async () => {
      const sessionActive = await backend.isActiveSession()
      if (sessionActive.active) {
        return sessionActive.userdetails
      }
    }
  );

  const { data: requests, error: errorRequest, isLoading: loadingRequests } = useQuery(
    `stanje-zahtjeva-requests`, async () => {
      const fetched = await backend.fetchData(apiListRequests)
      return fetched
    },
    {
      enabled: userDetails
    }
  );

  const columns = useMemo(() => [
    {
      id: 'cardNumber',
      Header: 'r. br.',
      accessor: (r, i) => i + 1,
      maxWidth: 50,
      maxHeight: 32,
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
          <Link aria-label={url} to={url}>
            {icon}
          </Link>
        )
      },
      maxWidth: 70
    }
  ])

  if (loadingRequests || loadingUserDetails)
    return (<LoadingAnim />)

  else if (!loadingRequests && requests) {
    return (
      <BaseView
        title='Stanje zahtjeva'
        location={location}
        alert={!cookieAlert && alertVisible && userDetails.vmisactive_shouldask}
        alertdismiss={() => { new Cookies().set('alertDismiss', true); setAlertVisible(false)}}
        alertmsg={`Molimo da se do ${userDetails.vmisactive_responsedate} izjasnite da li su vam u tekućoj godini potrebni izdani poslužitelji. To možete na stavci "Aktivni VM-ovi"`}
      >
        {
          requests.length > 0 ?
            <RequestsTable columns={columns} data={requests}/>
          :
            <EmptyTable columns={columns} data={[]} />
        }
      </BaseView>
    )
  }
  else
    return null
}

export default MyRequests;
