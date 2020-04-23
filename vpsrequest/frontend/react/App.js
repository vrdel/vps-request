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
import { Route, Switch, BrowserRouter, Redirect } from 'react-router-dom';
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
import { CONFIG } from './Config'
import { canApprove } from './Util'


const types = new Object({
  approved: {
    api: `${CONFIG.listReqUrl}/approved`,
    dateFieldSearch: 'approved_date',
    title: 'Odobreni zahtjevi',
    headerDate: 'Datum odobravanja',
    linkPath: 'odobreni-zahtjevi',
    linkPathReadOnly: 'umirovljen',
    lastColHeader: 'Akcija',
    lastColIcon: <FontAwesomeIcon className="text-success" size="lg" icon={faPencilAlt}/>,
    lastColIconReadOnly: <FontAwesomeIcon className="text-primary" size="lg" icon={faSearch}/>
  },
  fresh: {
    api: `${CONFIG.listReqUrl}/new`,
    dateFieldSearch: 'request_date',
    title: 'Novi zahtjevi',
    headerDate: 'Datum podnošenja',
    linkPath: 'novi-zahtjevi',
    lastColHeader: 'Vidi',
    lastColIcon: <FontAwesomeIcon className="text-primary" size="lg" icon={faSearch}/>
  },
  rejected: {
    api: `${CONFIG.listReqUrl}/rejected`,
    dateFieldSearch: 'approved_date',
    title: 'Odbijeni zahtjevi',
    headerDate: 'Datum odbijanja',
    linkPath: 'odbijeni-zahtjevi',
    lastColHeader: 'Vidi',
    lastColIcon: <FontAwesomeIcon className="text-primary" size="lg" icon={faSearch}/>,
  }
})

const ApprovedRequests = ListRequests(types.approved)
const FreshRequests = ListRequests(types.fresh)
const RejectedRequests = ListRequests(types.rejected)

const ProtectedRoute = ({userDetails, ...props}) => (
  userDetails.is_staff || userDetails.is_superuser || canApprove(userDetails)?
    <Route {...props} />
  :
    <Route component={NotFound} />
)

const RedirectAfterLogin = ({userDetails, ...props}) => {
  let last = ''
  let before_last = ''
  let destination = ''
  let referrer = localStorage.getItem('referrer')

  if (userDetails.is_staff || userDetails.is_superuser)
    destination = "/ui/novi-zahtjevi"
  else
    destination = "/ui/novi-zahtjev"

  if (referrer) {
    let urls = JSON.parse(referrer)

    if (urls.length === 1) {
      last = urls.pop()
      before_last = last
    }
    else {
      last = urls.pop()
      before_last = urls.pop()
    }
  }

  if (last !== before_last)
    destination = before_last

  localStorage.removeItem('referrer')

  return <Redirect to={destination}/>
}


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

  onLogin(session) {
    this.initalizeState(session)
  }

  onLogout() {
    this.setState({isSessionActive: false})
    localStorage.removeItem('referrer')
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

  getAndSetReferrer() {
    let referrer = localStorage.getItem('referrer')
    let stackUrls = undefined

    if (referrer)
      stackUrls = JSON.parse(referrer)
    else
      stackUrls = new Array()

    stackUrls.push(window.location.pathname)
    localStorage.setItem('referrer', JSON.stringify(stackUrls))
  }

  componentDidMount() {
    this.initalizeState()
    this.getAndSetReferrer()
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
            <Route exact path="/ui/prijava"
              render={(props) =>
                  <RedirectAfterLogin
                    userDetails={userDetails}
                    {...props}
                  />}/>
            <Route exact path="/ui/novi-zahtjev"
              render={(props) =>
                  <VPSPage
                    {...propsPage}>
                    <NewRequest {...props}/>
                  </VPSPage>}/>
            <ProtectedRoute userDetails={userDetails} exact path="/ui/novi-zahtjevi"
              render={(props) =>
                  <VPSPage
                    {...propsPage}>
                    <FreshRequests {...props}/>
                  </VPSPage>}/>
            <ProtectedRoute userDetails={userDetails} exact path="/ui/novi-zahtjevi/:id"
              render={(props) =>
                  <VPSPage
                    {...propsPage}>
                    <ProcessNewRequest {...props}/>
                  </VPSPage>}/>
            <ProtectedRoute userDetails={userDetails} exact path="/ui/odobreni-zahtjevi"
              render={(props) =>
                  <VPSPage
                    {...propsPage}>
                    <ApprovedRequests {...props}/>
                  </VPSPage>}/>
            <ProtectedRoute userDetails={userDetails} exact path="/ui/odobreni-zahtjevi/:id"
              render={(props) =>
                  <VPSPage
                    {...propsPage}>
                    <ApprovedRequestHandler {...props}/>
                  </VPSPage>}/>
            <ProtectedRoute userDetails={userDetails} exact path="/ui/odobreni-zahtjevi/umirovljen/:id"
              render={(props) =>
                  <VPSPage
                    {...propsPage}>
                    <ViewSingleRequest {...props}/>
                  </VPSPage>}/>
            <ProtectedRoute userDetails={userDetails} exact path="/ui/odbijeni-zahtjevi"
              render={(props) =>
                  <VPSPage
                    {...propsPage}>
                    <RejectedRequests {...props}/>
                  </VPSPage>}/>
            <ProtectedRoute userDetails={userDetails} exact path="/ui/odbijeni-zahtjevi/:id"
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
            <Route exact path="/ui/stanje-zahtjeva/umirovljen/:id"
              render={(props) =>
                  <VPSPage
                    {...propsPage}>
                    <ViewSingleRequest {...props}/>
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
