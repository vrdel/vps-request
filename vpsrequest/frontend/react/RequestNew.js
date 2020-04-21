import React, { Component } from 'react';
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


export class NewRequest extends Component
{
  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      listVMOSes: [],
      acceptConditions: undefined,
      acceptConditionsAlert: false,
      userDetail: undefined,
    }

    this.apiListVMOSes = '/api/v1/internal/vmos/'
    this.apiListRequests = '/api/v1/internal/requests/'

    this.backend = new Backend()
    this.handleAcceptConditions = this.handleAcceptConditions.bind(this)
    this.handleOnSubmit = this.handleOnSubmit.bind(this)
    this.dismissAlert = this.dismissAlert.bind(this)
    this.initializeComponent = this.initializeComponent.bind(this)
  }

  async initializeComponent() {
    const session = await this.backend.isActiveSession()

    if (session.active) {
      const vmOSes = await this.backend.fetchData(this.apiListVMOSes)

      this.setState({
        listVMOSes: vmOSes.map(e => e.vm_os),
        acceptConditions: false,
        userDetails: session.userdetails,
        loading: false
      })
    }
  }

  componentDidMount() {
    this.setState({loading: true})
    this.initializeComponent()
  }

  dismissAlert() {
    this.setState({acceptConditionsAlert: false})
  }

  handleAcceptConditions() {
    this.setState(prevState => ({acceptConditions: !prevState.acceptConditions}))
  }

  handleOnSubmit(data) {
    this.backend.addObject(this.apiListRequests, data)
      .then(response => {
        response.ok
          ? NotifyOk({
              msg: 'Zahtjev uspješno podnesen',
              title: `Uspješno - HTTP ${response.status}`})
          : NotifyError({
              msg: response.statusText,
              title: `Greška - HTTP ${response.status}`})
      })
  }

  render() {
    const {loading, listVMOSes, userDetails, acceptConditions} = this.state

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

    if (loading)
      return (<LoadingAnim />)

    else if (!loading && listVMOSes && initValues &&
      acceptConditions !== undefined) {
      return (
        <BaseView
          title='Novi zahtjev'
          isChangeView={false}>
          <Formik
            initialValues={initValues}
            onSubmit={(values, actions) => {
              values.request_date = new Date().toISOString()
              values.user = userDetails.pk
              values.approved = -1

              if (!acceptConditions)
                this.setState({acceptConditionsAlert: true})
              else {
                this.handleOnSubmit(values)
              }
            }}
            render = {props => (
              <Form>
                <ContactUserFields />
                <VMFields listVMOSes={listVMOSes}/>
                <SysAdminFields/>
                <HeadFields/>
                <SubmitNewRequest
                  acceptConditions={acceptConditions}
                  handleAcceptConditions={this.handleAcceptConditions}
                  dismissAlert={this.dismissAlert}
                  stateAcceptConditionsAlert={this.state.acceptConditionsAlert}/>
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
