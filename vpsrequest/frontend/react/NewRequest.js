import React, { Component } from 'react';
import { Backend } from './DataManager';
import {
  Col,
  FormGroup,
  Label,
  Row,
} from 'reactstrap';
import { LoadingAnim, BaseView, DropDown } from './UIElements.js';
import { Formik, Form, Field } from 'formik';


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
        <textarea
          id={propsRest.labelFor}
          className="form-control"
          rows="5"
          {...field}/>
        :
        <input
          id={propsRest.labelFor}
          type={propsRest.fieldType}
          className="form-control"
          {...field}/>
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
      userDetail: undefined,
      modalFunc: undefined,
      modalTitle: undefined,
      modalMsg: undefined
    }

    this.urlListVMOSes = '/api/v1/internal/listvmos'
    this.urlListUsers = '/api/v1/internal/users'
    this.username = localStorage.getItem('authUsername')

    this.backend = new Backend();
    this.toggleAreYouSure = this.toggleAreYouSure.bind(this);
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
        userDetail: userDetail,
        loading: false
      }))
  }

  render() {
    const {loading, listVMOSes, userDetail} = this.state

    if (loading)
      return (<LoadingAnim />)

    else if (!loading && listVMOSes && userDetail) {
      return (
        <BaseView
          title='Novi zahtjev'>
          <Formik
            initialValues={{
              location: '',
              first_name: userDetail.first_name,
              last_name: userDetail.last_name,
              institution: userDetail.institution,
              role: '',
              email: userDetail.email,
              vm_fqdn: '',
              vm_purpose: '',
              vm_remark: '',
              list_oses: '',
            }}
            onSubmit={(values) => alert(JSON.stringify(values, null, 2))}
            render = {props => (
              <Form>
                <h5 className="mb-3 mt-4">Kontaktna osoba Ustanove</h5>
                <Field name="first_name" component={RowRequestField} label="Ime:" labelFor="firstName" fieldType="text"/>
                <Field name="last_name:" component={RowRequestField} label="Prezime:" labelFor="lastName" fieldType="text"/>
                <Field name="institution" component={RowRequestField} label="Ustanova:" labelFor="institution" fieldType="text"/>
                <Field name="role" component={RowRequestField} label="Funkcija:" labelFor="role" fiedType="text"/>
                <Field name="email" component={RowRequestField} label="Email:" labelFor="email" fieldType="text"/>

                <RequestHorizontalRule/>
                <h5 className="mb-3 mt-4">Zahtijevani resursi</h5>
                <Field name="vm_purpose" component={RowRequestField} label="Namjena:" labelFor="vmPurpose" fieldType="textarea"/>
                <Field name="vm_fqdn" component={RowRequestField} label="Puno ime poslužitelja (FQDN):" labelFor="fqdn" fieldType="text"/>
                <Field name="list_oses" component={RowRequestDropDown} label="Operacijski sustav:" labelFor="vm_oses" data={listVMOSes} />
                <Field name="vm_remark" component={RowRequestField} label="Napomena:" labelFor="vmRemark" fieldType="textarea"/>
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
