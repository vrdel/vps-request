import React, { Component } from 'react';
import { Backend } from './DataManager';
import {
  Col,
  CustomInput,
  Label,
  Row,
} from 'reactstrap';
import {
  LoadingAnim,
  BaseView,
  DropDown,
  InfoLink } from './UIElements.js';
import { Formik, Form, Field } from 'formik';

import './NewRequest.css';

// http://www.srce.unizg.hr/files/srce/docs/cloud/pravilnik_usluge_vps_05102018.pdf

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


const RequestHorizontalRule = () =>
(
  <div className="m-5">
    <hr/>
  </div>
)


export class NewRequest extends Component
{
  constructor(props) {
    super(props);

    this.state = {
      areYouSureModal: false,
      loading: false,
      listVMOSes: [],
      acceptConditions: undefined,
      userDetail: undefined,
      modalFunc: undefined,
      modalTitle: undefined,
      modalMsg: undefined,
    }

    this.urlListVMOSes = '/api/v1/internal/listvmos'
    this.urlListUsers = '/api/v1/internal/users'
    this.username = localStorage.getItem('authUsername')

    this.infoPurpose = "* Potrebno je detaljno obrazložiti namjenu virtualnog poslužitelja. Zahtjev može biti odbijen ukoliko Srce procijeni da navedena namjena virtualnog poslužitelja nije primjerena namjeni usluge, ili ne predstavlja trajne potrebe ustanove za poslužiteljskim kapacitetima.";
    this.infoVMOS = "* Čelnik ustanove odgovara za posjedovanje i aktiviranje valjane licence za gore odabrani operacijski sustav."
    this.infoAAI = "* Sistem-inženjer jedini ima pravo pristupa na XenOrchestra sučelje dostupno na adresi "

    this.backend = new Backend();
    this.toggleAreYouSure = this.toggleAreYouSure.bind(this);
    this.handleAcceptConditions = this.handleAcceptConditions.bind(this);
  }

  flattenListVMOses(data) {
    let listOSes = new Array(data.length)
    data.forEach(os => {
      listOSes.push(os.vm_os)
    })
    return listOSes
  }

  toggleAreYouSure() {
    this.setState(prevState =>
      ({areYouSureModal: !prevState.areYouSureModal}));
  }

  componentDidMount() {
    this.setState({loading: true})

    Promise.all([
      this.backend.fetchData(this.urlListVMOSes),
      this.backend.fetchData(`${this.urlListUsers}/${this.username}`)
    ])
      .then(([vmOSes, userDetail]) => this.setState({
        listVMOSes: this.flattenListVMOses(vmOSes),
        acceptConditions: false,
        userDetail: userDetail,
        loading: false
      }))
  }

  handleAcceptConditions() {
    this.setState(prevState => ({acceptConditions: !prevState.acceptConditions}))
  }

  render() {
    const {loading, listVMOSes, userDetail, acceptConditions} = this.state

    if (loading)
      return (<LoadingAnim />)

    else if (!loading && listVMOSes && userDetail && acceptConditions !== undefined) {
      return (
        <BaseView
          title='Novi zahtjev'>
          <Formik
            initialValues={{
              location: '',
              first_name: userDetail.first_name,
              last_name: userDetail.last_name,
              institution: userDetail.institution,
              role: userDetail.role,
              email: userDetail.email,
              aaieduhr: userDetail.aaieduhr,
              vm_fqdn: '',
              vm_purpose: '',
              vm_remark: '',
              list_oses: '',
              sys_firstname: '',
              sys_lastname: '',
              sys_institution: '',
              sys_role: '',
              sys_email: '',
              head_firstname: '',
              head_lastname: '',
              head_institution: userDetail.institution,
              head_role: 'Čelnik ustanove',
              head_email: ''
            }}
            onSubmit={(values) => alert(JSON.stringify(values, null, 2))}
            render = {props => (
              <Form>
                <h5 className="mb-3 mt-4">Kontaktna osoba Ustanove</h5>
                <Field name="first_name" component={RowRequestField} label="Ime:" labelFor="firstName" fieldType="text" disabled={true}/>
                <Field name="last_name" component={RowRequestField} label="Prezime:" labelFor="lastName" fieldType="text" disabled={true}/>
                <Field name="institution" component={RowRequestField} label="Ustanova:" labelFor="institution" fieldType="text" disabled={true}/>
                <Field name="role" component={RowRequestField} label="Funkcija:" labelFor="role" fiedType="text" disabled={true}/>
                <Field name="email" component={RowRequestField} label="Email:" labelFor="email" fieldType="text" disabled={true}/>

                <RequestHorizontalRule/>
                <h5 className="mb-3 mt-4">Zahtijevani resursi</h5>
                <Field name="vm_purpose" component={RowRequestField} label="Namjena:" labelFor="vmPurpose" fieldType="textarea" infoMsg={this.infoPurpose}/>
                <Field name="vm_fqdn" component={RowRequestField} label="Puno ime poslužitelja (FQDN):" labelFor="fqdn" fieldType="text"/>
                <Field name="list_oses" component={RowRequestDropDown} label="Operacijski sustav:" labelFor="vm_oses" data={listVMOSes} infoMsg={this.infoVMOS}/>
                <Field name="vm_remark" component={RowRequestField} label="Napomena:" labelFor="vmRemark" fieldType="textarea"/>

                <RequestHorizontalRule/>
                <h5 className="mb-3 mt-4">Sistem-inženjer virtualnog poslužitelja</h5>
                <Field name="sys_firstname" component={RowRequestField} label="Ime:" labelFor="firstName" fieldType="text"/>
                <Field name="sys_lastname" component={RowRequestField} label="Prezime:" labelFor="lastName" fieldType="text"/>
                <Field name="sys_institution" component={RowRequestField} label="Ustanova:" labelFor="institution" fieldType="text"/>
                <Field name="sys_role" component={RowRequestField} label="Funkcija:" labelFor="role" fiedType="text"/>
                <Field name="sys_email" component={RowRequestField} label="Email:" labelFor="email" fieldType="text"/>
                <Field name="sys_aaieduhr"
                  component={RowRequestField}
                  label="AAI@EduHr korisnička oznaka:" labelFor="aaieduhr"
                  fieldType="text"
                  infoMsgComponent={<InfoLink prefix={`${this.infoAAI} `} linkHref="https://vps.srce.hr"/>}/>

                <RequestHorizontalRule/>
                <h5 className="mb-3 mt-4">Čelnik ustanove</h5>
                <Field name="head_firstname" component={RowRequestField} label="Ime:" labelFor="firstName" fieldType="text"/>
                <Field name="head_lastname" component={RowRequestField} label="Prezime:" labelFor="lastName" fieldType="text"/>
                <Field name="head_institution" component={RowRequestField} label="Ustanova:" labelFor="institution" fieldType="text" disabled={true}/>
                <Field name="head_role" component={RowRequestField} label="Funkcija:" labelFor="role" fiedType="text"/>
                <Field name="head_email" component={RowRequestField} label="Email:" labelFor="email" fieldType="text"/>

                <RequestHorizontalRule/>
                <div className="text-center">
                  <CustomInput type="checkbox" id="reportEnabled" checked={acceptConditions} onChange={this.handleAcceptConditions}/>
                </div>
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
