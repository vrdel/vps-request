import React from 'react';
import Cookies from 'universal-cookie';
import {
  Alert,
  Button,
  Breadcrumb,
  BreadcrumbItem,
  Card,
  CardHeader,
  CardBody,
  Nav,
  NavLink,
  NavItem,
  NavbarBrand,
  Navbar,
  NavbarToggler,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Collapse} from 'reactstrap';
import {Link} from 'react-router-dom';
import './UIElements.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSignOutAlt,
  faSearch,
  faWrench,
  faFileAlt} from '@fortawesome/free-solid-svg-icons';
import { NotificationManager } from 'react-notifications';
import { Field } from 'formik';
import Autocomplete from 'react-autocomplete';
import { Backend } from './DataManager';


var list_pages = ['administration','requests'];

var link_title = new Map();
link_title.set('administration', 'Administracija');
link_title.set('requests', 'Zahtjevi');


export const Icon = props =>
{
  let link_icon = new Map();
  link_icon.set('administration', faWrench);
  link_icon.set('requests', faFileAlt);
}


export const DropDown = ({field, data=[], prefix="", class_name="", isnew=false}) =>
  <Field component="select"
    name={prefix ? `${prefix}.${field.name}` : field.name}
    required={true}
    className={`form-control ${class_name} ${isnew ? 'border-success' : ''}`}
  >
    {
      data.map((name, i) =>
        i === 0 ?
        <option key={i} hidden>{name}</option> :
        <option key={i} value={name}>{name}</option>
      )
    }
  </Field>


export const SearchField = ({form, field, ...rest}) =>
  <div className="input-group">
    <input type="text" placeholder="Search" {...field} {...rest}/>
    <div className="input-group-append">
      <span className="input-group-text" id="basic-addon">
        <FontAwesomeIcon icon={faSearch}/>
      </span>
    </div>
  </div>


const doLogout = (history, onLogout) =>
{
  let cookies = new Cookies();

  onLogout();

  return fetch('/rest-auth/logout/', {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-CSRFToken': cookies.get('csrftoken'),
      'Referer': 'same-origin'
    }}).then((response) => history.push('/ui/login'));
}


export const ModalAreYouSure = ({isOpen, toggle, title, msg, onYes}) =>
(
  <Modal isOpen={isOpen} toggle={toggle}>
    <ModalHeader toggle={toggle}>{title}</ModalHeader>
    <ModalBody>
      {msg}
    </ModalBody>
    <ModalFooter>
      <Button color="primary" onClick={() => {
        onYes();
        toggle();
      }}>Yes</Button>{' '}
      <Button color="secondary" onClick={toggle}>No</Button>
    </ModalFooter>
  </Modal>
)


export const CustomBreadcrumb = ({location, history}) =>
{
  let spliturl = location.pathname.split('/');
  let breadcrumb_elements = new Array();

  breadcrumb_elements.push({'url': '/ui/home', 'title': 'Home'});
  let two_level = new Object({'url': '/ui/' + spliturl[2]});
  two_level['title'] = link_title.get(spliturl[2]);
  breadcrumb_elements.push(two_level);

  if (spliturl.length > 3) {
    var three_level = new Object({'url': two_level['url'] + '/' + spliturl[3]});
    three_level['title'] = two_level['title'] === 'Administration' ? link_title.get(spliturl[3]) : spliturl[3];
    breadcrumb_elements.push(three_level)
  }

  if (spliturl.length > 4) {
    var four_level = new Object({'url': three_level['url'] + '/' + spliturl[4]});
    four_level['title'] = spliturl[4];
    breadcrumb_elements.push(four_level)
  }

  if (spliturl.length > 5) {
    var five_level = new Object({'url': four_level['url'] + '/' + spliturl[5]});
    five_level['title'] = spliturl[5];
    breadcrumb_elements.push(five_level);
  }

  if (spliturl.length > 6 && five_level['title'] === 'history') {
    var six_level = new Object({'url': five_level['url'] + '/' + spliturl[6]});
    six_level['title'] = spliturl[6];
    breadcrumb_elements.push(six_level);
  }

  return (
    <Breadcrumb id='vpsreq-breadcrumb' className="border-top rounded">
      {
        breadcrumb_elements.map((item, i) =>
          i !== breadcrumb_elements.length - 1
          ?
            <BreadcrumbItem key={i}>
              <Link to={item['url']}>{item['title']}</Link>
            </BreadcrumbItem>
          :
            <BreadcrumbItem key={i} active>
              {item['title']}
            </BreadcrumbItem>
        )
      }
    </Breadcrumb>
  );
}


export const NavigationBar = ({history, onLogout, isOpenModal, toggle, titleModal, msgModal}) =>
(
  <React.Fragment>
    <ModalAreYouSure
      isOpen={isOpenModal}
      toggle={toggle}
      title={titleModal}
      msg={msgModal}
      onYes={() => doLogout(history, onLogout)} />
    <Navbar expand="md" id="vpsreq-nav" className="border rounded">
      <NavbarBrand className="text-light">
        <span className="pl-3">
          Zahtjev za virtualnim poslužiteljem (VM) u usluzi Virtual Private Server
        </span>
      </NavbarBrand>
      <NavbarToggler/>
      <Collapse navbar className='justify-content-end'>
        <Nav navbar >
          <NavItem className='m-2 text-light'>
            Welcome, {localStorage.getItem('authUsername')}
          </NavItem>
          <NavItem className='m-2'>
            <Button
              id="vpsreq-navbar-logout"
              size="sm"
              onClick={() => toggle()}>
              <FontAwesomeIcon icon={faSignOutAlt} />
            </Button>
          </NavItem>
        </Nav>
      </Collapse>
    </Navbar>
  </React.Fragment>
)


export const NavigationLinks = ({location}) => {
  var data = undefined;
  data = list_pages

  return (
    <Nav vertical pills id="vpsreq-navlinks" className="border-left border-right border-top rounded-top sticky-top">
        {
          data.map((item, i) =>
            item === 'administration'
              ?
                localStorage.getItem('authIsSuperuser') === 'true'
                  ?
                    <NavItem key={i}>
                      <NavLink
                        tag={Link}
                        active={location.pathname.includes(item) ? true : false}
                        className={location.pathname.includes(item) ? "text-white bg-info" : "text-dark"}
                        to={'/ui/' + item}><Icon i={item}/> {link_title.get(item)}
                      </NavLink>
                    </NavItem>
                  :
                    null
              :
                <NavItem key={i}>
                  <NavLink
                    tag={Link}
                    active={location.pathname.split('/')[2] === item ? true : false}
                    className={location.pathname.split('/')[2] === item ? "text-white bg-info" : "text-dark"}
                    to={'/ui/' + item}><Icon i={item}/> {link_title.get(item)}
                  </NavLink>
                </NavItem>
          )
        }
      </Nav>
    )
}


const InnerFooter = ({border=false}) =>
(
  <React.Fragment>
    {
      border && <div className="pt-1"/>
    }
    <div className="text-center pt-1">
      <a href="http://www.srce.unizg.hr/" title="University computing centre">SRCE</a>&nbsp;
    </div>
  </React.Fragment>
)


export const Footer = ({loginPage=false}) =>
{
  if (!loginPage) {
    return (
      <div id="vpsreq-footer" className="border rounded">
        <InnerFooter border={true}/>
      </div>
    )
  }
  else {
    return (
      <div id="vpsreq-loginfooter">
        <InnerFooter />
      </div>
    )
  }
}


export const LoadingAnim = () =>
(
  <Card className="text-center">
    <CardHeader className="bg-light">
      <h4 className="text-dark">Loading data...</h4>
    </CardHeader>
    <CardBody>
      No anim
    </CardBody>
  </Card>
)


export const NotifyOk = ({msg='', title='', callback=undefined}) => {
  NotificationManager.success(msg,
    title,
    2000);
  setTimeout(callback, 2000);
}


export const BaseArgoView = ({resourcename='', location=undefined,
    infoview=false, addview=false, listview=false, modal=false,
    state=undefined, toggle=undefined, submitperm=true, history=true,
    addnew=true, clone=false, cloneview=false, tenantview=false, children}) =>
(
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
    <div className="d-flex align-items-center justify-content-between">
      {
        infoview ?
          <h2 className="ml-3 mt-1 mb-4">{resourcename}</h2>
        :
          addview ?
            <h2 className="ml-3 mt-1 mb-4">{`Add ${resourcename}`}</h2>
          :
            listview ?
              <React.Fragment>
                {
                  addnew ?
                    <h2 className="ml-3 mt-1 mb-4">{`Select ${resourcename} to change`}</h2>
                  :
                    <h2 className='ml-3 mt-1 mb-4'>{`Select ${resourcename} for details`}</h2>
                }
                {
                  addnew &&
                    <Link className="btn btn-secondary" to={location.pathname + "/add"} role="button">Add</Link>
                }
              </React.Fragment>
            :
              <React.Fragment>
                <h2 className="ml-3 mt-1 mb-4">{`Change ${resourcename}`}</h2>
              </React.Fragment>
      }
    </div>
    <div id="vpsreq-contentwrap" className="ml-2 mb-2 mt-2 p-3 border rounded">
      {
        !submitperm && !infoview && !listview &&
          <Alert color='danger'>
            <center>
              This is a read-only instance, please request the corresponding
              permissions to perform any changes in this form.
            </center>
          </Alert>
      }
      {children}
    </div>
  </React.Fragment>
)


function matchItem(item, value) {
  if (value)
    return item.toLowerCase().indexOf(value.toLowerCase()) !== -1;
}


export const AutocompleteField = ({lists, onselect_handler, field, val, icon, setFieldValue, req, label, values}) => {
  let classname = `form-control ${req && 'border-danger'}`;

  return(
    <Autocomplete
      inputProps={{className: classname}}
      getItemValue={(item) => item}
      items={lists}
      value={val}
      renderItem={(item, isHighlighted) =>
        <div
          key={lists.indexOf(item)}
          className={`vpsreq-autocomplete-entries ${isHighlighted ?
            "vpsreq-autocomplete-entries-highlighted"
            : ""}`
        }
        >
          {item ? <Icon i={icon}/> : ''} {item}
        </div>
      }
      renderInput={(props) => {
        if (label)
          return (
            <div className='input-group mb-3'>
              <div className='input-group-prepend'>
                <span className='input-group-text' id='basic-addon1'>{label}</span>
              </div>
              <input {...props} type='text' className={classname} aria-label='label'/>
            </div>
          );
        else
          return <input {...props}/>;
      }}
      onChange={(e) => {setFieldValue(field, e.target.value)}}
      onSelect={(val) =>  {
        setFieldValue(field, val)
        onselect_handler(field, val);
      }}
      wrapperStyle={{}}
      shouldItemRender={matchItem}
      renderMenu={(items) =>
        <div className='vpsreq-autocomplete-menu' children={items}/>
      }
    />
  );
};


export const DropdownFilterComponent = ({value, onChange, data}) => (
  <select
    onChange={onChange}
    style={{width: '100%'}}
    value={value}
  >
    <option key={0} value=''>Show all</option>
    {
      data.map((name, i) =>
        <option key={i + 1} value={name}>{name}</option>
      )
    }
  </select>
)