import {
  BaseView,
  DropDown,
  LoadingAnim,
  Status,
  NotifyOk,
  NotifyError,
} from './UIElements';
import NotFound from './NotFound';
import React from 'react';
import { Backend } from './DataManager';
import {
  Button,
  Row,
  Col,
  Table
} from 'reactstrap';
import './App.css';
import 'react-notifications/lib/notifications.css';
import { Formik, Field, FieldArray, Form } from 'formik';
import { CONFIG } from './Config'
import { useQuery } from 'react-query';
import { DateFormatHR } from './Util'

const MyRequestsActive = (props) => {
  const location = props.location;
  const backend = new Backend();
  const apiListRequestsActive = `${CONFIG.listReqUrl}/mine_active`

  const { data: userDetails, error: errorUserDetails, isLoading: loadingUserDetails } = useQuery(
    `session-userdetails`, async () => {
      const sessionActive = await backend.isActiveSession()
      if (sessionActive.active) {
        return sessionActive.userdetails
      }
    }
  );

  const { data: requests, error: errorRequest, isLoading: loadingRequests } = useQuery(
    `aktivni-vmovi-requests`, async () => {
      const fetched = await backend.fetchData(apiListRequestsActive)
      return fetched
    },
    {
      enabled: userDetails
    }
  );

  function emptyIfNullRequestPropery(data) {
    var tmp_requests = new Array()

    data.forEach(
      request => {
        var tmp_request = new Object()
        for (var property in request) {
          if (request[property] === null )
            tmp_request[property] = ''
          else
            tmp_request[property] = request[property]
        }
        tmp_requests.push(tmp_request)
      }
    )
    return tmp_requests
  }

  const handleOnSubmit = async (data) => {
    let response = await backend.changeObject(`${apiListRequestsActive}/`, data);

    if (response.ok)
      NotifyOk({
        msg: 'Statusi poslužitelja podneseni',
        title: `Uspješno - HTTP ${response.status}`});
    else
      NotifyError({
        msg: response.statusText,
        title: `Greška - HTTP ${response.status}`});
  }

  if (loadingRequests || loadingUserDetails)
    return (<LoadingAnim />)

  else if (!loadingRequests && requests) {
    return (
      <BaseView
        title='Aktivni poslužitelji'
        location={location}>
        <Formik
          initialValues={{activeRequests: emptyIfNullRequestPropery(requests)}}
          onSubmit={({activeRequests})=> {
            activeRequests.forEach(request => (
              request.vm_isactive = CONFIG['statusVMIsActive'][request.vm_isactive]
            ))
            handleOnSubmit(activeRequests)
          }}
        >
          {props => (
            <Form>
              <FieldArray
                name="activeRequests"
                render={() => (
                  <React.Fragment>
                    <Row>
                      <Table responsive hover size="sm" className="mt-4">
                        <thead className="table-active align-middle text-center">
                          <tr>
                            <th style={{width: '90px'}}>Status</th>
                            <th style={{width: '180px'}}>Datum podnošenja</th>
                            <th style={{width: '250px'}}>Poslužitelj</th>
                            <th style={{width: '140px'}}>Potreban u {new Date().getFullYear()}.</th>
                            <th>Komentar</th>
                          </tr>
                        </thead>
                        <tbody className="align-middle text-center">
                          {
                            props.values.activeRequests.map((request, index) =>
                              <tr key={index}>
                                <td className="align-middle text-center">
                                  <Status params={CONFIG['status'][request.approved]} renderToolTip={true}/>
                                </td>
                                <td className="align-middle text-center">
                                  { DateFormatHR(request.request_date) }
                                </td>
                                <td className="align-middle text-center">
                                  { request.vm_fqdn }
                                </td>
                                <td  className="align-middle text-center">
                                  <Field
                                    name={`activeRequests.${index}.vm_isactive`}
                                    component={DropDown}
                                    data={['Odaberi', 'DA', 'NE']}
                                    customclassname="text-center"
                                  />
                                </td>
                                <td className="align-middle text-center">
                                  <Field
                                    className="form-control"
                                    name={`activeRequests.${index}.vm_isactive_comment`}
                                    as="textarea"
                                    rows={1}
                                  />
                                </td>
                              </tr>)
                          }
                        </tbody>
                      </Table>
                    </Row>
                    <Row className="mt-2 mb-2 text-center">
                      <Col>
                        <Button className="btn-lg" color="success" id="submit-button" type="submit">Spremi</Button>
                      </Col>
                    </Row>
                  </React.Fragment>
                )}
              />
            </Form>
          )}
        </Formik>
      </BaseView>
    )
  }
  else
    return null
}

export default MyRequestsActive;
