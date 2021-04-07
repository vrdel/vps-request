import React, { useState, useEffect } from 'react';
import {Backend} from './DataManager';
import {
  BaseView,
  LoadingAnim,
  RequestHorizontalRule,
  NotifyError,
  NotifyOk,
} from './UIElements';
import { Formik, Form } from 'formik';
import {
  ContactUserFields,
  HeadFields,
  RequestDateField,
  StateFields,
  SubmitChangeRequest,
  SysAdminFields,
  VMFields,
} from './RequestElements'
import { CONFIG } from './Config'
import {
  Col,
  Row,
  Button
} from 'reactstrap';
import { DateFormatHR, EmptyIfNull } from './Util';


export const ApprovedRequestHandler = (props) => {
  const {params} = props.match
  const requestID = params.id
  const history = props.history
  const apiListRequests = CONFIG.listReqUrl
  const backend = new Backend()
  const [loading, setLoading] = useState(false)
  const [areYouSureModal, setAreYouSureModal] = useState(false)
  const [modalTitle, setModalTitle] = useState(undefined)
  const [modalMsg, setModalMsg] = useState(undefined)
  const [onYes, setOnYes] = useState('')
  const [requestDetails, setRequestDetails] = useState(undefined);
  const [userDetails, setUserDetails] = useState(undefined);
  const [listVMOSes, setListVMOSes] = useState(undefined);
  // TODO: refactor with formik 2
  const [formikValues, setFormikValues] = useState({})


  const initializeComponent = async () => {
    const session = await backend.isActiveSession()

    if (session.active) {
      const requestData = await backend.fetchData(`${apiListRequests}/${requestID}/handlenew/`)
      const vmOSes = await backend.fetchData(CONFIG.vmosUrl)

      setRequestDetails(requestData);
      setListVMOSes(vmOSes.map(e => e.vm_os));
      setUserDetails(session.userdetails)
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    initializeComponent();
  }, [])

  const handleOnSubmit = async (data, callback=undefined) => {
    let response = await backend.changeObject(`${apiListRequests}/${requestID}/`, data)

    if (response.ok)
      NotifyOk({
        msg: 'Zahtjev uspješno promijenjen',
        title: `Uspješno - HTTP ${response.status}`,
        callback: callback})
    else
      NotifyError({
        msg: response.statusText,
        title: `Greška - HTTP ${response.status}`})
  }

  const doDelete = async () => {
    const response = await backend.deleteObject(`${apiListRequests}/${requestID}/`)

    if (response.ok)
      NotifyOk({
        msg: 'Zahtjev uspješno izbrisan',
        title: `Uspješno - HTTP ${response.status}`,
        callback: () => history.push('/ui/odobreni-zahtjevi')
      })
    else
      NotifyError({
        msg: response.statusText,
        title: `Greška - HTTP ${response.status}`})
  }

  const onYesCallback = () => {
    let callback = undefined

    formikValues.timestamp = new Date().toISOString()
    formikValues.request_date = requestDetails.request_date

    if (onYes === 'aaireassign') {
      formikValues.changedContact = formikValues.aaieduhr
      callback = () => history.push('/ui/odobreni-zahtjevi')
      handleOnSubmit(formikValues, callback);
    }
    else if (onYes === 'retire') {
      formikValues.approved = 3
      formikValues.vm_dismissed = formikValues.timestamp
      callback = () => history.push('/ui/odobreni-zahtjevi')
      handleOnSubmit(formikValues, callback);
    }
    else if (onYes === 'delete')
      doDelete()
  }

  if (userDetails && requestDetails)
    var initValues = {
      location: '',
      first_name: requestDetails.user.first_name,
      last_name: requestDetails.user.last_name,
      institution: requestDetails.user.institution,
      role: requestDetails.user.role,
      email: requestDetails.user.email,
      aaieduhr: EmptyIfNull(requestDetails.user.aaieduhr),
      approvedby: requestDetails.approvedby,
      vm_fqdn: requestDetails.vm_fqdn,
      vm_purpose: requestDetails.vm_purpose,
      vm_admin_remark: requestDetails.vm_admin_remark,
      vm_reason: requestDetails.vm_reason,
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
      timestamp: DateFormatHR(requestDetails.timestamp)
    }

  if (loading)
    return (<LoadingAnim />)

  else if (!loading && listVMOSes && initValues) {
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
        state={{areYouSureModal, 'modalFunc': onYesCallback, modalTitle, modalMsg}}
        isHandleApprovedView={initValues.approved === 1}
        isIssuedVMView={initValues.approved !== 1}>
        <Formik
          initialValues={initValues}
          onSubmit={(values, actions) => {
            // this one is called on "Izdaj VM"
            let wasApproved = values.approved
            let callback = undefined

            values.approved = 2
            values.vm_isactive = 5
            values.timestamp = new Date().toISOString()
            values.request_date = requestDetails.request_date

            if (values.approved !== wasApproved) {
              callback = () => history.push('/ui/odobreni-zahtjevi')
            }

            handleOnSubmit(values, callback)
          }}
        >
          {props => (
            <Form>
              <RequestDateField date={props.values.request_date} deleteRequest={true} modalHandle={modalHandle}/>
              {
                initValues.approved === 2 ?
                  <ContactUserFields disabled={false}/>
                :
                  <ContactUserFields disabled={true}/>
              }
              <VMFields listVMOSes={listVMOSes}/>
              <SysAdminFields/>
              {
                initValues.approved === 2 ?
                  <HeadFields disabled={false} institutionDisabled={false}/>
                :
                  <HeadFields disabled={true} institutionDisabled={true}/>
              }
              <StateFields readOnly={false} requestApproved={initValues.approved}/>
              {
                initValues.approved === 1 ?
                  <SubmitChangeRequest buttonLabel='Izdaj VM'/>
                :
                initValues.approved === 2 ?
                  <React.Fragment>
                    <RequestHorizontalRule/>
                    <Row className="mt-2 mb-4">
                      <Col md={{offset: 4}}>
                        <Button className="btn-lg" color="success"
                          id="button-save" type="button"
                          onClick={() => {
                            if (initValues.aaieduhr !== props.values.aaieduhr) {
                              setAreYouSureModal(!areYouSureModal);
                              setModalTitle("Dodjeljivanje drugom korisniku");
                              setModalMsg("Da li se sigurni da želite zahtjev dodijeliti drugom korisniku?");
                              setOnYes('aaireassign')
                              setFormikValues(props.values)
                            }
                            else {
                              props.values.approved = 2
                              props.values.timestamp = new Date().toISOString()
                              props.values.request_date = requestDetails.request_date
                              handleOnSubmit(props.values, undefined)
                            }
                          }}>
                            Spremi promjene
                        </Button>
                      </Col>
                      <Col>
                        <Button className="btn-lg" color="secondary"
                          id="button-retire" type="button"
                          onClick={() => {
                            setAreYouSureModal(!areYouSureModal);
                            setModalTitle("Mirovina");
                            setModalMsg("Želite li umiroviti server (naknadne promjene nisu više moguće)?");
                            setOnYes('retire')
                            setFormikValues(props.values)
                          }}>
                          Umirovi
                        </Button>
                      </Col>
                    </Row>
                  </React.Fragment>
                :
                  null
              }
            </Form>
          )}
        </Formik>
      </BaseView>
    )
  }

  else
    return null
}
