import React, { useMemo, useState } from 'react';
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
  faSave,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Formik, Field, FieldArray, Form } from 'formik';
import { BaseView, LoadingAnim } from './UIElements';
import { CONFIG } from './Config'
import { DateFormatHR } from './Util'
import { useQuery } from 'react-query';
import { DropDownMyActive, emptyIfNullRequestPropery } from './RequestsActiveMy';


const RetireRequests = (props) => {
  const location = props.location;
  const backend = new Backend();
  const apiListRequests = `${CONFIG.listReqUrl}/vmissued_unknown`
  const [pageSize, setPageSize] = useState(100)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageCount, setPageCount] = useState(undefined)


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
      setPageCount(Math.trunc(fetched.length / pageSize))
      return emptyIfNullRequestPropery(fetched)
    },
    {
      enabled: userDetails
    }
  );

  const handleOnSubmit = async (data) => {
    console.log(data)
  }

  const gotoPage = (i, formikSetValues) => {
    let index = i + 1
    let indexTo = undefined
    let indexFrom = undefined

    if (index === 1)
      indexFrom = 0
    else
      indexFrom = index * pageSize
    indexTo = indexFrom + pageSize

    formikSetValues({requestsFormik: requests.slice(indexFrom, indexTo)})
    setPageIndex(i)
  }


  if (loadingRequests || loadingUserDetails)
    return (<LoadingAnim />)


  else if (!loadingRequests && requests) {
    return (
      <>
        <BaseView
          title='Pred umirovljenje 2021.'
          location={location}
        >
          <Formik
            initialValues={{requestsFormik: requests}}
            validateOnChange={false}
            validateOnBlur={false}
            onSubmit={(values, {setSubmitting} )=> {
              handleOnSubmit(values.requestsFormik)
              setSubmitting(false)
            }}
          >
            {props => (
              <>
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
                </Pagination>
                <Form>
                  <FieldArray
                      name="requestsFormik"
                      render={() => (
                        <React.Fragment>
                          <Table responsive hover size="sm" className="mt-4">
                            <thead className="table-active align-middle text-center">
                              <tr>
                                <th style={{width: '5%'}}>r. br.</th>
                                <th style={{width: '10%'}}>Datum podnošenja</th>
                                <th style={{width: '5%'}}>Poslužitelj</th>
                                <th style={{width: '10%'}}>Kontaktni email</th>
                                <th style={{width: '50%'}}>Komentar</th>
                                <th style={{width: '5%'}}>Potreban u {new Date().getFullYear()}.</th>
                                <th style={{width: '5%%'}}>Spremi</th>
                              </tr>
                            </thead>
                            <tbody className="align-middle text-center">
                              {
                                props.values.requestsFormik.map((request, index) =>
                                  <tr key={index}>
                                    <td className="align-middle text-center">
                                      { requests.length - index}
                                    </td>
                                    <td className="align-middle text-center">
                                      { DateFormatHR(props.values.requestsFormik[index].request_date, true) }
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
                                        data={['--', 'Da', 'Ne']}
                                      />
                                    </td>
                                    <td className="align-middle text-center">

                                      <Button className="btn" color="success" id="submit-button" type="submit"> <FontAwesomeIcon icon={faSave}/></Button>
                                    </td>
                                  </tr>)
                              }
                            </tbody>
                          </Table>
                        </React.Fragment>
                      )}
                    />
                </Form>
              </>
            )}
          </Formik>
        </BaseView>
      </>
    )
  }

  else
    return null

}

export default RetireRequests;
