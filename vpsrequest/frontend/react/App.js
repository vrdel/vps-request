import Cookies from 'universal-cookie';
import Login from './Login';
import MyRequests from './RequestsMy';
import NotFound from './NotFound';
import React, { Component } from 'react';
import ReactNotification from 'react-notifications-component'
import { Backend } from './DataManager';
import { ListRequests } from './RequestsList';
import { NewRequest } from './RequestNew';
import { ProcessNewRequest } from './RequestProcessNew';
import { ChangeRequest } from './RequestChange';
import { Route, Switch, BrowserRouter } from 'react-router-dom';
import { VPSPage } from './UIElements';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faPencilAlt,
  } from '@fortawesome/free-solid-svg-icons';
import './App.css';
import 'react-notifications-component/dist/theme.css'
import { ViewSingleRequest } from './RequestView';
import { ApprovedRequestHandler } from './RequestHandler'


const types = new Object({
  approved: {
    api: '/api/v1/internal/requests/approved',
    dateFieldSearch: 'approved_date',
    title: 'Odobreni zahtjevi',
    headerDate: 'Datum odobravanja',
    linkPath: 'odobreni-zahtjevi',
    linkPathRetired: 'umirovljeni-zahtjevi',
    lastColHeader: 'Akcija',
    lastColIcon: <FontAwesomeIcon className="text-success" size="lg" icon={faPencilAlt}/>,
    lastColIconRetired: <FontAwesomeIcon className="text-primary" size="lg" icon={faSearch}/>
  },
  fresh: {
    api: '/api/v1/internal/requests/new',
    dateFieldSearch: 'request_date',
    title: 'Novi zahtjevi',
    headerDate: 'Datum podnošenja',
    linkPath: 'novi-zahtjevi',
    lastColHeader: 'Vidi',
    lastColIcon: <FontAwesomeIcon className="text-primary" size="2x" icon={faSearch}/>
  },
  rejected: {
    api: '/api/v1/internal/requests/rejected',
    dateFieldSearch: 'approved_date',
    title: 'Odbijeni zahtjevi',
    headerDate: 'Datum odbijanja',
    linkPath: 'odbijeni-zahtjevi',
    lastColHeader: 'Vidi',
    lastColIcon: <FontAwesomeIcon className="text-primary" size="lg" icon={faSearch}/>
  }
})

const ApprovedRequests = ListRequests(types.approved)
const FreshRequests = ListRequests(types.fresh)
const RejectedRequests = ListRequests(types.rejected)


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
    this.initalizeState = this.initalizeState.bind(this);
  }

  onLogin(session, history) {
    let goToURL = '/ui/novi-zahtjevi'

    if (!session.userdetails.is_staff)
      goToURL = '/ui/novi-zahtjev'

    this.initalizeState(session).then(
      setTimeout(() => {
        history.push(goToURL);
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

  async initalizeState(session=undefined) {
    if (session === undefined)
        session = await this.backend.isActiveSession()

    if (session.active) {
      const options = await this.backend.fetchConfigOptions()

      if (options)
        this.setState({
          isSessionActive: session.active,
          userDetails: session.userdetails,
          configOptions: options,
        })
    }
  }

  componentDidMount() {
    this.initalizeState()
  }

  render() {
    let {isSessionActive, userDetails} = this.state

    if (!isSessionActive) {
      return (
        <BrowserRouter>
          <Switch>
            <Route
              path="/ui/"
              render={props =>
                  <Login onLogin={this.onLogin} {...props} />
              }
            />
            <Route component={NotFound} />
          </Switch>
        </BrowserRouter>
      )
    }
    else if (isSessionActive && userDetails) {
      let propsPage = new Object({
        toggleAreYouSure: this.toggleAreYouSure,
        onLogout: this.onLogout,
        areYouSureModal: this.state.areYouSureModal,
        userDetails: userDetails
      })

      return (
        <BrowserRouter>
          <ReactNotification />
          <Switch>
            <Route exact path="/ui/novi-zahtjev"
              render={(props) =>
                  <VPSPage
                    {...propsPage}>
                    <NewRequest {...props}/>
                  </VPSPage>}/>
            <Route exact path="/ui/novi-zahtjevi"
              render={(props) =>
                  <VPSPage
                    {...propsPage}>
                    <FreshRequests {...props}/>
                  </VPSPage>}/>
            <Route exact path="/ui/novi-zahtjevi/:id"
              render={(props) =>
                  <VPSPage
                    {...propsPage}>
                    <ProcessNewRequest {...props}/>
                  </VPSPage>}/>
            <Route exact path="/ui/odobreni-zahtjevi"
              render={(props) =>
                  <VPSPage
                    {...propsPage}>
                    <ApprovedRequests {...props}/>
                  </VPSPage>}/>
            <Route exact path="/ui/odobreni-zahtjevi/:id"
              render={(props) =>
                  <VPSPage
                    {...propsPage}>
                    <ApprovedRequestHandler {...props}/>
                  </VPSPage>}/>
            <Route exact path="/ui/umirovljeni-zahtjevi/:id"
              render={(props) =>
                  <VPSPage
                    {...propsPage}>
                    <ViewSingleRequest {...props}/>
                  </VPSPage>}/>
            <Route exact path="/ui/odbijeni-zahtjevi"
              render={(props) =>
                  <VPSPage
                    {...propsPage}>
                    <RejectedRequests {...props}/>
                  </VPSPage>}/>
            <Route exact path="/ui/odbijeni-zahtjevi/:id"
              render={(props) =>
                  <VPSPage
                    {...propsPage}>
                    <ViewSingleRequest {...props}/>
                  </VPSPage>}/>
            <Route exact path="/ui/stanje-zahtjeva"
              render={(props) =>
                  <VPSPage
                    {...propsPage}>
                    <MyRequests {...props}/>
                  </VPSPage>}/>
            <Route exact path="/ui/stanje-zahtjeva/:id"
              render={(props) =>
                  <VPSPage
                    {...propsPage}>
                    <ChangeRequest {...props}/>
                  </VPSPage>}/>
          </Switch>
        </BrowserRouter>
      )
    }
    else
      return null
  }
}

export default App;
