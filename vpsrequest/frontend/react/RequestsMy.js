import React, { useState, useEffect, useMemo } from 'react';
import { Backend } from './DataManager';
import { BaseView, LoadingAnim, Status } from './UIElements';
import { useTable, usePagination } from 'react-table';
import { Link } from 'react-router-dom';
import {
  Pagination,
  PaginationItem,
  PaginationLink,
  Row,
  Col
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CONFIG } from './Config'
import {
  faPencilAlt,
  faSearch
  } from '@fortawesome/free-solid-svg-icons';
import { DateFormatHR } from './Util'

// import 'react-table/react-table.css';
// import './RequestsMy.css'

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
    <table className="table table-sm table-hover">
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
    </table>
  )
}

const Table = ({ columns, data, showEmpty=false }) => {
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
          <table className="table table-sm table-hover">
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
          </table>
        </Col>
      </Row>
      <Row>
        <Col className="d-flex justify-content-center">
          <Pagination>
            <PaginationItem disabled={!canPreviousPage}>
              <PaginationLink first onClick={() => gotoPage(0)}/>
            </PaginationItem>
            <PaginationItem disabled={!canPreviousPage}>
              <PaginationLink previous onClick={() => previousPage()}/>
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
              <PaginationLink next onClick={() => nextPage()}/>
            </PaginationItem>
            <PaginationItem disabled={!canNextPage}>
              <PaginationLink last onClick={() => gotoPage(pageCount - 1)}/>
            </PaginationItem>
            <PaginationItem className="pl-2">
              <select
                style={{width: '180px'}}
                className="custom-select text-primary"
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value))
                }}
              >
                {[20, 40, 80].map(pageSize => (
                  <option key={pageSize} value={pageSize}>
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
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

  const initializeComponent = async () => {
    let sessionActive = await backend.isActiveSession();

    if (sessionActive.active) {
      let fetched = await backend.fetchData(apiListRequests);
      setRequests(fetched);
      setUserDetails(sessionActive.userdetails)
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    initializeComponent();
  }, [])

  const columns = useMemo(() => [
    {
      id: 'cardNumber',
      Header: 'r. br.',
      accessor: r => Number(requests.indexOf(r) + 1),
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
          <Link to={url}>
            {icon}
          </Link>
        )
      },
      maxWidth: 70
    }
  ])

  if (loading)
    return (<LoadingAnim />)

  else if (!loading && requests && userDetails) {
    return (
      <BaseView
        title='Stanje zahtjeva'
        location={location}>
        {
          requests.length > 0 ?
            <Table columns={columns} data={requests}/>
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
