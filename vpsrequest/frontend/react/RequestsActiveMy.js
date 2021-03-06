import {
  BaseView,
  LoadingAnim,
  Status,
  NotifyOk,
  NotifyError,
} from './UIElements';
import NotFound from './NotFound';
import React, { useEffect, useState } from 'react';
import { Backend } from './DataManager';
import {
  Alert,
  Button,
  Row,
  Col,
  Table
} from 'reactstrap';
import './App.css';
import 'react-notifications/lib/notifications.css';
import { Formik, Field, FieldArray, Form } from 'formik';
import { CONFIG } from './Config'
import { DateFormatHR } from './Util'
import Cookies from 'universal-cookie';
import * as yup from 'yup'; // for everything


export const DropDownMyActive = ({field, data=[], ...props}) =>
  <Field component="select"
    name={field.name}
    required={true}
    disabled={props.disabled}
    className={`form-control custom-select text-center
                ${field.value === 'Da' ? 'bg-success border-success text-white' : field.value === 'Ne' ? 'bg-danger border-danger text-white' : ' bg-warning border-warning'}`}
    {...props}
  >
    {
      data.map((name, i) =>
        i === 0 ?
          <option key={i} className="text-muted" hidden>{name}</option> :
          <option key={i} value={name}>{name}</option>
      )
    }
  </Field>


export const emptyIfNullRequestPropery = (data) => {
  var tmp_requests = new Array()

  data.forEach(
    request => {
      var tmp_request = new Object()
      for (var property in request) {
        if (request[property] === null && property === "vm_isactive_response")
          tmp_request[property] = '-'
        else if (request[property] === null)
          tmp_request[property] = ''
        else
          tmp_request[property] = request[property]
      }
      tmp_requests.push(tmp_request)
    }
  )
  return tmp_requests
}


const RequestsActiveSchema = yup.object().shape({
  activeRequests: yup.array()
    .of(
      yup.object().shape({
        vm_isactive: yup.string().required('Obavezno'),
      })
    )
})


const MyRequestsActive = (props) => {
  const location = props.location;
  const backend = new Backend();
  const apiListRequestsActive = `${CONFIG.listReqUrl}/mine_active`
  const [loadingRequests, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState(undefined);
  const [shouldAskVMActive, setShouldAskVMActive] = useState(undefined);
  const [requestsData, setRequests] = useState(undefined);
  const [alertVisible, setAlertVisible] = useState(true);
  var cookie = new Cookies()
  var cookieAlert = cookie.get('alertDismiss')

  const initializeComponent = async () => {
    const session = await backend.isActiveSession();

    if (session.active) {
      const requestData = await backend.fetchData(`${apiListRequestsActive}`);
      setRequests(requestData);
      setUserDetails(session.userdetails);
      setShouldAskVMActive(session.userdetails.vmisactive_shouldask);
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    initializeComponent();
  }, [])

  const handleOnSubmit = async (data) => {
    let response = await backend.changeObject(`${apiListRequestsActive}/`, data);

    if (response.ok)
      NotifyOk({
        msg: 'Statusi poslužitelja podneseni',
        title: `Uspješno - HTTP ${response.status}`});

    else {
      let json = ''
      let errorText = ''
      try {
        json = await response.json()
        if (json['detail'])
          errorText = json['detail']
        else
          errorText = JSON.stringify(json)
      }
      catch (e) {
        errorText = response.statusText
      }
      NotifyError({
        msg: errorText,
        title: `Greška - HTTP ${response.status}`});
    }
  }

  if (loadingRequests)
    return (<LoadingAnim />)

  else if (!loadingRequests && requestsData && userDetails
    && shouldAskVMActive !== undefined) {
    return (
      <BaseView
        title={`Aktivni poslužitelji u ${new Intl.DateTimeFormat('hr-HR', {year: 'numeric'}).format(new Date())}`}
        location={location}
        alert={!cookieAlert && alertVisible && shouldAskVMActive}
        alertdismiss={() => {new Cookies().set('alertDismiss', true); setAlertVisible(false)}}
        alertmsg={`Molimo da se do ${userDetails.vmisactive_responsedate} izjasnite da li su vam u tekućoj godini potrebni izdani poslužitelji. To možete na stavci "Aktivni VM-ovi"`}
      >
        <Formik
          initialValues={{activeRequests: emptyIfNullRequestPropery(requestsData)}}
          validationSchema={RequestsActiveSchema}
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={(values, {setSubmitting} )=> {
            handleOnSubmit(values.activeRequests)
            setSubmitting(false)
          }}
        >
          {props => (
            <Form>
              <FieldArray
                name="activeRequests"
                render={() => (
                  <React.Fragment>
                    <Row>
                      <Table responsive hover size="sm" className={`${shouldAskVMActive && alertVisible ? "mt-1" : "mt-4"}`}>
                        <thead className="table-active align-middle text-center">
                          <tr>
                            <th style={{width: '90px'}}>Status</th>
                            <th style={{width: '180px'}}>Datum podnošenja</th>
                            <th style={{width: '250px'}}>Poslužitelj</th>
                            <th>Komentar (opcionalno)</th>
                            <th style={{width: '90px'}}>
                              Potreban
                              <span className="ml-1 text-danger">
                                *
                              </span>
                            </th>
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
                                <td className="align-middle text-center">
                                  <Field
                                    className="form-control"
                                    name={`activeRequests.${index}.vm_isactive_comment`}
                                    label="Komentar"
                                    aria-label="Komentar"
                                    as="textarea"
                                    spellCheck={false}
                                    disabled={request.approved === 3}
                                    rows={1}
                                  />
                                </td>
                                {
                                  request.approved !== 3 ?
                                    <td className="align-middle text-center">
                                      <Field
                                        name={`activeRequests.${index}.vm_isactive`}
                                        component={DropDownMyActive}
                                        data={['-', 'Da', 'Ne']}
                                      />
                                      {
                                        props.errors && props.errors.activeRequests
                                          && props.errors.activeRequests[index] ?
                                            <span className="text-danger" style={{fontSize: 'small'}}>
                                              {props.errors.activeRequests[index].vm_isactive}
                                            </span >
                                          : null
                                      }
                                    </td>
                                  :
                                    <td className="align-middle text-center">
                                      <div className="p-2 text-white bg-danger rounded">
                                        { request.vm_isactive }
                                      </div>
                                    </td>
                                }
                              </tr>)
                          }
                        </tbody>
                      </Table>
                    </Row>
                    <Row className="mt-2 mb-2 text-center">
                      <Col>
                        <Button disabled={!userDetails.vmisactive_responsedate_expired} className="btn-lg" color="success" id="submit-button" type="submit">Spremi</Button>
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
