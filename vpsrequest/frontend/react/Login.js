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


class Login extends Component {

  constructor(props) {
    super(props);

    this._isMounted = false;

    this.state = {
      loginFailedVisible: false,
    };

    this.dismissLoginAlert = this.dismissLoginAlert.bind(this);
  }

  fetchConfigOptions() {
    return fetch('/api/v1/internal/config_options')
      .then(response => {
        if (response.ok)
          return response.json()
      })
  }

  isSaml2Logged() {
    return fetch('/api/v1/internal/saml2login', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }

  flushSaml2Cache() {
    let cookies = new Cookies();

    return fetch('/api/v1/internal/saml2login', {
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

    this.fetchConfigOptions().then(json => {
      if (json.result.AlwaysLoggedIn) {
        this.fetchUserDetails(json.result.SuperUser)
          .then(response => response.json())
          .then(json => this.props.onLogin(json, this.props.history))
      }
      else {
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
      }
    })
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  fetchUserDetails(username) {
    return fetch('/api/v1/internal/users/' + username, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }

  doUserPassLogin(username, password)
  {
    return fetch('/rest-auth/login/', {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': 'same-origin'
      },
      body: JSON.stringify({
        'username': username,
        'password': password
      })
    }).then(response => this.fetchUserDetails(username));
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
                <h4 className="text-dark"><strong>VPS Zahtjev</strong></h4>
              </CardHeader>
              <CardBody>
                <Formik
                  initialValues = {{username: '', password: ''}}
                  onSubmit = {
                    (values) => this.doUserPassLogin(values.username, values.password)
                      .then(response =>
                        {
                          if (response.ok) {
                            response.json().then(
                              json => this.props.onLogin(json, this.props.history)
                            )
                          }
                          else {
                            this.setState({loginFailedVisible: true});
                          }
                        })
                  }>
                  <Form>
                    <FormGroup>
                      <Label for="username">Username: </Label>
                      <Field name="username" className="form-control"/>
                    </FormGroup>
                    <FormGroup>
                      <Label for="password">Password: </Label>
                      <Field name="password" className="form-control" type="password"/>
                    </FormGroup>
                    <FormGroup>
                      <Alert color="danger" isOpen={this.state.loginFailedVisible} toggle={this.dismissLoginAlert} fade={false}>
                        <p className="text-center">
                          Login failed, invalid username and password provided
                        </p>
                      </Alert>
                    </FormGroup>
                    <div className="pt-3">
                    </div>
                    <FormGroup>
                      <Button color="success" type="submit" block>Log in using username and password</Button>
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

