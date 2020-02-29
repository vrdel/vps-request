import React, { Component } from 'react';
import { Backend } from './DataManager';
import {
  Alert,
  Button,
  Col,
  CustomInput,
  Label,
  Row,
} from 'reactstrap';
import {
  BaseView,
  DropDown,
  InfoLink,
  LoadingAnim,
  NotifyOk,
  NotifyError,
  RequestHorizontalRule,
  DateFormatHR
} from './UIElements.js';
import { Formik, Form, Field } from 'formik';
import './Request.css';


const RowRequestDropDown = ({field, ...propsRest}) =>
(
  <Row className="form-group align-items-center">
    <Col md={{size: 2, offset: 1}} className="d-flex justify-content-end">
      <Label
        for={propsRest.labelFor}
        className="mr-2">
        {propsRest.label}
      </Label>
    </Col>
    <Col md={{size: 7}}>
      <DropDown
        field={field}
        data={propsRest.data}
        id={propsRest.labelFor}
      />
      {
        propsRest.infoMsg ?
          <div id="vpsreq-field-infomsg">
            {propsRest.infoMsg}
          </div>
          : null
      }
    </Col>
  </Row>
)


const RowRequestField = ({field, ...propsRest}) =>
(
  <Row className="form-group align-items-center">
    <Col md={{size: 2, offset: 1}} className="d-flex justify-content-end">
      <Label
        for={propsRest.labelFor}
        className="mr-2">
        {propsRest.label}
      </Label>
    </Col>
    <Col md={{size: 7}}>
    {
      propsRest.fieldType === 'textarea' ?
        <div>
          <textarea
            id={propsRest.labelFor}
            className="form-control"
            required={propsRest.required ? true : false}
            rows="5"
            {...field}/>
          {
            propsRest.infoMsg ?
              <div id="vpsreq-field-infomsg">
                {propsRest.infoMsg}
              </div>
              : null
          }
        </div>
        :
        <div>
          <input
            id={propsRest.labelFor}
            type={propsRest.fieldType}
            className="form-control"
            required={propsRest.required ? true : false}
            disabled={propsRest.disabled ? true : false}
            {...field}/>
          {
            propsRest.infoMsg ?
              <div id="vpsreq-field-infomsg">
                {propsRest.infoMsg}
              </div>
              :
              propsRest.infoMsgComponent ?
                <div id="vpsreq-field-infomsg">
                  {propsRest.infoMsgComponent}
                </div>
                : null
          }
        </div>
    }
    </Col>
  </Row>
)


const ContactUserFields = () =>
(
  <React.Fragment>
    <h5 className="mb-3 mt-4">Kontaktna osoba Ustanove</h5>
    <Field name="first_name" component={RowRequestField} label="Ime:" labelFor="firstName" fieldType="text" disabled={true}/>
    <Field name="last_name" component={RowRequestField} label="Prezime:" labelFor="lastName" fieldType="text" disabled={true}/>
    <Field name="institution" component={RowRequestField} label="Ustanova:" labelFor="institution" fieldType="text" disabled={true}/>
    <Field name="role" component={RowRequestField} label="Funkcija:" labelFor="role" fiedType="text" disabled={true}/>
    <Field name="email" component={RowRequestField} label="Email:" labelFor="email" fieldType="text" disabled={true}/>
  </React.Fragment>
)


const VMFields = ({listVMOSes}) => {
  let infoVMOS = "* Čelnik ustanove odgovara za posjedovanje i aktiviranje valjane licence za gore odabrani operacijski sustav."
  let infoPurpose = "* Potrebno je detaljno obrazložiti namjenu virtualnog poslužitelja. Zahtjev može biti odbijen ukoliko Srce procijeni da navedena namjena virtualnog poslužitelja nije primjerena namjeni usluge, ili ne predstavlja trajne potrebe ustanove za poslužiteljskim kapacitetima.";

  return (
    <React.Fragment>
      <RequestHorizontalRule/>
      <h5 className="mb-3 mt-4">Zahtijevani resursi</h5>
      <Field name="vm_purpose" component={RowRequestField} label="Namjena:" labelFor="vmPurpose" fieldType="textarea" infoMsg={infoPurpose} required={true}/>
      <Field name="vm_fqdn" component={RowRequestField} label="Puno ime poslužitelja (FQDN):" labelFor="fqdn" fieldType="text" required={true}/>
      <Field name="vm_os" component={RowRequestDropDown}
        label="Operacijski sustav:"
        labelFor="vm_oses"
        data={['', ...listVMOSes]}
        infoMsg={infoVMOS}
        required={true}/>
      <Field name="vm_remark" component={RowRequestField} label="Napomena:" labelFor="vmRemark" fieldType="textarea" required={true}/>
    </React.Fragment>
  )
}


const SysAdminFields = () => {
  let infoAAI = "* Sistem-inženjer jedini ima pravo pristupa na XenOrchestra sučelje dostupno na adresi "
  return (
    <React.Fragment>
      <RequestHorizontalRule/>
      <h5 className="mb-3 mt-4">Sistem-inženjer virtualnog poslužitelja</h5>
      <Field name="sys_firstname" component={RowRequestField} label="Ime:" labelFor="firstName" fieldType="text" required={true}/>
      <Field name="sys_lastname" component={RowRequestField} label="Prezime:" labelFor="lastName" fieldType="text" required={true}/>
      <Field name="sys_institution" component={RowRequestField} label="Ustanova:" labelFor="institution" fieldType="text" required={true}/>
      <Field name="sys_role" component={RowRequestField} label="Funkcija:" labelFor="role" fiedType="text" required={true}/>
      <Field name="sys_email" component={RowRequestField} label="Email:" labelFor="email" fieldType="text" required={true}/>
      <Field name="sys_aaieduhr"
        component={RowRequestField}
        label="AAI@EduHr korisnička oznaka:" labelFor="aaieduhr"
        fieldType="text"
        infoMsgComponent={<InfoLink prefix={infoAAI} linkHref="https://vps.srce.hr"/>}
        required={true}/>
    </React.Fragment>
  )
}


const HeadFields = () =>
(
  <React.Fragment>
    <RequestHorizontalRule/>
    <h5 className="mb-3 mt-4">Čelnik ustanove</h5>
    <Field name="head_firstname" component={RowRequestField} label="Ime:" labelFor="firstName" fieldType="text" required={true}/>
    <Field name="head_lastname" component={RowRequestField} label="Prezime:" labelFor="lastName" fieldType="text" required={true}/>
    <Field name="head_institution" component={RowRequestField} label="Ustanova:" labelFor="institution" fieldType="text" disabled={true} required={true}/>
    <Field name="head_role" component={RowRequestField} label="Funkcija:" labelFor="role" fiedType="text" required={true}/>
    <Field name="head_email" component={RowRequestField} label="Email:" labelFor="email" fieldType="text" required={true}/>
  </React.Fragment>
)


const RequestDateField = () =>
(
  <React.Fragment>
    <div className="mt-5">
      <Field name="request_date" component={RowRequestField} label="Datum podnošenja:" labelFor="dateRequest" fieldType="text" disabled={true} required={true}/>
    </div>
    <RequestHorizontalRule/>
  </React.Fragment>
)


const SubmitNewRequest = ({acceptConditions, handleAcceptConditions, dismissAlert, stateAcceptConditionsAlert}) =>
(
  <React.Fragment>
    <RequestHorizontalRule/>
    <Row>
      <Col md={{size: 8, offset: 2}} className="text-center">
        <CustomInput type="checkbox" id="acceptedConditions" checked={acceptConditions} onChange={handleAcceptConditions}
          label={
            <InfoLink prefix="Prihvaćam "
              linkHref="http://www.srce.unizg.hr/files/srce/docs/cloud/pravilnik_usluge_vps_05102018.pdf"
              linkTitle="Pravilnik usluge Virtual Private Server"/>
          }
        />
      </Col>
    </Row>
    <Row>
      <Col md={{size: 4, offset: 4}}>
        <Alert className="mt-2" color="danger" isOpen={stateAcceptConditionsAlert} toggle={dismissAlert} fade={false}>
          <p className="text-center mt-3 ml-3">
            Morate prihvatiti pravilnik Usluge!
          </p>
        </Alert>
      </Col>
    </Row>
    <Row className="mt-2">
      <Col md={{size: 10, offset: 1}}>
        <p className="text-muted text-center">
          <small>
            Prihvaćanjem Pravilnika usluge od strane kontaktne osobe Ustanove smatra se da Ustanova i čelnik Ustanove potvrđuju i odgovaraju za istinitost podataka iz zahtjeva, da su upoznati s odredbama Pravilnika usluge, te da pristaju na korištenje usluge sukladno Pravilniku usluge.
          </small>
        </p>

        <p className="text-muted text-center">
          <small>
            <InfoLink prefix="Srce gore navedene osobne podatke obrađuje isključivo radi pružanja zatražene usluge, sukladno svojoj politici privatnosti ("
              linkHref="https://www.srce.hr/politika-privatnosti"
              suffix=")"/>
            <InfoLink prefix=" i " linkHref="http://www.srce.unizg.hr/files/srce/docs/cloud/pravilnik_usluge_vps_05102018.pdf"
              linkTitle="Pravilniku usluge"/>
          </small>
        </p>
      </Col>
    </Row>
    <Row className="mt-2 mb-2 text-center">
      <Col>
        <Button className="btn-lg" color="success" id="submit-button" type="submit">Podnesi zahtjev</Button>
      </Col>
    </Row>
    <Row className="mt-3 mb-2">
      <Col md={{size: 10, offset: 1}}>
        <p className="text-muted text-center">
          <small>
            Kopija zahtjeva šalje se automatski putem e-maila kontaktnoj osobi i čelniku Ustanove.
          </small>
        </p>
      </Col>
    </Row>
  </React.Fragment>
)


const SubmitChangeRequest = () =>
(
  <React.Fragment>
    <RequestHorizontalRule/>
    <Row className="mt-2 mb-4 text-center">
      <Col>
        <Button className="btn-lg" color="success" id="submit-button" type="submit">Promijeni zahtjev</Button>
      </Col>
    </Row>
  </React.Fragment>
)


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

    this.apiListVMOSes = '/api/v1/internal/vmos/'
    this.apiListUsers = '/api/v1/internal/users/'
    this.apiListRequests = '/api/v1/internal/requests'

    this.backend = new Backend()
    this.handleOnSubmit = this.handleOnSubmit.bind(this)
  }

  flattenListVMOses(data) {
    let listOSes = new Array()
    data.forEach(os => {
      listOSes.push(os.vm_os)
    })
    return listOSes
  }

  componentDidMount() {
    this.setState({loading: true})

    this.backend.isActiveSession().then(sessionActive => {
      sessionActive.active &&
        Promise.all([
          this.backend.fetchData(this.apiListVMOSes),
          this.backend.fetchData(`${this.apiListRequests}/${this.requestID}`),
        ])
          .then(([vmOSes, requestData]) => this.setState({
            listVMOSes: this.flattenListVMOses(vmOSes),
            userDetails: sessionActive.userdetails,
            requestDetails: requestData,
            loading: false
          }))
    })
  }

  handleOnSubmit(data) {
    this.backend.changeObject(`${this.apiListRequests}/${this.requestID}`, data)
      .then(response => {
        response.ok
          ? NotifyOk({
              msg: 'Zahtjev uspješno promijenjen',
              title: `Uspješno - HTTP ${response.status}`})
          : NotifyError({
              msg: response.statusText,
              title: `Greška - HTTP ${response.status}`})
      })
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
        vm_fqdn: requestDetails.vm_fqdn,
        vm_purpose: requestDetails.vm_purpose,
        vm_remark: requestDetails.vm_remark,
        vm_os: requestDetails.vm_os,
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
        request_date: DateFormatHR(requestDetails.request_date)
      }

    if (loading)
      return (<LoadingAnim />)

    else if (!loading && listVMOSes && initValues) {
      return (
        <BaseView
          title='Promjeni Zahtjev'
          isChangeView={true}>
          <Formik
            initialValues={initValues}
            onSubmit={(values, actions) => {
              this.handleOnSubmit(values)
            }}
            render = {props => (
              <Form>
                <RequestDateField/>
                <ContactUserFields/>
                <VMFields listVMOSes={listVMOSes}/>
                <SysAdminFields/>
                <HeadFields/>
                <SubmitChangeRequest/>
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
    this.apiListUsers = '/api/v1/internal/users/'
    this.apiListRequests = '/api/v1/internal/requests/'

    this.backend = new Backend()
    this.handleAcceptConditions = this.handleAcceptConditions.bind(this)
    this.handleOnSubmit = this.handleOnSubmit.bind(this)
    this.dismissAlert = this.dismissAlert.bind(this)
  }

  flattenListVMOses(data) {
    let listOSes = new Array()
    data.forEach(os => {
      listOSes.push(os.vm_os)
    })
    return listOSes
  }

  componentDidMount() {
    this.setState({loading: true})

    this.backend.isActiveSession().then(sessionActive => {
      sessionActive.active &&
        Promise.all([
          this.backend.fetchData(this.apiListVMOSes),
        ])
          .then(([vmOSes]) => this.setState({
            listVMOSes: this.flattenListVMOses(vmOSes),
            acceptConditions: false,
            userDetails: sessionActive.userdetails,
            loading: false
          }))
    })
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
          title='Novi Zahtjev'
          isChangeView={false}>
          <Formik
            initialValues={initValues}
            onSubmit={(values, actions) => {
              values.username = userDetails.username

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

export default NewRequest;
