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
import Cookies from 'universal-cookie';
import CloudLogoSmall from './logos/logo_cloud-smaller.png';
import { Backend } from './DataManager.js';


class Login extends Component {
  constructor(props) {
    super(props);

    this._isMounted = false;

    this.state = {
      loginFailedVisible: false,
    };

    this.dismissLoginAlert = this.dismissLoginAlert.bind(this)
    this.backend = new Backend()
    this.apiConfigOptions = '/api/v1/configoptions'
  }

  isSaml2Logged() {
    return fetch('/api/v1/saml2login', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }

  flushSaml2Cache() {
    let cookies = new Cookies();

    return fetch('/api/v1/saml2login', {
      method: 'DELETE',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-CSRFToken': cookies.get('csrftoken'),
        'Referer': 'same-origin'
      }});

  }

  componentDidMount() {
    this._isMounted = true;

    this.backend.fetchData(this.apiConfigOptions).then(json => {
      this.isSaml2Logged().then(response => {
        response.ok && response.json().then(
          json => {
            if (Object.keys(json).length > 0) {
              this.flushSaml2Cache().then(
                response => response.ok &&
                  this.props.onLogin(json, this.props.history)
              )
            }
          }
        )
      })
    })
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  dismissLoginAlert() {
    this._isMounted && this.setState({loginFailedVisible: false});
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
                <img src={CloudLogoSmall} id="cloud logo" alt="VPS Cloud Logo"/>
                <h4 className="text-dark"><strong>VPS Zahtjev</strong></h4>
              </CardHeader>
              <CardBody>
                <Formik
                  initialValues = {{username: '', password: ''}}
                  onSubmit = {
                    (values) => this.backend.doUserPassLogin(values.username, values.password)
                      .then(response =>
                        {
                          if (response.active) {
                            this.props.onLogin(response.userdetails, this.props.history)
                          }
                          else {
                            this.setState({loginFailedVisible: true});
                          }
                        })
                  }>
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
                      <a className="btn btn-success btn-block" role="button" href="/saml2/login">AAI @ EduHR</a>
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

