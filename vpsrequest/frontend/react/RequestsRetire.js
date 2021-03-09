import React, { useMemo } from 'react';
import { Backend } from './DataManager';
import {
  Pagination,
  PaginationItem,
  PaginationLink,
  Row,
  Col,
  Table
} from 'reactstrap';
import { BaseView, LoadingAnim } from './UIElements';
import { useTable, usePagination } from 'react-table';
import { CONFIG } from './Config'
import { DateFormatHR } from './Util'
import { useQuery } from 'react-query';


const RequestsTable = ({ columns, data }) => {
  const dataLen = data.length
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
          <Table aria-label='Pred umirovljenje' responsive hover size="sm" className="mt-4">
            <thead className="table-active align-middle text-center">
              {headerGroups.map((headerGroup, thi) => (
                <tr key={thi}>
                  {headerGroup.headers.map((column, tri) => (
                    <th key={tri}>
                      {column.render('Header')}
                    </th>
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
                        return <td key={cell_index} className="align-middle text-center">{dataLen - row_index - (pageIndex * pageSize)}</td>
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
                {[50, 100, 200].map(pageSize => (
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


const RetireRequests = (props) => {
  const location = props.location;
  const backend = new Backend();
  const apiListRequests = `${CONFIG.listReqUrl}/vmissued_unknown`

  const { data: userDetails, error: errorUserDetails, isLoading: loadingUserDetails } = useQuery(
    `session-userdetails`, async () => {
      const sessionActive = await backend.isActiveSession()
      if (sessionActive.active) {
        return sessionActive.userdetails
      }
    }
  );

  const { data: requests, error: errorRequest, isLoading: loadingRequests } = useQuery(
    `vmissued-retire-requests`, async () => {
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
      maxWidth: 50,
      maxHeight: 32,
    },
    {
      id: 'requestDate',
      Header: 'Datum podnošenja',
      accessor: r => DateFormatHR(r.request_date, true),
    },
    {
      Header: 'Poslužitelj',
      accessor: 'vm_fqdn',
    },
    {
      id: 'contactNameLastName',
      Header: 'Kontaktni email',
      accessor: r => r.user.email,
    },
    {
      Header: 'Komentar',
      accessor: (r, i) => {
        let userText = r.vm_isactive_comment;
        return (
          <textarea id="story"
            className="form-control"
            name="story"
            rows="2"
            value={userText ? userText : ''}
            onChange={undefined}
          />
        )
      }
    },
    {
      Header: 'Potreban 2021.',
      accessor: (r, i) => {
        let userOption = r.vm_isactive;
        return (
          <select
            id={'select' + i}
            name="vm_isactive"
            className={`form-control custom-select text-center
              ${userOption === 'Da' ? 'border-success' : userOption === 'Ne'
              ? 'border-danger' : 'border-warning'}`}
          >
            {
              userOption === 'Da' ?
                <option value="Da" selected>Da</option>
              :
                <option value="Da" >Da</option>
            }
            {
              userOption === 'Ne' ?
                <option value="Ne" selected>Ne</option>
              :
                <option value="Ne">Ne</option>
            }
            {
              userOption === null ?
                <option value="Odaberi" selected>Odaberi</option>
              :
                <option value="Odaberi">Odaberi</option>
            }
          </select>
        )
      }
    },
    {
      id: 'edit',
      Header: 'Akcija',
      accessor: r => {
        return 'Action'
      },
      maxWidth: 70
    }
  ])

  if (loadingRequests || loadingUserDetails)
    return (<LoadingAnim />)

  else if (!loadingRequests && requests) {
    return (
      <BaseView
        title='Pred umirovljenje 2021.'
        location={location}
      >
        <RequestsTable columns={columns} data={requests}/>
      </BaseView>
    )
  }

  else
    return null

}

export default RetireRequests;
