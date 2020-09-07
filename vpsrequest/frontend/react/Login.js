import React, { Component } from 'react';
import {
  Alert,
  Container,
  Button,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  Label,
  CardFooter,
  FormGroup } from 'reactstrap';
import {Formik, Field, Form} from 'formik';
import './Login.css';
import {Footer} from './UIElements.js';
import CloudLogoSmall from './logos/logo_cloud-smaller.png';
import { Backend } from './DataManager.js';
import { RelativePath } from './Config'


class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loginFailedVisible: false,
    };

    this.dismissLoginAlert = this.dismissLoginAlert.bind(this)
    this.handleOnSubmit = this.handleOnSubmit.bind(this)
    this.backend = new Backend()
    this.AppOnLogin = props.onLogin
  }

  dismissLoginAlert() {
    this.setState({loginFailedVisible: false});
  }

  async handleOnSubmit(values) {
    const session = await this.backend.doUserPassLogin(values.username, values.password)

    if (session.active)
      this.AppOnLogin(session)
    else
      this.setState({loginFailedVisible: true});
  }

  render() {
    return (
      <Container>
        <Row className="login-first-row">
          <Col sm={{size: 4, offset: 4}}>
            <Card>
              <CardHeader
                id='vpsreq-loginheader'
                className="d-sm-inline-flex align-items-center justify-content-around">
                <img src={CloudLogoSmall} id="cloud logo" alt="O usluzi VPS"/>
                <h4 className="text-dark"><strong>VPS Zahtjev</strong></h4>
              </CardHeader>
              <CardBody>
                <Formik
                  initialValues = {{username: '', password: ''}}
                  onSubmit = {(values) => this.handleOnSubmit(values)}>
                  <Form>
                    <FormGroup>
                      <Label for="username">Korisničko ime: </Label>
                      <Field name="username" className="form-control"/>
                    </FormGroup>
                    <FormGroup>
                      <Label for="password">Lozinka: </Label>
                      <Field name="password" className="form-control" type="password"/>
                    </FormGroup>
                    <FormGroup>
                      <Alert color="danger" isOpen={this.state.loginFailedVisible} toggle={this.dismissLoginAlert} fade={false}>
                        <p className="text-center">
                          Prijava neuspjela, pogrešno korisničko ime i lozinka
                        </p>
                      </Alert>
                    </FormGroup>
                    <div className="pt-3">
                    </div>
                    <FormGroup>
                      <Button color="success" type="submit" block>Prijava korisničkim imenom i lozinkom</Button>
                      <a className="btn btn-success btn-block" role="button" href= {`${RelativePath}/saml2/login`}>AAI @ EduHR</a>
                    </FormGroup>
                  </Form>
                </Formik>
              </CardBody>
              <CardFooter id="vpsreq-loginfooter">
                <Footer loginPage={true}/>
              </CardFooter>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default Login;

