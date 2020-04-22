import React, { Component } from 'react';
import {Backend} from './DataManager';
import {
  BaseView,
  LoadingAnim,
  RequestHorizontalRule,
  NotifyError,
  NotifyOk,
  ModalAreYouSure
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
import { DateFormatHR } from './Util';


export class ApprovedRequestHandler extends Component
{
  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      listVMOSes: [],
      requestDetails: undefined,
      requestApproved: undefined,
      userDetail: undefined,
      modalTitle: undefined,
      modalMsg: undefined,
      modalFunc: undefined,
      areYouSureModal: false,
    }

    let {params} = this.props.match
    this.requestID = params.id
    this.history = props.history

    this.apiListRequests = CONFIG.listReqUrl

    this.backend = new Backend()
    this.handleOnSubmit = this.handleOnSubmit.bind(this)
    this.initializeComponent = this.initializeComponent.bind(this)
    this.toggleAreYouSure = this.toggleAreYouSure.bind(this)
  }

  async initializeComponent() {
    const session = await this.backend.isActiveSession()

    if (session.active) {
      const requestData = await this.backend.fetchData(`${this.apiListRequests}/${this.requestID}/handlenew/`)
      const vmOSes = await this.backend.fetchData(CONFIG.vmosUrl)

      this.setState({
        userDetails: session.userdetails,
        requestDetails: requestData,
        listVMOSes: vmOSes.map(e => e.vm_os),
        loading: false,
      })
    }
  }

  toggleAreYouSureSetModal(msg, title, onYes) {
    this.setState(prevState =>
      ({areYouSureModal: !prevState.areYouSureModal,
        modalFunc: onYes,
        modalMsg: msg,
        modalTitle: title,
      }));
  }

  toggleAreYouSure() {
    this.setState(prevState =>
      ({areYouSureModal: !prevState.areYouSureModal}));
  }

  componentDidMount() {
    this.setState({loading: true})
    this.initializeComponent()
  }

  async handleOnSubmit(data, callback=undefined) {
    let response = await this.backend.changeObject(`${this.apiListRequests}/${this.requestID}/`, data)

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

  render() {
    const {loading, listVMOSes, userDetails, requestDetails} = this.state

    if (userDetails && requestDetails)
      var initValues = {
        location: '',
        first_name: requestDetails.user.first_name,
        last_name: requestDetails.user.last_name,
        institution: requestDetails.user.institution,
        role: requestDetails.user.role,
        email: requestDetails.user.email,
        aaieduhr: requestDetails.user.aaieduhr,
        approvedby: requestDetails.approvedby,
        vm_fqdn: requestDetails.vm_fqdn,
        vm_purpose: requestDetails.vm_purpose,
        vm_admin_remark: requestDetails.vm_admin_remark,
        vm_reason: requestDetails.vm_reason,
        vm_remark: requestDetails.vm_remark,
        vm_os: requestDetails.vm_os,
        vm_ip: requestDetails.vm_ip,
        vm_host: requestDetails.vm_host,
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
      return (
        <BaseView
          title='Obradi zahtjev'
          modal={true}
          toggle={this.toggleAreYouSure}
          state={this.state}
          isHandleApprovedView={initValues.approved === 1}
          isIssuedVMView={initValues.approved !== 1}>
          <Formik
            initialValues={initValues}
            onSubmit={(values, actions) => {
              values.approved = 2
              values.timestamp = new Date().toISOString()
              values.request_date = requestDetails.request_date

              if (values.retire) {
                values.approved = 3
                values.vm_dismissed = values.timestamp
              }
              delete values.retire

              if (values.approved === 3) {
                let callback = () => this.history.push('/ui/odobreni-zahtjevi')
                this.handleOnSubmit(values, callback)
              }
              else
                this.handleOnSubmit(values)
            }}
            render = {({setFieldValue, handleSubmit}) => (
              <Form onSubmit={handleSubmit}>
                <RequestDateField/>
                <ContactUserFields/>
                <VMFields listVMOSes={listVMOSes}/>
                <SysAdminFields/>
                <HeadFields/>
                <StateFields readOnly={false}/>
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
                            onClick={() => handleSubmit()}>
                              Spremi promjene
                          </Button>
                        </Col>
                        <Col>
                          <Button className="btn-lg" color="secondary"
                            id="button-retire" type="button"
                            onClick={() => {
                              this.toggleAreYouSureSetModal(
                                "Želite li umiroviti server (naknadne promjene nisu više moguće)?",
                                "Mirovina",
                                () => {
                                  setFieldValue('retire', true, false)
                                  handleSubmit()
                                })}}>
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
          />
        </BaseView>
      )
    }

    else
      return null
  }
}
