import React, { Component } from 'react';
import Login from './Login';
import NewRequest from './NewRequest';
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
      userDetails: undefined,
      isSessionActive: undefined,
      areYouSureModal: false,
    };

    this.onLogin = this.onLogin.bind(this);
    this.onLogout = this.onLogout.bind(this);
    this.toggleAreYouSure = this.toggleAreYouSure.bind(this);
  }

  onLogin(json, history) {
    let response = new Object();

    response.active = true
    response.userdetails = json

    this.initalizeState(response).then(
      setTimeout(() => {
        history.push('/ui/novi-zahtjevi');
      }, 50
    ))
  }

  onLogout() {
    this.setState({isSessionActive: false});
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

  initalizeState(response) {
    return Promise.all([this.fetchConfigOptions()])
      .then(([options]) => {
        this.setState({
          isSessionActive: response.active,
          userDetails: response.userdetails,
          configOptions: options,
        })
      })
  }

  componentDidMount() {
    this.backend.isActiveSession().then(response => {
      if (response) {
        this.initalizeState(response)
      }
    })
  }

  render() {
    let {isSessionActive, userDetails} = this.state

    if (!isSessionActive) {
      return (
        <BrowserRouter>
          <Switch>
            <Route
              exact
              path="/ui/prijava"
              render={props =>
                  <Login onLogin={this.onLogin} {...props} />
              }
            />
            <Route
              exact
              path="/ui/(prijava|novi-zahtjevi|odobreni-zahtjevi|odbijeni-zahtjevi|stanje-zahtjeva|novi-zahtjev)"
              render={props => (
                <Redirect to={{
                  pathname: '/ui/prijava',
                  state: {from: props.location}
                }}/>
              )}/>
            <Route component={NotFound} />
          </Switch>
        </BrowserRouter>
      )
    }
    else if (isSessionActive && userDetails) {
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
                  titleModal='Odjava'
                  msgModal='Da li ste sigurni da se želite odjaviti?'
                  userDetails={userDetails}/>
              </Col>
            </Row>
            <Row className="no-gutters">
              <Col>
                <NavigationLinksWithRouter />
                <Switch>
                  <Route exact path="/ui/novi-zahtjev"
                    render={() => <NewRequest/>}/>
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
