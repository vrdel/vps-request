import React, { useEffect, useState } from 'react';
import { Formik, Form } from 'formik';
import { DateFormatHR, EmptyIfNull } from './Util';
import { Backend } from './DataManager';
import { CONFIG } from './Config'
import {
  BaseView,
  LoadingAnim,
  NotifyOk,
  NotifyError,
} from './UIElements.js';
import {
  ContactUserFields,
  HeadFields,
  ProcessFields,
  RequestDateField,
  SubmitChangeRequest,
  SysAdminFields,
  VMFields,
} from './RequestElements.js';
import { canApprove } from './Util';


export const ProcessNewRequest = (props) => {
  const backend = new Backend();
  const apiListRequests = CONFIG.listReqUrl
  const history = props.history
  let {params} = props.match
  const requestID = params.id
  const [loading, setLoading] = useState(false);
  const [areYouSureModal, setAreYouSureModal] = useState(false)
  const [modalTitle, setModalTitle] = useState(undefined)
  const [modalMsg, setModalMsg] = useState(undefined)
  const [onYes, setOnYes] = useState('')
  const [requestApproved, setRequestApproved] = useState(undefined);
  const [requestDetails, setRequestDetails] = useState(undefined);
  const [userDetails, setUserDetails] = useState(undefined);
  const [sendMsgHead, setSendMsgHead] = useState(false);
  const [sendMsgContact, setSendMsgContact] = useState(false)

  const initializeComponent = async () => {
    const session = await backend.isActiveSession()

    if (session.active) {
      const requestData = await backend.fetchData(`${apiListRequests}/${requestID}/handlenew/`)

      setLoading(false);
      setRequestApproved(requestData.approved)
      setRequestDetails(requestData)
      setUserDetails(session.userdetails)
    }
  }

  useEffect(() => {
    setLoading(true);
    initializeComponent();
  }, [])

  const handleOnSubmit = async (data) => {
    const response = await backend.changeObject(`${apiListRequests}/${requestID}/`, data)

    if (response.ok)
      NotifyOk({
        msg: 'Zahtjev uspješno promijenjen',
        title: `Uspješno - HTTP ${response.status}`})
    else
      NotifyError({
        msg: response.statusText,
        title: `Greška - HTTP ${response.status}`})
  }

  const handleRequestState = (value) => {
    setRequestApproved(value)
  }

  const handleMsgHead = () => {
    setSendMsgHead(!sendMsgHead)
  }

  const handleMsgContact = () => {
    setSendMsgContact(!sendMsgContact)
  }

  const doDelete = async () => {
    const response = await backend.deleteObject(`${apiListRequests}/${requestID}/`)

    if (response.ok)
      NotifyOk({
        msg: 'Zahtjev uspješno izbrisan',
        title: `Uspješno - HTTP ${response.status}`,
        callback: () => history.push('/ui/novi-zahtjevi')
      })
    else
      NotifyError({
        msg: response.statusText,
        title: `Greška - HTTP ${response.status}`})
  }

  const onYesCallback = () => {
    if (onYes === 'delete')
      doDelete()
  }

  if (userDetails && requestDetails && requestApproved !== undefined)
    var initValues = {
      location: '',
      first_name: requestDetails.user.first_name,
      last_name: requestDetails.user.last_name,
      institution: requestDetails.user.institution,
      role: requestDetails.user.role,
      email: requestDetails.user.email,
      aaieduhr: requestDetails.user.aaieduhr,
      approvedby: requestDetails.approvedby,
      vm_fqdn: EmptyIfNull(requestDetails.vm_fqdn),
      vm_purpose: EmptyIfNull(requestDetails.vm_purpose),
      vm_admin_remark: EmptyIfNull(requestDetails.vm_admin_remark),
      vm_reason: EmptyIfNull(requestDetails.vm_reason),
      vm_remark: EmptyIfNull(requestDetails.vm_remark),
      vm_os: requestDetails.vm_os,
      vm_ip: requestDetails.vm_ip,
      approved: requestApproved,
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
      timestamp: DateFormatHR(requestDetails.timestamp)
    }

  if (loading)
    return (<LoadingAnim />)

  else if (!loading && initValues) {
    let modalHandle = new Object({
      areYouSureModal,
      'modalFunc': onYesCallback,
      modalTitle,
      modalMsg,
      setAreYouSureModal,
      setModalTitle,
      setModalMsg,
      setOnYes
    })

    return (
      <BaseView
        title='Obradi zahtjev'
        modal={true}
        toggle={() => setAreYouSureModal(!areYouSureModal)}
        state={modalHandle}
        isHandleNewView={true}>
        <Formik
          initialValues={initValues}
          onSubmit={(values, actions) => {
            values.approved_date = new Date().toISOString()
            values.timestamp = new Date().toISOString()
            values.request_date = requestDetails.request_date
            values.approved = requestApproved
            values.approvedby = `${userDetails.first_name} ${userDetails.last_name}`
            values.sendMsgHead = sendMsgHead
            values.sendMsgContact = sendMsgContact
            handleOnSubmit(values)
          }}
        >
          {props => (
            <Form>
              <RequestDateField date={props.values.request_date} deleteRequest={true} modalHandle={modalHandle}/>
              <ContactUserFields/>
              <VMFields listVMOSes={[requestDetails.vm_os]} disabled={true}/>
              <SysAdminFields disabled={true}/>
              <HeadFields disabled={true}/>
              <ProcessFields approved={requestApproved}
                handleState={handleRequestState}
                handleMsgContact={handleMsgContact}
                handleMsgHead={handleMsgHead}
                stateMsgHead={sendMsgHead}
                stateMsgContact={sendMsgContact}
                canApproveRequest={canApprove(userDetails)}
              />
              <SubmitChangeRequest buttonLabel='Spremi promjene'
                disabled={!canApprove(userDetails)}/>
            </Form>
          )}
        </Formik>
      </BaseView>
    )
  }

  else
    return null
}
