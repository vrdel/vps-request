import React, { useState } from 'react';
import Cookies from 'universal-cookie';
import {
  Alert,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  Navbar,
  NavbarBrand,
  Spinner,
  Row,
  UncontrolledTooltip,
  Popover,
  PopoverBody,
  Badge
} from 'reactstrap';
import { Link, withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSignOutAlt,
  faFileAlt,
  faFileSignature,
  faHandshake,
  faUserEdit,
  faThumbsDown,
  faBatteryHalf,
  faCouch,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import { NotificationManager } from 'react-notifications';
import { Field } from 'formik';
import SrceLogo from './logos/pravisrce.png';
import SrceLogoTiny from './logos/srce-logo-e-mail-sig.png';
import CloudLogo from './logos/logo_cloud.png';
import { canApprove, elemInArray } from './Util';
import { RelativePath, CONFIG } from './Config';
import { Helmet } from "react-helmet";

import './UIElements.css';


var staffPages = ['odobreni-zahtjevi', 'odbijeni-zahtjevi',
                  'predumirovljenje'];
var noStaffPages = ['aktivni-posluzitelji', 'stanje-zahtjeva']

var linkTitle = new Map();
linkTitle.set('novi-zahtjevi', 'Novi zahtjevi');
linkTitle.set('odobreni-zahtjevi', 'Odobreni zahtjevi');
linkTitle.set('odbijeni-zahtjevi', 'Odbijeni zahtjevi');
linkTitle.set('predumirovljenje', 'Pred umirovljenje');
linkTitle.set('aktivni-posluzitelji', 'Aktivni VM-ovi');
linkTitle.set('novi-zahtjev', 'Zahtjev za novim VM-om');
linkTitle.set('stanje-zahtjeva', 'Stanje zahtjeva');


export const Icon = props => {
  let linkIcon = new Map();
  linkIcon.set('novi-zahtjevi', faFileAlt);
  linkIcon.set('odobreni-zahtjevi', faHandshake);
  linkIcon.set('odbijeni-zahtjevi', faThumbsDown);
  linkIcon.set('novi-zahtjev', faFileSignature);
  linkIcon.set('stanje-zahtjeva', faBatteryHalf);
  linkIcon.set('predumirovljenje', faCouch);
  linkIcon.set('aktivni-posluzitelji', faBatteryHalf);

  return <FontAwesomeIcon
            icon={linkIcon.get(props.i)}
            size='1x' fixedWidth/>
}

export const DropDown = ({field, data=[], ...props}) =>
  <Field component="select"
    name={field.name}
    required={true}
    className={`form-control custom-select`}
    {...props}
  >
    {
      data.map((name, i) =>
        i === 0 ?
          <option key={i} hidden>{name}</option> :
          <option key={i} value={name}>{name}</option>
      )
    }
  </Field>


async function doLogout(history, onLogout) {
  let cookies = new Cookies();


  let response = await fetch(`${RelativePath}/rest-auth/logout/`, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-CSRFToken': cookies.get('csrftoken'),
      'Referer': 'same-origin'
    }})

  onLogout()

  cookies.remove('alertDismiss')
  history.push('/ui/proxy')

  if (response.ok)
    setTimeout(() => {
        window.location = CONFIG.logoutRedirect
    }, 50)
}


export const InfoLink = ({prefix='', suffix='', linkTitle='', linkHref}) => (
  <React.Fragment>
    {prefix}
    <a href={linkHref} target="_blank" rel="noopener noreferrer">{!linkTitle ? linkHref : linkTitle}</a>
    {suffix}
  </React.Fragment>
)


export const ModalAreYouSure = ({isOpen, toggle, title, msg, onYes}) => (
  <Modal isOpen={isOpen} toggle={toggle}>
    <ModalHeader toggle={toggle}>{title}</ModalHeader>
    <ModalBody>
      {msg}
    </ModalBody>
    <ModalFooter>
      <Button color="primary" onClick={() => {
        onYes();
        toggle();
      }}>Da</Button>{' '}
      <Button color="secondary" onClick={toggle}>Ne</Button>
    </ModalFooter>
  </Modal>
)


const UserDetailsPopover = ({userDetails}) => {
  let approveRequest = canApprove(userDetails)

  return (
    <React.Fragment>
      <div className="text-center">
        {
        approveRequest ?
          <Badge color="warning" className="mb-1 mt-1" style={{fontSize: '100%'}} pill>
            Odobravatelj zahtjeva
          </Badge>
        :
          userDetails.is_staff ?
            <Badge color="success" className="mb-1 mt-1" style={{fontSize: '100%'}} pill>
              VPS Administrator
            </Badge>
          :
            <Badge color="primary" className="mb-1 mt-1" style={{fontSize: '100%'}} pill>
              Korisnik
            </Badge>
      }
      </div>
      {
        <div className="text-center mt-1">
          <b>{userDetails.first_name}{' '}{userDetails.last_name}</b>
        </div>
      }
      {
        <div className="text-center text-primary mt-1">
          {userDetails.aaieduhr}
        </div>
      }
    </React.Fragment>

  )
}


const NavigationBar = ({history, onLogout, isOpenModal, toggle, titleModal,
  msgModal, userDetails}) =>
{
  const [popoverOpen, setPopoverOpen] = useState(false)

  return (
    <React.Fragment>
      <ModalAreYouSure
        isOpen={isOpenModal}
        toggle={toggle}
        title={titleModal}
        msg={msgModal}
        onYes={() => doLogout(history, onLogout)} />
      <Navbar expand="md" id="vpsreq-nav" className="border rounded d-flex justify-content-between pt-3 pb-3">
        <NavbarBrand href="https://www.srce.unizg.hr/cloud/vps"
          target="_blank" rel="noopener noreferrer" className="text-dark">
          <img src={CloudLogo} id="cloud logo" alt="O usluzi VPS"/>
        </NavbarBrand>
        <Nav navbar className="m-1">
          <span className="pl-3 font-weight-bold text-center">
            <h2>
              Zahtjev za virtualnim poslužiteljem (VM) u usluzi Virtual Private Server
            </h2>
          </span>
        </Nav>
        <Nav navbar >
          <NavItem className='m-2 text-dark'>
            <React.Fragment>
              Dobrodošli,
              <br/>
              <span onClick ={() => setPopoverOpen(!popoverOpen)}
                id="userPopover">
                <Badge href="#" color="light" style={{fontSize: '100%'}}>
                  <strong>{userDetails.first_name}</strong>
                </Badge>
              </span>
              <Popover placement="bottom" isOpen={popoverOpen}
                target="userPopover" toggle={() => setPopoverOpen(!popoverOpen)}>
                <PopoverBody>
                  <UserDetailsPopover userDetails={userDetails}/>
                </PopoverBody>
              </Popover>
            </React.Fragment>
          </NavItem>
          <NavItem className='m-2 text-light'>
            <Button
              size="sm"
              aria-label="Odjava"
              className='btn-danger'
              onClick={() => toggle()}>
              <FontAwesomeIcon icon={faSignOutAlt} color="white" />
            </Button>
          </NavItem>
        </Nav>
      </Navbar>
    </React.Fragment>
  )
}


const NavigationLinks = ({location, isStaff, canApproveRequest, showActiveVm}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggle = () => setDropdownOpen(!dropdownOpen);
  const NoStaffNavLinks = () =>
    noStaffPages.map((item, i) =>
      item === 'aktivni-posluzitelji' && !showActiveVm
      ?
        ''
      :
        item === 'novi-zahtjev'
        ?
          <NavItem key={i} className='mt-1'>
            <NavLink
              active={false}
              className={location.pathname.split('/')[2] === item ? "text-dark" : "text-dark"}
              to=''><Icon i={item}/> {linkTitle.get(item)}
            </NavLink>
          </NavItem>
        :
          <NavItem key={i} className='mt-1'>
            <NavLink
              tag={Link}
              active={location.pathname.split('/')[2] === item ? true : false}
              className={location.pathname.split('/')[2] === item ? "text-white bg-info" : "text-dark"}
              to={'/ui/' + item}><Icon i={item}/> {linkTitle.get(item)}
            </NavLink>
          </NavItem>
  )
  const StaffNavLinks = () => (
    <React.Fragment>
      {
        staffPages.map((item, i) =>
          item === 'novi-zahtjev'
          ?
            <NavItem key={i} className='mt-1'>
              <NavLink
                active={false}
                className={location.pathname.split('/')[2] === item ? "text-dark" : "text-dark"}
                to=''><Icon i={item}/> {linkTitle.get(item)}
              </NavLink>
            </NavItem>
          :
            <NavItem key={i} className='mt-1'>
              <NavLink
                tag={Link}
                active={location.pathname.split('/')[2] === item ? true : false}
                className={location.pathname.split('/')[2] === item ? "text-white bg-info" : "text-dark"}
                to={'/ui/' + item}><Icon i={item}/> {linkTitle.get(item)}
              </NavLink>
            </NavItem>)
      }
      <Dropdown isOpen={dropdownOpen} toggle={toggle} className='mt-1 text-dark'>
        <DropdownToggle nav caret className={elemInArray(location.pathname.split('/')[2], noStaffPages) ? "text-white bg-info" : "text-dark"}>
          <FontAwesomeIcon icon={faUserEdit}/> Korisnikove forme
        </DropdownToggle>
        <DropdownMenu>
          {
            noStaffPages.map((item, i) =>
              item === 'aktivni-posluzitelji' && !showActiveVm
            ?
                ''
            :
                <DropdownItem key={i} id='vpsreq-navlinks-dropdown'>
                  <Link id='vpsreq-navlinks-dropdown' to={'/ui/' + item} className="text-dark">
                    <Icon i={item}/> {linkTitle.get(item)}
                  </Link>
                </DropdownItem>
          )
        }
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  )

  return (
    <>
      <Alert color="danger" className="m-0 p-3">
        <FontAwesomeIcon size="lg" icon={faInfoCircle}/>{'  '}
        Od 3. travnja dostupna je usluga VDC{' '}
        <a href="https://www.srce.hr/vdc" target="_blank" rel="noopener noreferrer">
          (https://www.srce.hr/vdc)
        </a>
        {' '}koja zamjenjuje uslugu VPS, pa vas molim da kreirate novi resurs u usluzi VDC.
      </Alert>
      <Nav tabs id="vpsreq-navlinks" className="d-flex justify-content-center border-left border-right border-top rounded-top sticky-top">
        {
          !isStaff && !canApproveRequest ?
            <NoStaffNavLinks/>
          :
            <StaffNavLinks/>
        }
      </Nav>
    </>
  )
}


const NavigationBarWithRouter = withRouter(NavigationBar);
const NavigationLinksWithRouter = withRouter(NavigationLinks);
const VPSPageBase = ({location, toggleAreYouSure, onLogout, areYouSureModal, userDetails, children}) => (
  <Container>
    <Helmet>
      <title>{`${linkTitle.get(location.pathname.split('/')[2])} | VPS Zahtjev`}</title>
    </Helmet>
    <Row>
      <Col>
        <NavigationBarWithRouter
          onLogout={onLogout}
          isOpenModal={areYouSureModal}
          toggle={toggleAreYouSure}
          titleModal='Odjava'
          msgModal='Da li ste sigurni da se želite odjaviti?'
          userDetails={userDetails}/>
      </Col>
    </Row>
    <Row className="no-gutters">
      <Col>
        <NavigationLinksWithRouter
          isStaff={userDetails.is_staff}
          canApproveRequest={canApprove(userDetails)}
          showActiveVm={userDetails.vmisactive_navlink} />
        {children}
      </Col>
    </Row>
    <Row>
      <Col>
        <Footer loginPage={false}/>
      </Col>
    </Row>
  </Container>
)
export const VPSPage = withRouter(VPSPageBase);


export const Footer = ({loginPage=false}) => {
  const InnerFooter = ({border=false, img=undefined}) =>
  (
    <React.Fragment>
      <div className={`text-center ${border && 'pt-1 pb-2'}`}>
        <a href="https://www.srce.unizg.hr/" target="_blank" rel="noopener noreferrer">
          <img src={img} id="srcelogo" alt="SRCE Logo"/>
        </a>
      </div>
    </React.Fragment>
  )

  if (!loginPage) {
    return (
      <div id="vpsreq-footer" className="align-self-center border rounded pristupacnost">
        <div className="text-center mt-2">
          <Link to="/ui/izjava-pristupacnost">
            Izjava o pristupačnosti
          </Link>
        </div>
        <InnerFooter border={true} img={SrceLogo}/>
      </div>
    )
  }
  else {
    return (
      <div id="vpsreq-loginfooter">
        <InnerFooter img={SrceLogoTiny} />
      </div>
    )
  }
}


export const RequestHorizontalRule = () => (
  <div className="m-5">
    <hr/>
  </div>
)


export const RequestStateDivider = ({state='danger'}) => {
  let color = {
    success: "#28a745",
    danger: "#dc3545"
  }

  return (
    <div className="m-5">
      <hr style={{'borderTop': `2px dotted ${color[state]}`}}/>
    </div>
  )
}


export const LoadingAnim = () => (
  <Card className="text-center">
    <CardHeader className="bg-light">
      <h4 className="text-dark">Učitavanje podataka...</h4>
    </CardHeader>
    <CardBody>
      <Spinner style={{ width: '10rem', height: '10rem' }} type="grow" color="info" />
    </CardBody>
  </Card>
)


export const NotifyOk = ({msg='', title='', callback=undefined}) => {
  NotificationManager.success(msg,
    title,
    30000);
  setTimeout(callback, 1000);
}


export const NotifyError = ({msg='', title='', callback=undefined}) => {
  <button className='btn btn-danger'/>
    NotificationManager.error(msg,
      title,
      30000);
    setTimeout(callback, 1000);
}


export const BaseView = ({title='', isChangeView=false, isHandleNewView=false,
  isHandleApprovedView = false, isIssuedVMView=false, modal=false,
  toggle=undefined, alertdismiss=undefined, alertmsg=undefined, alert=false,
  nopaddingside=false, state=undefined, children}) =>
{
  let bgTitle = "bg-light"

  if (isChangeView)
    bgTitle = "bg-danger text-white"

  if (isHandleNewView || isIssuedVMView)
    bgTitle = "bg-success text-white"

  if (isHandleApprovedView)
    bgTitle = "bg-primary text-white"

  return (
    <React.Fragment>
      {
        modal &&
        <ModalAreYouSure
          isOpen={state.areYouSureModal}
          toggle={toggle}
          title={state.modalTitle}
          msg={state.modalMsg}
          onYes={state.modalFunc} />
      }
      <div id="vpsreq-contentwrap" className={`${nopaddingside ? 'pl-1 pr-1 ' : 'pl-4 pr-4 '}` + "pb-4 pt-3 border rounded pristupacnost"}>
        <Row>
          {
            <Col md={{size: 6, offset: 3}}>
              <Alert className="text-center" color="danger" isOpen={alert} toggle={alertdismiss}>
                {alertmsg}
              </Alert>
            </Col>
          }
        </Row>
        <Row>
          <Col>
            {
              <div className={`"shadow-sm p-2 mb-2 rounded " ${bgTitle}`}>
                <h3>{title}</h3>
              </div>
            }
          </Col>
        </Row>
        <Row>
          <Col>
            {children}
          </Col>
        </Row>
      </div>
    </React.Fragment>
  )
}


export const Status = ({params, renderToolTip=false}) => (
  <div>
    <FontAwesomeIcon className={params['classname']} size="2x" icon={params['icon']} id={params['id']}/>
    {
      renderToolTip &&
        <UncontrolledTooltip placement="right"
          target={params['id']}>
          {params['label']}
        </UncontrolledTooltip>
    }
  </div>
)
