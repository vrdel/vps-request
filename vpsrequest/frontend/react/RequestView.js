
import React, { Component } from 'react';
import {Backend} from './DataManager';
import { BaseView, LoadingAnim, RequestHorizontalRule, Status } from './UIElements';
import { DateFormatHR } from './Util';
import {
    Col,
    Row,
    } from 'reactstrap';
import { CONFIG } from './Config'


const RequestRow = ({...props}) =>
(
    <Row className="form-group align-items-center">
        <Col md={{size: 2, offset: 1}} className="d-flex justify-content-end">
            <span
                className="mr-2">
                {props.label}
            </span>
        </Col>
        <Col md={{size: 7}} >
            <span>{props.value}</span>
        </Col>
    </Row>
)

const RetiredRequestDetails = ({values}) =>
{
    if(values.approved === 3)
        return(
            <React.Fragment>
                <RequestRow label="Odobrio:" value={values.approvedby}/>
                <RequestRow label="IP adresa:" value={values.vm_ip}/>
                <RequestRow label="Poruka:" value={values.vm_reason}/>
                <RequestRow label="Datum umirovljenja:" value={values.vm_dismissed}/>
            </React.Fragment>
        )

    return null
}

const RequestDetails = ({values, userDetails}) =>
{
    let reqStatus = Status[values.approved]
    let adminRemark = null
    if(userDetails.is_superuser)
      adminRemark = <RequestRow label="Napomena administratora:" value={values.vm_admin_remark}/>

    return (
        <React.Fragment>
            <h5 className="mb-3 mt-4">Kontaktna osoba Ustanove</h5>
            <RequestRow label="Ime:" value={values.first_name}/>
            <RequestRow label="Prezime:" value={values.last_name}/>
            <RequestRow label="Ustanova:" value={values.institution}/>
            <RequestRow label="Funkcija:" value={values.role}/>
            <RequestRow label="Email:" value={values.email}/>
            <RequestHorizontalRule/>

            <h5 className="mb-3 mt-4">Zahtjevani resursi</h5>
            <RequestRow label="Namjena:" value={values.vm_purpose}/>
            <RequestRow label="Puno ime poslužitelja (FQDN):" value={values.vm_fqdn}/>
            <RequestRow label="Operacijski sustav:" value={values.vm_os}/>
            <RequestRow label="Napomena:" value={values.vm_remark}/>
            <RequestHorizontalRule/>

            <h5 className="mb-3 mt-4">Sistem-inženjer virtualnog poslužitelja</h5>
            <RequestRow label="Ime:" value={values.sys_firstname}/>
            <RequestRow label="Prezime:" value={values.sys_lastname}/>
            <RequestRow label="Ustanova:" value={values.sys_institution}/>
            <RequestRow label="Funkcija:" value={values.sys_role}/>
            <RequestRow label="Email:" value={values.sys_email}/>
            <RequestRow label="AAI@EduHr korisnička oznaka:" value={values.sys_aaieduhr}/>
            <RequestHorizontalRule/>

            <h5 className="mb-3 mt-4">Čelnik ustanove</h5>
            <RequestRow label="Ime:" value={values.head_firstname}/>
            <RequestRow label="Prezime:" value={values.head_lastname}/>
            <RequestRow label="Ustanova:" value={values.head_institution}/>
            <RequestRow label="Funkcija:" value={values.head_role}/>
            <RequestRow label="Email:" value={values.head_email}/>
            <RequestHorizontalRule/>

            {adminRemark}
            <RequestRow label="Status:" value={reqStatus}/>
            <RequestRow label="Datum podnošenja:" value={values.request_date}/>
            
            <RetiredRequestDetails values={values}/>
        </React.Fragment>
    )
}


export class ViewSingleRequest extends Component
{
  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      requestDetails: undefined,
      userDetail: undefined,
    }

    let {params} = this.props.match
    this.requestID = params.id

    this.apiListRequests = CONFIG.listReqUrl

    this.backend = new Backend()
    this.initializeComponent = this.initializeComponent.bind(this)
  }

  async initializeComponent() {
    const session = await this.backend.isActiveSession()

    if (session.active) {
      const requestData = await this.backend.fetchData(`${this.apiListRequests}/${this.requestID}/handlenew/`)

      this.setState({
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

  render() {
    const {loading, userDetails, requestDetails} = this.state

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
        timestamp: DateFormatHR(requestDetails.timestamp),
        vm_dismissed: DateFormatHR(requestDetails.vm_dismissed)
      }

    if (loading)
      return (<LoadingAnim />)

    else if (!loading && initValues) {
      return (
        <BaseView
          title='Detalji zahtjeva'>
              <RequestDetails values={initValues} userDetails={userDetails}/>
        </BaseView>
      )
    }

    else
      return null
  }
}
