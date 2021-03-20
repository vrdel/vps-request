import React, { useEffect, useState } from 'react';
import { Backend } from './DataManager';
import {
  Badge,
  Button,
  Pagination,
  PaginationItem,
  PaginationLink,
  Row,
  Col,
  Table,
  ButtonDropdown,
  DropdownMenu,
  DropdownToggle,
  DropdownItem
} from 'reactstrap';
import {
  faSearch,
  faSave,
  faArrowUp,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Formik, Field, FieldArray, Form } from 'formik';
import { BaseView, LoadingAnim, NotifyOk, NotifyError, } from './UIElements';
import { CONFIG } from './Config'
import { DateFormatHR } from './Util'
import { DropDownMyActive, emptyIfNullRequestPropery } from './RequestsActiveMy';
import PapaParse from 'papaparse';
import './RequestsRetire.css';

export const SearchField = ({field, ...rest}) =>
  <input type="text" placeholder="Pretraži" {...field} {...rest}/>


function matchItem(item, value) {
  if (typeof(item) === "string")
    return item.toLowerCase().indexOf(value.toLowerCase()) !== -1;
  else if (typeof(item) === "number" && item === -1) {
    item = ""
    return item.toLowerCase().indexOf(value.toLowerCase()) !== -1;
  }
}


const RetireRequests = (props) => {
  const location = props.location;
  const backend = new Backend();
  const apiListRequests = `${CONFIG.listReqUrl}/vmissued_retire`
  const apiListRequestsStats = `${CONFIG.listReqUrl}/vmissued_retire_stats`
  const [pageSize, setPageSize] = useState(30)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageCount, setStatePageCount] = useState(undefined)
  const [requestsStats, setRequestsStats] = useState({})
  const [userDetails, setUserDetails] = useState(undefined)
  const [indexRequestSubmit, setIndexRequestSubmit] = useState(undefined)
  const [loading, setLoading] = useState(false)
  const [requests, setRequests] = useState(undefined)
  const [requestsView, setRequestsView] = useState(undefined)
  const [searchVmFqdn, setSearchVmFqdn] = useState("")
  const [columnSortSubmit, setColumnSortSubmit] = useState(undefined)
  const [columnSortResponse, setColumnSortResponse] = useState(undefined)
  const [searchEmail, setSearchEmail] = useState("")
  const [searchVmIsActiveComment, setSearchVmIsActiveComment] = useState("")
  const [searchVmIsActive, setSearchVmIsActive] = useState("")
  const [dropdownExport, setDropdownExport] = useState(false);
  const toggleDropdown = () => setDropdownExport(!dropdownExport);

  const columnMap = new Object({
    'request_date': columnSortSubmit,
    'vm_isactive_response': columnSortResponse,
    'set_request_date': setColumnSortSubmit,
    'set_vm_isactive_response': setColumnSortResponse
  })

  const setColumnSort = (whichColumn) => columnMap[`set_${whichColumn}`](!columnMap[whichColumn])

  const initializeComponent = async () => {
    const session = await backend.isActiveSession();

    if (session.active) {
      const fetched = await backend.fetchData(`${apiListRequests}`);
      const fetched_stats = await backend.fetchData(`${apiListRequestsStats}`);
      let noNullFetched = emptyIfNullRequestPropery(fetched)
      setRequests(noNullFetched);
      setRequestsView(noNullFetched);
      setRequestsStats(fetched_stats);
      setUserDetails(session.userdetails);
      setPageCount(fetched)
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    initializeComponent();
  }, [])

  const setPageCount = (dataArray, pagesize=undefined) => {
    let localPageSize = undefined

    if (pagesize)
      localPageSize = pagesize
    else
      localPageSize = pageSize

    let result = Math.trunc(dataArray.length / localPageSize)
    let remainder = dataArray.length / localPageSize

    if (result === 0)
      setStatePageCount(1)

    else {
      if (remainder)
        setStatePageCount(result + 1)
      else
        setStatePageCount(result)
    }
  }

  const showArror = (whichState) => {
    if (whichState === true)
      return <span>&uarr;</span>;
    else if (whichState === false)
      return <span>&darr;</span>;
    else
      return ''
  }

  const handleOnSubmit = async (data) => {
    let response = await backend.changeObject(`${apiListRequests}/`, data);

    if (response.ok)
      NotifyOk({
        msg: 'Status poslužitelja uspješno promijenjeni',
        title: `Uspješno - HTTP ${response.status}`});
    else
      NotifyError({
        msg: response.statusText,
        title: `Greška - HTTP ${response.status}`});

    let targetId = data.id
    let targetIndex = requestsView.findIndex(request => request.id === targetId)

    let copyView = [...requestsView]
    copyView[targetIndex] = data
    setRequestsView(copyView)

    let copyFull = [...requests]
    targetIndex = requests.findIndex(request => request.id === targetId)
    let prevRequest = new Object(copyFull[targetIndex])
    copyFull[targetIndex] = data
    setRequests(copyFull)

    let newRequestStats = JSON.parse(JSON.stringify(requestsStats));

    if (prevRequest.vm_isactive === '' || prevRequest.vm_isactive === -1) {
      if (data.vm_isactive === 'Da') {
        newRequestStats.unknown -= 1
        newRequestStats.yes += 1
      }
      else if (data.vm_isactive === 'Ne') {
        newRequestStats.unknown -= 1
        newRequestStats.no += 1
      }
    }
    else if (prevRequest.vm_isactive === 'Ne'
      && data.vm_isactive === 'Da') {
      newRequestStats.no -= 1
      newRequestStats.yes += 1
    }
    else if (prevRequest.vm_isactive === 'Da'
      && data.vm_isactive === 'Ne') {
      newRequestStats.yes -= 1
      newRequestStats.no += 1
    }

    setRequestsStats(newRequestStats)
  }

  const gotoPage = (i, formikSetValues) => {
    let indexTo = undefined
    let indexFrom = undefined

    indexFrom = i * pageSize

    if (i === pageCount - 1)
      indexTo = requests.length
    else
      indexTo = indexFrom + pageSize

    formikSetValues({requestsFormik: requestsView.slice(indexFrom, indexTo)})
    setPageIndex(i)
  }

  const searchHandler = (field, target) => {
    let filtered = [...requestsView]
    let resetSearch = false

    if (target.length === '')
      resetSearch = true

    else if (field === 'user.email' && searchEmail.length > target.length)
      resetSearch = true

    else if (field === 'vm_fqdn' && searchVmFqdn.length > target.length)
      resetSearch = true

    else if (field === 'vm_isactive_comment' && searchVmIsActiveComment.length > target.length)
      resetSearch = true

    if (!resetSearch) {
      if (field === 'user.email')
        filtered = filtered.filter((elem) => matchItem(elem.user.email, target)
          || matchItem(elem.sys_email, target))

      if (field === 'vm_fqdn')
        filtered = filtered.filter((elem) => matchItem(elem[field], target)
          || matchItem(elem.vm_ip, target))

      if (field === 'vm_isactive_comment')
        filtered = filtered.filter((elem) => matchItem(elem[field], target))

      setRequestsView(filtered)
      setPageCount(filtered)
      setPageIndex(0)
    }

    else {
      let filtered = [...requests]

      if (field === 'user.email') {
        filtered = filtered.filter((elem) => matchItem(elem.vm_fqdn, searchVmFqdn)
          || matchItem(elem.vm_ip, searchVmFqdn) )

        filtered = filtered.filter((elem) => matchItem(elem.user.email, target)
          || matchItem(elem.sys_email, target))
      }

      else if (field === 'vm_fqdn') {
        filtered = filtered.filter((elem) => matchItem(elem.user.email, searchEmail)
          || matchItem(elem.sys_email, searchEmail))

        filtered = filtered.filter((elem) => matchItem(elem[field], target)
          || matchItem(elem.vm_ip, target))
      }

      else if (field === 'vm_isactive_comment')
        filtered = filtered.filter((elem) => matchItem(elem[field], target))

      setRequestsView(filtered)
      setColumnSortSubmit(undefined)
      setColumnSortResponse(undefined)
      setPageCount(filtered)
      setPageIndex(0)
    }

    if (field === 'vm_isactive') {
      let requestsSearch = [...requests]

      if (searchVmFqdn)
        requestsSearch = requestsSearch.filter((elem) => matchItem(elem.vm_fqdn, searchVmFqdn)
          || matchItem(elem.vm_ip, searchVmFqdn))

      if (searchEmail)
        requestsSearch = requestsSearch.filter((elem) => matchItem(elem.user.email, searchEmail)
          || matchItem(elem.sys_email, searchEmail))

      if (searchVmIsActiveComment)
        requestsSearch = requestsSearch.filter((elem) =>
          matchItem(elem.vm_isactive_comment, searchVmIsActiveComment))

      if (target === "Svi")
        filtered = requestsSearch

      else if (target === "-")
        filtered = requestsSearch.filter((elem) => elem[field] === "" || elem[field] === -1)

      else {
        filtered = requestsSearch.filter((elem) => matchItem(elem[field], target))
      }

      setRequestsView(filtered)
      setColumnSortSubmit(undefined)
      setColumnSortResponse(undefined)
      setPageCount(filtered)
      setPageIndex(0)
    }
  }

  const sortColumn = (columnName) => {
    const sortDate = (a, b) => {
      if (new Date(a[columnName]).getTime() < new Date(b[columnName]).getTime()) {
        if (columnMap[columnName])
          return -1
        else
          return 1
      }
      if (new Date(a[columnName]).getTime() > new Date(b[columnName]).getTime())
        if (columnMap[columnName])
          return 1
        else
          return -1
      if (new Date(a[columnName]).getTime() == new Date(b[columnName]).getTime())
        return 0
    }
    let sortedRequest = [...requestsView]
    sortedRequest.sort(sortDate)
    setRequestsView(sortedRequest)
  }

  const handleClickSubmit = (e, index) => {
    setIndexRequestSubmit(index)
  }

  const prepareCSV = ({viewData=false}) => {
    let csvContent = []
    let data = undefined

    if (viewData)
      data = requestsView
    else
      data = requests

    data.forEach((request) => {
      csvContent.push({
        podnesen: DateFormatHR(request.request_date, true),
        izjasnjen: DateFormatHR(request.vm_isactive_response, true),
        posluzitelj: request.vm_fqdn,
        email_kontaktna: request.user.email,
        email_sistemac: request.sys_email,
        komentar: request.vm_isactive_comment,
        potreban: !request.vm_isactive ? '-' : request.vm_isactive})
    })

    return csvContent
  }

  if (loading)
    return (<LoadingAnim />)

  else if (!loading && requests && requestsView && userDetails && requestsStats) {
    return (
      <React.Fragment>
        <BaseView
          title={`Pred umirovljenje ${new Intl.DateTimeFormat('hr-HR', {year: 'numeric'}).format(new Date())}`}
          location={location}
          nopaddingside={true}
        >
          <Formik
            initialValues={{
              requestsFormik: requestsView.slice(0, pageSize),
              searchVmFqdn: searchVmFqdn,
              searchEmail: searchEmail,
              searchVmIsActiveComment: searchVmIsActiveComment,
              searchVmIsActive: searchVmIsActive,
            }}
            validateOnChange={false}
            validateOnBlur={false}
            enableReinitialize={true}
            onSubmit={(values, {setSubmitting, setFieldValue} )=> {
              let vmIsActiveDateSet = new Date()
              setFieldValue(`requestsFormik.${indexRequestSubmit}.vm_isactive_response`, vmIsActiveDateSet)
              values.requestsFormik[indexRequestSubmit].vm_isactive_response = vmIsActiveDateSet
              handleOnSubmit(values.requestsFormik[indexRequestSubmit])
              setSubmitting(false)
            }}
          >
            {props => (
              <React.Fragment>
                <Row>
                  <Col>
                    <Badge className="mt-3" color="success" style={{fontSize: '110%'}}>
                      Aktivni<Badge className="ml-2" color="light">{requestsStats.yes}</Badge>
                    </Badge>
                    <Badge className="ml-3" color="danger" style={{fontSize: '110%'}}>
                      Umirovljenje<Badge className="ml-2" color="light">{requestsStats.no}</Badge>
                    </Badge>
                    <Badge className="ml-3" color="warning" style={{fontSize: '110%'}}>
                      Neizjašnjeni<Badge className="ml-2" color="light">{requestsStats.unknown}</Badge>
                    </Badge>
                  </Col>
                </Row>
                <Row className="d-flex justify-content-end align-self-center">
                  <Col sm="10">
                    <Pagination className="mt-5 justify-content-end">
                      <PaginationItem disabled={pageIndex === 0}>
                        <PaginationLink aria-label="Prva stranica" first onClick={() =>
                          gotoPage(0, props.setValues)}/>
                      </PaginationItem>
                      <PaginationItem disabled={pageIndex === 0}>
                        <PaginationLink aria-label="Prethodna" previous onClick={() => gotoPage(pageIndex - 1, props.setValues)}/>
                      </PaginationItem>
                      {
                        [...Array(pageCount)].map((e, i) =>
                          <PaginationItem active={ pageIndex === i ? true : false } key={i}>
                            <PaginationLink onClick={() =>
                              gotoPage(i, props.setValues)}>
                              { i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      }
                      <PaginationItem disabled={pageIndex === pageCount - 1}>
                        <PaginationLink aria-label="Sljedeca" next onClick={() => gotoPage(pageIndex + 1, props.setValues)}/>
                      </PaginationItem>
                      <PaginationItem disabled={pageIndex === pageCount - 1}>
                        <PaginationLink aria-label="Posljednja stranica" last onClick={() => gotoPage(pageCount - 1, props.setValues)}/>
                      </PaginationItem>
                      <PaginationItem>
                        <select
                          style={{width: '180px'}}
                          className="custom-select text-primary"
                          aria-label="Broj zahtjeva"
                          value={pageSize}
                          onChange={e => {
                            setPageSize(Number(e.target.value))
                            setPageCount(requests, e.target.value)
                            props.setValues({requestsFormik: requests.slice(0, Number(e.target.value))})
                            setPageIndex(0)
                          }}
                        >
                          {[30, 50, 100, requests.length].map(pageSize => (
                            <option label={`${pageSize} zahtjeva`} key={pageSize} value={pageSize}>
                              {pageSize} zahtjeva
                            </option>
                          ))}
                        </select>
                      </PaginationItem>
                    </Pagination>
                  </Col>
                  <Col className="d-inline-flex align-items-center justify-content-end" sm="2">
                    <ButtonDropdown className="mt-5" isOpen={dropdownExport} toggle={toggleDropdown}>
                      <DropdownToggle caret>
                        Izvoz
                      </DropdownToggle >
                      <DropdownMenu>
                        <DropdownItem id='vpsreq-retire-dropdown'
                          onClick={() => {
                            const link = document.createElement('a');
                            link.setAttribute('href', encodeURI(`data:text/csv;charset=utf8,\ufeff${PapaParse.unparse(prepareCSV({viewData: false}))}`));
                            link.setAttribute('download', `predumirovljenje-svi.csv`);
                            link.click();
                            link.remove();
                          }}
                        >
                          Svi
                        </DropdownItem>
                        <DropdownItem id='vpsreq-retire-dropdown'
                          onClick={() => {
                            const link = document.createElement('a');
                            link.setAttribute('href', encodeURI(`data:text/csv;charset=utf8,\ufeff${PapaParse.unparse(prepareCSV({viewData: true}))}`));
                            link.setAttribute('download', `predumirovljenje-filtrirani.csv`);
                            link.click();
                            link.remove();
                          }}
                        >
                          Filtrirani
                        </DropdownItem>
                      </DropdownMenu>
                    </ButtonDropdown>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Form>
                      <FieldArray
                          name="requestsFormik"
                          render={() => (
                            <React.Fragment>
                              <Table responsive hover size="sm">
                                <thead className="table-active align-middle text-center">
                                  <tr>
                                    <th
                                      onClick={() => {
                                        setColumnSort('request_date')
                                        sortColumn('request_date')
                                      }}
                                      style={{width: '94px'}}>
                                        Podnesen { showArror(columnMap['request_date']) }
                                    </th>
                                    <th
                                      onClick={() => {
                                        setColumnSort('vm_isactive_response')
                                        sortColumn('vm_isactive_response')
                                      }}
                                      style={{width: '90px'}}>
                                      Izjašnjen { showArror(columnMap['vm_isactive_response']) }
                                    </th>
                                    <th>Poslužitelj, IP adresa</th>
                                    <th>Kontaktna, sistemac email</th>
                                    <th>Komentar</th>
                                    <th style={{width: '80px'}}>Potreban</th>
                                    <th style={{width: '50px'}}>Spremi</th>
                                  </tr>
                                </thead>
                                <tbody className="align-middle text-center">
                                  <tr style={{background: "#ECECEC"}}>
                                    <td className="align-middle text-center">
                                      <FontAwesomeIcon icon={faSearch}/>
                                    </td>
                                    <td className="align-middle text-center">
                                      {''}
                                    </td>
                                    <td>
                                      <Field
                                        type="text"
                                        name="searchVmFqdn"
                                        required={false}
                                        className="form-control"
                                        id="searchVmFqdn"
                                        onChange={(e) => {
                                          searchHandler('vm_fqdn', e.target.value)
                                          setSearchVmFqdn(e.target.value)
                                        }}
                                        component={SearchField}
                                      />
                                    </td>
                                    <td>
                                      <Field
                                        type="text"
                                        name="searchEmail"
                                        required={false}
                                        className="form-control"
                                        id="searchEmail"
                                        onChange={(e) => {
                                          searchHandler('user.email', e.target.value)
                                          setSearchEmail(e.target.value)
                                        }}
                                        component={SearchField}
                                      />
                                    </td>
                                    <td>
                                      <Field
                                        type="text"
                                        name="searchVmIsActiveComment"
                                        required={false}
                                        className="form-control"
                                        id="searchVmIsActiveComment"
                                        onChange={(e) => {
                                          searchHandler('vm_isactive_comment', e.target.value)
                                          setSearchVmIsActiveComment(e.target.value)
                                        }}
                                        component={SearchField}
                                      />
                                    </td>
                                    <td>
                                      <Field
                                        name="searchVmIsActive"
                                        component="select"
                                        className="form-control custom-select"
                                        onChange={(e) => {
                                          searchHandler('vm_isactive', e.target.value)
                                          setSearchVmIsActive(e.target.value)
                                        }}
                                      >
                                        <option key={0} value='Svi' hidden className="text-muted">Svi</option>
                                        <option key={1} value='Svi'>Svi</option>
                                        <option key={2} value='-'>-</option>
                                        <option key={3} value='Da'>Da</option>
                                        <option key={4} value='Ne'>Ne</option>
                                      </Field>
                                    </td>
                                    <td>
                                      {''}
                                    </td>
                                  </tr>
                                  {
                                    props.values.requestsFormik.map((request, index) =>
                                      <tr key={index}>
                                        <td className="align-middle text-left">
                                          <Field
                                            name={`requestsFormik.${index}.request_date`}>
                                            {({ field }) => (
                                              <div>
                                                { DateFormatHR(field.value, true) } <br/>
                                                { DateFormatHR(field.value, false, true) }
                                              </div>
                                            )}
                                          </Field>
                                        </td>
                                        <td className="align-middle text-left">
                                          <Field
                                            name={`requestsFormik.${index}.vm_isactive_response`}>
                                            {({ field }) => (
                                              <div>
                                                { DateFormatHR(field.value, true) } <br/>
                                                { DateFormatHR(field.value, false, true) }
                                              </div>
                                            )}
                                          </Field>
                                        </td>
                                        <td className="align-middle text-left">
                                          <span className="font-weight-bold">
                                            { props.values.requestsFormik[index].vm_fqdn } <br/>
                                          </span>
                                          <span className="text-monospace">
                                            { props.values.requestsFormik[index].vm_ip }
                                          </span>
                                        </td>
                                        <td className="align-middle text-left">
                                          <a href={`mailto:${props.values.requestsFormik[index].user.email}`} className="text-decoration-none">
                                            { props.values.requestsFormik[index].user.email } <br/>
                                          </a>
                                          <a href={`mailto:${props.values.requestsFormik[index].sys_email}`} className="text-decoration-none">
                                            { props.values.requestsFormik[index].sys_email }
                                          </a>
                                        </td>
                                        <td className="align-middle text-center">
                                          <Field
                                            className="form-control"
                                            name={`requestsFormik.${index}.vm_isactive_comment`}
                                            as="textarea"
                                            rows={2}
                                          />
                                        </td>
                                        <td className="align-middle text-center">
                                          <Field
                                            name={`requestsFormik.${index}.vm_isactive`}
                                            component={DropDownMyActive}
                                            data={['-', 'Da', 'Ne']}
                                          />
                                        </td>
                                        <td className="align-middle text-center">
                                          <Button className="btn" id="submit-button" onClick={(e) => handleClickSubmit(e, index)} type="submit" size="sm">
                                            <FontAwesomeIcon type="submit" icon={faSave}/>
                                          </Button>
                                        </td>
                                      </tr>)
                                  }
                                </tbody>
                              </Table>
                            </React.Fragment>
                          )}
                        />
                    </Form>
                  </Col>
                </Row>
              </React.Fragment>
            )}
          </Formik>
        </BaseView>
      </React.Fragment>
    )
  }

  else
    return null
}


export default RetireRequests;
