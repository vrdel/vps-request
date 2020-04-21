import React, { Component } from 'react';
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


export class ProcessNewRequest extends Component
{
  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      listVMOSes: [],
      requestDetails: undefined,
      requestApproved: undefined,
      userDetail: undefined,
      sendMsgHead: false,
      sendMsgContact: false,
    }

    let {params} = this.props.match
    this.requestID = params.id

    this.apiListRequests = CONFIG.listReqUrl

    this.backend = new Backend()
    this.handleOnSubmit = this.handleOnSubmit.bind(this)
    this.initializeComponent = this.initializeComponent.bind(this)
    this.handleRequestState = this.handleRequestState.bind(this)
    this.handleMsgHead = this.handleMsgHead.bind(this)
    this.handleMsgContact = this.handleMsgContact.bind(this)
  }

  async initializeComponent() {
    const session = await this.backend.isActiveSession()

    if (session.active) {
      const requestData = await this.backend.fetchData(`${this.apiListRequests}/${this.requestID}/handlenew/`)

      this.setState({
        userDetails: session.userdetails,
        requestDetails: requestData,
        requestApproved: requestData.approved,
        loading: false
      })
    }
  }

  componentDidMount() {
    this.setState({loading: true})
    this.initializeComponent()
  }

  async handleOnSubmit(data) {
    const response = await this.backend.changeObject(`${this.apiListRequests}/${this.requestID}/`, data)

    if (response.ok)
      NotifyOk({
        msg: 'Zahtjev uspješno promijenjen',
        title: `Uspješno - HTTP ${response.status}`})
    else
      NotifyError({
        msg: response.statusText,
        title: `Greška - HTTP ${response.status}`})
  }

  handleRequestState(value) {
    this.setState({requestApproved: value})
  }

  handleMsgHead() {
    this.setState(prevState => ({
      sendMsgHead: !prevState.sendMsgHead
    }))
  }

  handleMsgContact() {
    this.setState(prevState => ({
      sendMsgContact: !prevState.sendMsgContact
    }))
  }

  render() {
    const {loading, listVMOSes, userDetails, requestApproved, requestDetails,
      sendMsgHead, sendMsgContact} = this.state

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

    else if (!loading && listVMOSes && initValues) {
      return (
        <BaseView
          title='Obradi zahtjev'
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
              this.handleOnSubmit(values)
            }}
            render = {props => (
              <Form>
                <RequestDateField/>
                <ContactUserFields/>
                <VMFields listVMOSes={[requestDetails.vm_os]}/>
                <SysAdminFields/>
                <HeadFields/>
                <ProcessFields approved={requestApproved}
                  handleState={this.handleRequestState}
                  handleMsgContact={this.handleMsgContact}
                  handleMsgHead={this.handleMsgHead}
                  stateMsgHead={sendMsgHead}
                  stateMsgContact={sendMsgContact}
                />
                <SubmitChangeRequest buttonLabel='Spremi promjene'/>
              </Form>
            )}
          />
        </BaseView>
      )
    }

    else
      return null
  }
}
