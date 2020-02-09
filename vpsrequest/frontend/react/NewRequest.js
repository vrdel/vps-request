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
              location: undefined,
              first_name: undefined,
              last_name: undefined,
              institution: undefined,
              role: undefined,
              email: undefined
            }}
            onSubmit={(values) => alert(JSON.stringify(values, null, 2))}
            render = {props => (
              <Form>
                <h5 className="mb-3 mt-4">Kontaktna osoba Ustanove</h5>
                <Row className="form-group align-items-center">
                  <Col md={{size:2, offset: 1}} className="d-flex justify-content-end">
                    <Label
                      for="firstName"
                      className="mr-2">
                      Ime:
                    </Label>
                  </Col>
                  <Col md={{size: 7}}>
                    <Field
                      type="text"
                      name="first_name"
                      className="form-control"
                      id="firstName"
                    />
                  </Col>
                </Row>
                <Row className="form-group align-items-center">
                  <Col md={{size:2, offset: 1}} className="d-flex justify-content-end">
                    <Label
                      for="lastName"
                      className="mr-2">
                      Prezime:
                    </Label>
                  </Col>
                  <Col md={{size: 7}}>
                    <Field
                      type="text"
                      name="last_name"
                      className="form-control"
                      id="lastName"
                    />
                  </Col>
                </Row>
                <Row className="form-group align-items-center">
                  <Col md={{size:2, offset: 1}} className="d-flex justify-content-end">
                    <Label
                      for="institution"
                      className="mr-2">
                      Ustanova:
                    </Label>
                  </Col>
                  <Col md={{size: 7}}>
                    <Field
                      type="text"
                      name="institution"
                      className="form-control"
                      id="institution"
                    />
                  </Col>
                </Row>
                <Row className="form-group align-items-center">
                  <Col md={{size:2, offset: 1}} className="d-flex justify-content-end">
                    <Label
                      for="role"
                      className="mr-2">
                      Funkcija:
                    </Label>
                  </Col>
                  <Col md={{size: 7}}>
                    <Field
                      type="text"
                      name="role"
                      className="form-control"
                      id="role"
                    />
                  </Col>
                </Row>
                <Row className="form-group align-items-center">
                  <Col md={{size:2, offset: 1}} className="d-flex justify-content-end">
                    <Label
                      for="email"
                      className="mr-2">
                      Email:
                    </Label>
                  </Col>
                  <Col md={{size: 7}}>
                    <Field
                      type="text"
                      name="email"
                      className="form-control"
                      id="email"
                    />
                  </Col>
                </Row>
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
