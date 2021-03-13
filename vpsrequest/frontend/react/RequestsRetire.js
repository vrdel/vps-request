import React, { useEffect, useState } from 'react';
import { Backend } from './DataManager';
import {
  Button,
  Pagination,
  PaginationItem,
  PaginationLink,
  Row,
  Col,
  Table
} from 'reactstrap';
import {
  faSearch,
  faSave,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Formik, Field, FieldArray, Form } from 'formik';
import { BaseView, LoadingAnim } from './UIElements';
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
  const apiListRequests = `${CONFIG.listReqUrl}/vmissued_unknown`
  const [pageSize, setPageSize] = useState(30)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageCount, setPageCount] = useState(undefined)
  const [userDetails, setUserDetails] = useState(undefined)
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState(undefined)
  const [requestsView, setRequestsView] = useState(undefined)
  const [searchDateRequest, setSearchDateRequest] = useState("")
  const [searchDateResponse, setSearchDateResponse] = useState("")
  const [searchVmFqdn, setSearchVmFqdn] = useState("")
  const [searchEmail, setSearchEmail] = useState("")
  const [searchVmIsActiveComment, setSearchVmIsActiveComment] = useState("")
  const [searchVmIsActive, setSearchVmIsActive] = useState("")

  const initializeComponent = async () => {
    const session = await backend.isActiveSession();

    if (session.active) {
      const fetched = await backend.fetchData(`${apiListRequests}`);
      setRequests(emptyIfNullRequestPropery(fetched));
      setRequestsView(emptyIfNullRequestPropery(fetched));
      setUserDetails(session.userdetails);
      setPageCount(Math.trunc(fetched.length / pageSize))
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    initializeComponent();
  }, [])

  const handleOnSubmit = async (data) => {
    console.log(data)
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

    if (!resetSearch) {
      if (field === 'user.email')
        filtered = filtered.filter((elem) => matchItem(elem.user.email, target)
          || matchItem(elem.sys_email, target))
      if (field === 'vm_fqdn')
        filtered = filtered.filter((elem) => matchItem(elem[field], target)
          || matchItem(elem.vm_ip, target))
      setRequestsView(filtered)
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
      setRequestsView(filtered)
    }

    if (field === 'vm_isactive') {
      let requestsSearch = [...requests]
      if (searchVmFqdn)
        requestsSearch = requestsSearch.filter((elem) => matchItem(elem.vm_fqdn, searchVmFqdn)
          || matchItem(elem.vm_ip, searchVmFqdn))
      if (searchEmail)
        requestsSearch = requestsSearch.filter((elem) => matchItem(elem.user.email, searchEmail)
          || matchItem(elem.sys_email, searchEmail))

      if (target === "Svi")
        filtered = requestsSearch
      else if (target === "-")
        filtered = requestsSearch.filter((elem) => elem[field] === "")
      else
        filtered = requestsSearch.filter((elem) => matchItem(elem[field], target))
      setRequestsView(filtered)
    }
  }

  if (loading)
    return (<LoadingAnim />)

  else if (!loading && requests && requestsView && userDetails) {
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
              searchDateRequest: searchDateRequest,
              searchDateResponse: searchDateResponse,
              searchVmFqdn: searchVmFqdn,
              searchEmail: searchEmail,
              searchVmIsActiveComment: searchVmIsActiveComment,
              searchVmIsActive: searchVmIsActive,
            }}
            validateOnChange={false}
            validateOnBlur={false}
            enableReinitialize={true}
            onSubmit={(values, {setSubmitting} )=> {
              handleOnSubmit(values.requestsFormik)
              setSubmitting(false)
            }}
          >
            {props => (
              <React.Fragment>
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
                                    <th style={{width: '10%'}}>Podnesen</th>
                                    <th style={{width: '10%'}}>Izjašnjen</th>
                                    <th style={{width: '10%'}}>Poslužitelj, IP adresa</th>
                                    <th style={{width: '10%'}}>Kontaktna, sistemac email</th>
                                    <th style={{width: '47%'}}>Komentar</th>
                                    <th style={{width: '8%'}}>Potreban</th>
                                    <th style={{width: '5%'}}>Spremi</th>
                                  </tr>
                                </thead>
                                <tbody className="align-middle text-center">
                                  <tr style={{background: "#ECECEC"}}>
                                    <td className="align-middle text-center">
                                      <Field
                                        type="text"
                                        name="searchDateRequest"
                                        required={false}
                                        className="form-control"
                                        id="searchDateRequest"
                                        onChange={(e) => (e)}
                                        component={SearchField}
                                      />
                                    </td>
                                    <td>
                                      <Field
                                        type="text"
                                        name="searchDateResponse"
                                        required={false}
                                        className="form-control"
                                        id="searchDateResponse"
                                        onChange={(e) => (e)}
                                        component={SearchField}
                                      />
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
                                        onChange={(e) => (e)}
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
                                          { DateFormatHR(props.values.requestsFormik[index].request_date, true) }
                                        </td>
                                        <td className="align-middle text-left">
                                          { DateFormatHR(props.values.requestsFormik[index].vm_isactive_response, true) }
                                        </td>
                                        <td className="align-middle text-left">
                                          { props.values.requestsFormik[index].vm_fqdn } <br/>
                                          { props.values.requestsFormik[index].vm_ip }
                                        </td>
                                        <td className="align-middle text-left">
                                          { props.values.requestsFormik[index].user.email } <br/>
                                          { props.values.requestsFormik[index].sys_email }
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
                                          <Button className="btn" id="submit-button" type="submit" size="sm">
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
