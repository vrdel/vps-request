import React, { Component } from 'react';
import Login from './Login';
import Home from './Home';
import NotFound from './NotFound';
import { Route, Switch, BrowserRouter, Redirect, withRouter } from 'react-router-dom';
import { Container, Row, Col } from 'reactstrap';
import { NavigationBar, NavigationLinks, Footer } from './UIElements';
import { NotificationContainer } from 'react-notifications';
import { Backend } from './DataManager';
import Cookies from 'universal-cookie';

import './App.css';

const NavigationBarWithRouter = withRouter(NavigationBar);
const NavigationLinksWithRouter = withRouter(NavigationLinks);


class App extends Component {
  constructor(props) {
    super(props);

    this.cookies = new Cookies();
    this.backend = new Backend();

    this.state = {
      isLogged: localStorage.getItem('authIsLogged') ? true : false,
      isSessionActive: undefined,
      areYouSureModal: false,
    };

    this.onLogin = this.onLogin.bind(this);
    this.onLogout = this.onLogout.bind(this);
    this.toggleAreYouSure = this.toggleAreYouSure.bind(this);
    this.flushStorage = this.flushStorage.bind(this);
  }

  onLogin(json, history) {
    localStorage.setItem('authUsername', json.username);
    localStorage.setItem('authIsLogged', true);
    localStorage.setItem('authFirstName', json.first_name);
    localStorage.setItem('authLastName', json.last_name);
    localStorage.setItem('authIsSuperuser', json.is_superuser);
    this.initalizeState(true, true).then(
      setTimeout(() => {
        history.push('/ui/home');
      }, 50
    )).then(this.cookies.set('activeSession', true))
  }

  flushStorage() {
    localStorage.removeItem('authUsername');
    localStorage.removeItem('authIsLogged');
    localStorage.removeItem('authFirstName');
    localStorage.removeItem('authLastName');
    localStorage.removeItem('authIsSuperuser');
    this.cookies.remove('activeSession')
  }

  onLogout() {
    this.flushStorage()
    this.setState({isLogged: false, isSessionActive: false});
  }

  toggleAreYouSure() {
    this.setState(prevState =>
      ({areYouSureModal: !prevState.areYouSureModal}));
  }

  fetchConfigOptions() {
    return fetch('/api/v1/internal/config_options')
      .then(response => {
        if (response.ok)
          return response.json();
      })
  }

  initalizeState(activeSession, isLogged) {
    return Promise.all([this.fetchConfigOptions()])
      .then(([options]) => {
        this.setState({
          isSessionActive: activeSession,
          isLogged: isLogged,
          configOptions: options,
        })
      })
  }

  componentDidMount() {
    this.state.isLogged && this.backend.isActiveSession().then(active => {
      if (active) {
        this.initalizeState(active, this.state.isLogged)
      }
      else
        this.flushStorage()
    })
  }

  render() {
    let cookie = this.cookies.get('activeSession')

    if (!cookie || !this.state.isLogged) {
      return (
        <BrowserRouter>
          <Switch>
            <Route
              exact
              path="/ui/login"
              render={props =>
                  <Login onLogin={this.onLogin} {...props} />
              }
            />
            <Route
              exact
              path="/ui/(home|requests)"
              render={props => (
                <Redirect to={{
                  pathname: '/ui/login',
                  state: {from: props.location}
                }}/>
              )}/>
            <Route component={NotFound} />
          </Switch>
        </BrowserRouter>
      )
    }
    else if (this.state.isLogged && cookie) {
      return (
        <BrowserRouter>
          <Container>
            <Row>
              <NotificationContainer />
              <Col>
                <NavigationBarWithRouter
                  onLogout={this.onLogout}
                  isOpenModal={this.state.areYouSureModal}
                  toggle={this.toggleAreYouSure}
                  titleModal='Log out'
                  msgModal='Are you sure you want to log out?'/>
              </Col>
            </Row>
            <Row className="no-gutters">
              <Col>
                <NavigationLinksWithRouter />
                <Switch>
                </Switch>
              </Col>
            </Row>
            <Row>
              <Col>
                <Footer loginPage={false}/>
              </Col>
            </Row>
          </Container>
        </BrowserRouter>
      )
    }
    else
      return null
  }
}

export default App;
