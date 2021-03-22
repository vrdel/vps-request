import React, { useState } from 'react';
import { Backend } from './DataManager';
import {
  BaseView,
  LoadingAnim,
  NotifyOk,
  NotifyError,
} from './UIElements.js';
import { Formik, Form } from 'formik';
import './Request.css';
import {
  ContactUserFields,
  VMFields,
  SysAdminFields,
  HeadFields,
  SubmitNewRequest
} from './RequestElements.js';
import { CONFIG } from './Config'
import { useQuery } from 'react-query';
import Cookies from 'universal-cookie';

const NewRequest = (props) => {
  const history = props.history;
  const backend = new Backend();
  const apiListVMOSes = CONFIG.vmosUrl;
  const apiListRequests = CONFIG.listReqUrl;
  const [acceptConditions, setAcceptConditions] = useState(false);
  const [acceptConditionsAlert, setAcceptConditionsAlert] = useState(false);
  const [alertVisible, setAlertVisible] = useState(true)
  var cookie = new Cookies()
  var cookieAlert = cookie.get('alertDismiss')

  const { data: userDetails, error: errorUserDetails, isLoading: loadingUserDetails } = useQuery(
    `session-userdetails`, async () => {
      const sessionActive = await backend.isActiveSession()
      if (sessionActive.active) {
        return sessionActive.userdetails
      }
    }
  );

  const { data: listVMOSes, error: errorVMOSes, isLoading: loadingVMOSes} = useQuery(
    `novi-zahtjev`, async () => {
      const fetched = await backend.fetchData(apiListVMOSes)
      return fetched.map(e => e.vm_os)
    },
    {
      enabled: userDetails
    }
  );

  const dismissAlert = () => {
    setAcceptConditionsAlert(false);
  }

  const handleAcceptConditions = () => {
    setAcceptConditions(!acceptConditions);
  }

  const handleOnSubmit = async (data) => {
    const response = await backend.addObject(apiListRequests, data)

    if (response.ok)
      NotifyOk({
        msg: 'Zahtjev uspješno podnesen',
        title: `Uspješno - HTTP ${response.status}`,
        callback: () => history.push('/ui/stanje-zahtjeva')}
      )
    else
      NotifyError({
        msg: response.statusText,
        title: `Greška - HTTP ${response.status}`})
  }

  if (userDetails)
    var initValues = {
      location: '',
      first_name: userDetails.first_name,
      last_name: userDetails.last_name,
      institution: userDetails.institution,
      role: userDetails.role,
      email: userDetails.email,
      aaieduhr: userDetails.aaieduhr,
      vm_fqdn: '',
      vm_purpose: '',
      vm_remark:  '',
      vm_os: '',
      sys_firstname: '',
      sys_aaieduhr: '',
      sys_lastname: '',
      sys_institution: '',
      sys_role: '',
      sys_email: '',
      head_firstname: '',
      head_lastname: '',
      head_institution: userDetails.institution,
      head_role: '',
      head_email: ''
    }

  if (loadingUserDetails || loadingVMOSes)
    return (<LoadingAnim />)

  else if (!loadingVMOSes && listVMOSes && initValues &&
    acceptConditions !== undefined) {
    return (
      <BaseView
        title='Novi zahtjev'
        isChangeView={false}
        alert={!cookieAlert && alertVisible && userDetails.vmisactive_shouldask}
        alertdismiss={() => { cookie.set('alertDismiss', true); setAlertVisible(false)}}
        alertmsg={`Molimo da se do ${userDetails.vmisactive_responsedate} izjasnite da li su vam u tekućoj godini potrebni izdani poslužitelji. To možete na stavci "Aktivni VM-ovi"`}
      >
        <Formik
          initialValues={initValues}
          onSubmit={(values, actions) => {
            values.request_date = new Date().toISOString()
            values.user = userDetails.pk
            values.approved = -1
            values.vm_isactive = 5

            if (!acceptConditions)
              setAcceptConditionsAlert(true)
            else
              handleOnSubmit(values)
          }}
        >
          {props => (
            <Form>
              <ContactUserFields />
              <VMFields listVMOSes={listVMOSes}/>
              <SysAdminFields/>
              <HeadFields/>
              <SubmitNewRequest
                acceptConditions={acceptConditions}
                handleAcceptConditions={handleAcceptConditions}
                dismissAlert={dismissAlert}
                stateAcceptConditionsAlert={acceptConditionsAlert}/>
            </Form>
          )}
        </Formik>
      </BaseView>
    )
  }

  else
    return null
}

export default NewRequest;
