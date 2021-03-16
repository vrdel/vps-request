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
} from 'reactstrap';
import {
  faSearch,
  faSave,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Formik, Field, FieldArray, Form } from 'formik';
import { BaseView, LoadingAnim, NotifyOk, NotifyError, } from './UIElements';
import { CONFIG } from './Config'
import { DateFormatHR } from './Util'
import { DropDownMyActive, emptyIfNullRequestPropery } from './RequestsActiveMy';


export const SearchField = ({field, ...rest}) =>
  <input type="text" placeholder="Pretraži" {...field} {...rest}/>


function matchItem(item, value) {
  return item.toLowerCase().indexOf(value.toLowerCase()) !== -1;
}


const RetireRequests = (props) => {
  const location = props.location;
  const backend = new Backend();
  const apiListRequests = `${CONFIG.listReqUrl}/vmissued_retire`
  const apiListRequestsStats = `${CONFIG.listReqUrl}/vmissued_retire_stats`
  const [pageSize, setPageSize] = useState(30)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageCount, setPageCount] = useState(undefined)
  const [requestsStats, setRequestsStats] = useState({})
  const [userDetails, setUserDetails] = useState(undefined)
  const [indexRequestSubmit, setIndexRequestSubmit] = useState(undefined)
  const [loading, setLoading] = useState(false)
  const [requests, setRequests] = useState(undefined)
  const [requestsView, setRequestsView] = useState(undefined)
  const [searchVmFqdn, setSearchVmFqdn] = useState("")
  const [searchEmail, setSearchEmail] = useState("")
  const [searchVmIsActiveComment, setSearchVmIsActiveComment] = useState("")
  const [searchVmIsActive, setSearchVmIsActive] = useState("")

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
      let remainder = fetched.length / pageSize
      if (remainder)
        setPageCount(Math.trunc(fetched.length / pageSize) + 1)
      else
        setPageCount(Math.trunc(fetched.length / pageSize))
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    initializeComponent();
  }, [])

  const setPageCountNoZero = (dataArray) => {
    let result = Math.trunc(dataArray.length / pageSize)
    if (result === 0)
      setPageCount(1)
    else {
      let remainder = dataArray.length / pageSize
      if (remainder)
        setPageCount(Math.trunc(dataArray.length / pageSize) + 1)
      else
        setPageCount(Math.trunc(dataArray.length / pageSize))
    }
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
    copyFull[targetIndex] = data
    setRequests(copyFull)

    let yes = copyFull.filter(e => e.vm_isactive === 'Da')
    let no = copyFull.filter(e => e.vm_isactive === 'Ne')
    let unknown = copyFull.filter(e => e.vm_isactive === '')
    setRequestsStats({
      'yes': yes.length,
      'no': no.length,
      'unknown': unknown.length
    })
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
      setPageCountNoZero(filtered)
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
      setPageCountNoZero(filtered)
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
        filtered = requestsSearch.filter((elem) => elem[field] === "")

      else
        filtered = requestsSearch.filter((elem) => matchItem(elem[field], target))

      setRequestsView(filtered)
      setPageCountNoZero(filtered)
      setPageIndex(0)
    }
  }

  const handleClickSubmit = (e, index) => {
    setIndexRequestSubmit(index)
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
                <Row>
                  <Col className="d-flex justify-content-center align-self-center">
                    <Pagination className="mt-5">
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
                            let remainder = requests.length / pageSize
                            if (remainder)
                              setPageCount(Math.trunc(requests.length / Number(e.target.value)) + 1)
                            else
                              setPageCount(Math.trunc(requests.length / Number(e.target.value)))
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
                                    <th style={{width: '90px'}}>Podnesen</th>
                                    <th style={{width: '90px'}}>Izjašnjen</th>
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
