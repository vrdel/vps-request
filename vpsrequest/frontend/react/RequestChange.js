import React, { useEffect, useState } from 'react';
import {
  BaseView,
  LoadingAnim,
  NotifyOk,
  NotifyError,
} from './UIElements.js';
import { Formik, Form } from 'formik';
import { Backend } from './DataManager';
import {
  ContactUserFields,
  HeadFields,
  RequestDateField,
  StateFields,
  SubmitChangeRequest,
  SysAdminFields,
  VMFields,
} from './RequestElements.js';
import { CONFIG } from './Config'
import { DateFormatHR, EmptyIfNull } from './Util';


const ChangeRequest = (props) => {
  const {params} = props.match
  const requestID = params.id
  const apiListVMOSes = CONFIG.vmosUrl
  const apiListRequests = CONFIG.listReqUrl
  const backend = new Backend()
  const [loading, setLoading] = useState(false);
  const [listVMOSes, setListVMOSes] = useState([]);
  const [requestDetails, setRequestDetails] = useState(undefined);
  const [userDetails, setUserDetails] = useState(null);

  const isRequestApproved = (value) => {
    return value === 1 ? true : false
  }

  const initializeComponent = async () => {
    const session = await backend.isActiveSession()

    if (session.active) {
      const vmOSes = await backend.fetchData(apiListVMOSes)
      const requestData = await backend.fetchData(`${apiListRequests}/${requestID}`)

      setListVMOSes(vmOSes.map(e => e.vm_os))
      setUserDetails(session.userdetails)
      setRequestDetails(requestData)
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true);
    initializeComponent()
  }, [])

  const handleOnSubmit = async (data) => {
    let response = await backend.changeObject(`${apiListRequests}/${requestID}/`, data)

    if (response.ok)
      NotifyOk({
        msg: 'Zahtjev uspješno promijenjen',
        title: `Uspješno - HTTP ${response.status}`})
    else
      NotifyError({
        msg: response.statusText,
        title: `Greška - HTTP ${response.status}`})
  }

  if (userDetails && requestDetails)
    var initValues = {
      location: '',
      first_name: userDetails.first_name,
      last_name: userDetails.last_name,
      institution: userDetails.institution,
      role: userDetails.role,
      email: userDetails.email,
      aaieduhr: userDetails.aaieduhr,
      approvedby: EmptyIfNull(requestDetails.approvedby),
      vm_fqdn: requestDetails.vm_fqdn,
      vm_purpose: requestDetails.vm_purpose,
      vm_admin_remark: EmptyIfNull(requestDetails.vm_admin_remark),
      vm_reason: EmptyIfNull(requestDetails.vm_reason),
      vm_remark: requestDetails.vm_remark,
      vm_os: requestDetails.vm_os,
      vm_ip: EmptyIfNull(requestDetails.vm_ip),
      approved: requestDetails.approved,
      sys_firstname: requestDetails.sys_firstname,
      sys_aaieduhr: requestDetails.sys_aaieduhr,
      sys_lastname: requestDetails.sys_lastname,
      sys_institution: requestDetails.sys_institution,
      sys_role: requestDetails.sys_role,
      sys_email: requestDetails.sys_email,
      head_firstname: requestDetails.head_firstname,
      head_lastname: requestDetails.head_lastname,
      head_institution: requestDetails.head_institution,
      head_role: requestDetails.head_role,
      head_email: requestDetails.head_email,
      request_date: DateFormatHR(requestDetails.request_date),
      timestamp: DateFormatHR(requestDetails.timestamp ?
        requestDetails.timestamp : requestDetails.request_date)
    }

  if (loading)
    return (<LoadingAnim />)

  else if (!loading && listVMOSes && initValues) {
    return (
      <BaseView
        title='Promijeni zahtjev'
        isChangeView={true}>
        <Formik
          initialValues={initValues}
          onSubmit={(values, actions) => {
            values.timestamp = new Date().toISOString()
            values.request_date = requestDetails.request_date
            handleOnSubmit(values)
          }}
          render = {props => (
            <Form>
              <RequestDateField/>
              <ContactUserFields/>
              <VMFields listVMOSes={listVMOSes}/>
              <SysAdminFields/>
              <HeadFields/>
              <StateFields readOnly={true} requestApproved={requestDetails.approved}/>
              <SubmitChangeRequest buttonLabel='Promijeni zahtjev'
                disabled={requestDetails.approved === 1 || requestDetails.approved === 2}/>
            </Form>
          )}
        />
      </BaseView>
    )
  }

  else
    return null
}

export default ChangeRequest;
