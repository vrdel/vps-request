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
import { useTable, usePagination } from 'react-table';
import { CONFIG } from './Config'
import { DateFormatHR } from './Util'
import { useQuery } from 'react-query';
import { DropDownMyActive, emptyIfNullRequestPropery } from './RequestsActiveMy';


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
      return emptyIfNullRequestPropery(fetched)
    },
    {
      enabled: userDetails
    }
  );


  const handleOnSubmit = async (data) => {
    console.log(data)
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
                <Button
                  className="btn"
                  color="success" id="page1"
                  onClick={() => props.setValues({requestsFormik: requests.slice(1, 10)})}>
                  <FontAwesomeIcon icon={faSave}/>
                </Button>
                <Button
                  className="btn"
                  color="success" id="page1"
                  onClick={() => props.setValues({requestsFormik: requests.slice(11, 20)})}>
                  <FontAwesomeIcon icon={faSave}/>
                </Button>
                <Button
                  className="btn"
                  color="success" id="page1"
                  onClick={() => props.setValues({requestsFormik: requests.slice(21, 30)})}>
                  <FontAwesomeIcon icon={faSave}/>
                </Button>
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
                                      { props.values.requestsFormik.length - index }
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
