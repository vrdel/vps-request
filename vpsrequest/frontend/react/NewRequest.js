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


const RowRequestField = ({label='', labelFor='', refValue='', fieldType="input"}) =>
{
  const RequestInputField = (props) => (
    <Col md={{size: 7}}>
      <Field
        className="form-control"
        {...props}
      />
    </Col>
  )

  return (
    <Row className="form-group align-items-center">
      <Col md={{size: 2, offset: 1}} className="d-flex justify-content-end">
        <Label
          for={labelFor}
          className="mr-2">
          {label}
        </Label>
      </Col>
      {
        fieldType === 'textarea' ?
          <RequestInputField
            id={labelFor}
            name={refValue}
            component={fieldType}
            rows="5"/>
          :
          <RequestInputField
            id={labelFor}
            name={refValue}
            component={fieldType}/>
      }
    </Row>
  )
}


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
                <RowRequestField label="Ime:" labelFor="firstName" refValue="first_name"/>
                <RowRequestField label="Prezime:" labelFor="lastName" refValue="last_name"/>
                <RowRequestField label="Ustanova:" labelFor="institution" refValue="institution"/>
                <RowRequestField label="Funkcija:" labelFor="role" refValue="role"/>
                <RowRequestField label="Email:" labelFor="email" refValue="email"/>

                <RequestHorizontalRule/>

                <h5 className="mb-3 mt-4">Zahtijevani resursi</h5>
                <RowRequestField label="Namjena:" labelFor="vmPurpose" refValue="vm_purpose" fieldType="textarea"/>
                <RowRequestField label="Puno ime poslužitelja (FQDN):" labelFor="fqdn" refValue="vm_fqdn"/>
                <RowRequestField label="Napomena:" labelFor="vmRemark" refValue="vm_remark" fieldType="textarea"/>
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
