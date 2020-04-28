import React, { Component } from 'react';
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


export class ChangeRequest extends Component
{
  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      listVMOSes: [],
      requestDetails: undefined,
      userDetail: undefined,
    }

    let {params} = this.props.match
    this.requestID = params.id

    this.apiListVMOSes = CONFIG.vmosUrl
    this.apiListRequests = CONFIG.listReqUrl

    this.backend = new Backend()
    this.handleOnSubmit = this.handleOnSubmit.bind(this)
    this.initializeComponent = this.initializeComponent.bind(this)
  }

  isRequestApproved(value) {
    return value === 1 ? true : false
  }

  async initializeComponent() {
    const session = await this.backend.isActiveSession()

    if (session.active) {
      const vmOSes = await this.backend.fetchData(this.apiListVMOSes)
      const requestData = await this.backend.fetchData(`${this.apiListRequests}/${this.requestID}`)

      this.setState({
        listVMOSes: vmOSes.map(e => e.vm_os),
        userDetails: session.userdetails,
        requestDetails: requestData,
        loading: false
      })
    }
  }

  componentDidMount() {
    this.setState({loading: true})
    this.initializeComponent()
  }

  async handleOnSubmit(data) {
    let response = await this.backend.changeObject(`${this.apiListRequests}/${this.requestID}/`, data)

    if (response.ok)
      NotifyOk({
        msg: 'Zahtjev uspješno promijenjen',
        title: `Uspješno - HTTP ${response.status}`})
    else
      NotifyError({
        msg: response.statusText,
        title: `Greška - HTTP ${response.status}`})
  }

  render() {
    const {loading, listVMOSes, userDetails, requestDetails} = this.state

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
        vm_host:  EmptyIfNull(requestDetails.vm_host),
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
              this.handleOnSubmit(values)
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
}
