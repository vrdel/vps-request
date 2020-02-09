import React, { Component } from 'react';
import { Backend } from './DataManager';
import {
  Col,
  FormGroup,
  Label,
  Row,
} from 'reactstrap';
import { LoadingAnim, BaseView } from './UIElements.js';
import { Formik, Form, Field } from 'formik';


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
    {
      propsRest.fieldType === 'textarea' ?
        <Col md={{size: 7}}>
          <textarea
            id={propsRest.labelFor}
            className="form-control"
            rows="5"
            {...field}/>
        </Col>
        :
        <Col md={{size: 7}}>
          <input
            id={propsRest.labelFor}
            type={propsRest.fieldType}
            className="form-control"
            {...field}/>
        </Col>
    }
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
      modalFunc: undefined,
      modalTitle: undefined,
      modalMsg: undefined
    }

    this.backend = new Backend();
    this.toggleAreYouSure = this.toggleAreYouSure.bind(this);
  }

  toggleAreYouSure() {
    this.setState(prevState =>
      ({areYouSureModal: !prevState.areYouSureModal}));
  }

  componentDidMount() {
    // this.setState({loading: true})
  }

  render() {
    const {loading} = this.state

    if (loading)
      return (<LoadingAnim />)

    else if (!loading) {
      return (
        <BaseView
          title='Novi zahtjev'>
          <Formik
            initialValues={{
              location: '',
              first_name: '',
              last_name: '',
              institution: '',
              role: '',
              email: '',
              vm_fqdn: '',
              vm_purpose: '',
              vm_remark: ''
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
