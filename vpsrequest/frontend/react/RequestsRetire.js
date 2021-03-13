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

    formikSetValues({requestsFormik: requests.slice(indexFrom, indexTo)})
    setPageIndex(i)
  }

  if (loading)
    return (<LoadingAnim />)

  else if (!loading && requests && userDetails) {
    return (
      <React.Fragment>
        <BaseView
          title={`Pred umirovljenje ${new Intl.DateTimeFormat('hr-HR', {year: 'numeric'}).format(new Date())}`}
          location={location}
          nopaddingside={true}
        >
          <Formik
            initialValues={{
              requestsFormik: requests.slice(0, pageSize),
              searchDateResponse: searchDateResponse,
              searchVmFqdn: searchVmFqdn,
              searchEmail: searchEmail,
              searchVmIsActiveComment: searchVmIsActiveComment,
              searchVmIsActive: searchVmIsActive,
            }}
            validateOnChange={false}
            validateOnBlur={false}
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
                                    <th style={{width: '10%'}}>Poslužitelj</th>
                                    <th style={{width: '10%'}}>Kontakt email</th>
                                    <th style={{width: '47%'}}>Komentar</th>
                                    <th style={{width: '8%'}}>Potreban</th>
                                    <th style={{width: '5%'}}>Spremi</th>
                                  </tr>
                                </thead>
                                <tbody className="align-middle text-center">
                                  <tr style={{background: "#ECECEC"}}>
                                    <td className="align-middle text-center">
                                      <FontAwesomeIcon icon={faSearch}/>
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
                                        onChange={(e) => (e)}
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
                                        onChange={(e) => (e)}
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
                                      <select
                                        className="custom-select"
                                        value={pageSize}
                                        onChange={e => {
                                          setPageSize(Number(e.target.value))
                                        }}>
                                        <option value='Svi'>Svi</option>
                                        <option value='-'>-</option>
                                        <option value='Da'>Da</option>
                                        <option value='Ne'>Ne</option>
                                      </select>
                                    </td>
                                    <td>
                                      {''}
                                    </td>
                                  </tr>
                                  {
                                    props.values.requestsFormik.map((request, index) =>
                                      <tr key={index}>
                                        <td className="align-middle text-center">
                                          { DateFormatHR(props.values.requestsFormik[index].request_date, true) }
                                        </td>
                                        <td className="align-middle text-center">
                                          { DateFormatHR(props.values.requestsFormik[index].vm_isactive_response, true) }
                                        </td>
                                        <td className="align-middle text-center">
                                          { props.values.requestsFormik[index].vm_fqdn }
                                        </td>
                                        <td className="align-middle text-center">
                                          { props.values.requestsFormik[index].user.email}
                                        </td>
                                        <td className="align-middle text-center">
                                          <Field
                                            className="form-control"
                                            name={`requestsFormik.${index}.vm_isactive_comment`}
                                            as="textarea"
                                            rows={1}
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
