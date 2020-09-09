import React from 'react';
import {
  Alert,
  Button,
  Col,
  CustomInput,
  FormGroup,
  Label,
  Row,
} from 'reactstrap';
import {
  DropDown,
  InfoLink,
  RequestStateDivider,
  RequestHorizontalRule,
} from './UIElements.js';
import { Field } from 'formik';
import './Request.css';


export const RowRequestDropDown = ({field, ...propsRest}) =>
(
  <Row className="form-group align-items-center">
    <Col md={{size: 2, offset: 1}} className="d-flex justify-content-end">
      <Label
        for={propsRest.labelFor}
        className="mr-2 text-right"
      >
        {propsRest.label}
        <span className="ml-1 text-danger">*</span>
      </Label>
    </Col>
    <Col md={{size: 7}}>
      <DropDown
        field={field}
        data={propsRest.data}
        id={propsRest.labelFor}
        disabled={propsRest.disabled}
      />
      {
        propsRest.infoMsg ?
          <div id="vpsreq-field-infomsg" className="pristupacnost">
            {propsRest.infoMsg}
          </div>
          : null
      }
    </Col>
  </Row>
)


export const RowRequestField = ({field, ...propsRest}) =>
(
  <Row className={`${propsRest.plain ? "from-group mb-2" : "form-group align-items-center"}`}>
    <Col md={{size: 2, offset: 1}} className="d-flex justify-content-end">
      <Label
        htmlFor={propsRest.labelFor}
        aria-label={propsRest.labelFor}
        className="mr-2 text-right">
        {propsRest.label}
        {
          propsRest.required ?
            <span className="ml-1 text-danger">*</span>
            :
            null
        }
      </Label>
    </Col>
    <Col md={{size: 7}}>
      {
      propsRest.fieldType === 'textarea' ?
        <div>
          <textarea
            id={propsRest.labelFor}
            className="form-control"
            required={propsRest.required ? true : false}
            disabled={propsRest.disabled ? true : false}
            rows="5"
            {...field}/>
          {
            propsRest.infoMsg ?
              <div id="vpsreq-field-infomsg" className="pristupacnost">
                {propsRest.infoMsg}
              </div>
              : null
          }
        </div>
        :
        <div>
          {
            propsRest.plain ?
              <span>
                {field.value}
              </span>
            :
              <input
              id={propsRest.labelFor}
              aria-label={propsRest.labelFor}
              type={propsRest.fieldType}
              className="form-control"
              required={propsRest.required ? true : false}
              disabled={propsRest.disabled ? true : false}
              {...field}/>
          }
          {
            propsRest.infoMsg ?
              <div id="vpsreq-field-infomsg" className="pristupacnost">
                {propsRest.infoMsg}
              </div>
              :
              propsRest.infoMsgComponent ?
                <div id="vpsreq-field-infomsg" className="pristupacnost">
                  {propsRest.infoMsgComponent}
                </div>
                : null
          }
        </div>
    }
    </Col>
  </Row>
)


export const ContactUserFields = ({disabled=true}) =>
(
  <React.Fragment>
    <h4 className="mb-3 mt-4">Kontaktna osoba Ustanove</h4><br/>
    <Field name="first_name" component={RowRequestField} label="Ime:" labelFor="firstNameContact" fieldType="text" disabled={disabled}/>
    <Field name="last_name" component={RowRequestField} label="Prezime:" labelFor="lastNameContact" fieldType="text" disabled={disabled}/>
    <Field name="institution" component={RowRequestField} label="Ustanova:" labelFor="institutionContact" fieldType="text" disabled={disabled}/>
    <Field name="role" component={RowRequestField} label="Funkcija:" labelFor="roleContact" fiedType="text" disabled={disabled}/>
    <Field name="email" component={RowRequestField} label="Email:" labelFor="emailContact" fieldType="text" disabled={disabled}/>
    {
      !disabled &&
        <Field name="aaieduhr" component={RowRequestField} label="AAI@EduHR korisnička oznaka:" labelFor="aaieduhrContact" fieldType="text" disabled={disabled}/>
    }
  </React.Fragment>
)


export const VMFields = ({listVMOSes, disabled=false}) => {
  let infoVMOS = "Čelnik ustanove odgovara za posjedovanje i aktiviranje valjane licence za gore odabrani operacijski sustav."
  let infoPurpose = "Potrebno je detaljno obrazložiti namjenu virtualnog poslužitelja. Zahtjev može biti odbijen ukoliko Srce procijeni da navedena namjena virtualnog poslužitelja nije primjerena namjeni usluge, ili ne predstavlja trajne potrebe ustanove za poslužiteljskim kapacitetima.";

  return (
    <React.Fragment>
      <RequestHorizontalRule/>
      <h4 className="mb-3 mt-4">Zahtijevani resursi</h4><br/>
      <Field name="vm_purpose" component={RowRequestField} label="Namjena:"
        labelFor="vmPurpose" fieldType="textarea" infoMsg={infoPurpose}
        required={true} disabled={disabled}/>
      <Field name="vm_fqdn" component={RowRequestField} label="Puno ime poslužitelja (FQDN):"
        labelFor="fqdn" fieldType="text" required={true}
        disabled={disabled}/>
      <Field name="vm_os" component={RowRequestDropDown}
        label="Operacijski sustav:"
        labelFor="vm_oses"
        data={['', ...listVMOSes]}
        infoMsg={infoVMOS}
        required={true}
        disabled={disabled}/>
      <Field name="vm_remark" component={RowRequestField} label="Napomena:"
        labelFor="vmRemark" fieldType="textarea"
        disabled={disabled}/>
    </React.Fragment>
  )
}


export const SysAdminFields = ({disabled=false}) => {
  let infoAAI = "Sistem-inženjer jedini ima pravo pristupa na XenOrchestra sučelje dostupno na adresi "
  return (
    <React.Fragment>
      <RequestHorizontalRule/>
      <h4 className="mb-3 mt-4">Sistem-inženjer virtualnog poslužitelja</h4><br/>
      <Field name="sys_firstname" component={RowRequestField} label="Ime:" labelFor="firstNameSys" fieldType="text" required={true} disabled={disabled}/>
      <Field name="sys_lastname" component={RowRequestField} label="Prezime:" labelFor="lastNameSys" fieldType="text" required={true} disabled={disabled}/>
      <Field name="sys_institution" component={RowRequestField} label="Ustanova:" labelFor="institutionSys" fieldType="text" required={true} disabled={disabled}/>
      <Field name="sys_role" component={RowRequestField} label="Funkcija:" labelFor="roleSys" fiedType="text" required={true} disabled={disabled}/>
      <Field name="sys_email" component={RowRequestField} label="Email:" labelFor="emailSys" fieldType="text" required={true} disabled={disabled}/>
      <Field name="sys_aaieduhr"
        component={RowRequestField}
        label="AAI@EduHr korisnička oznaka:" labelFor="aaieduhrSys"
        fieldType="text"
        infoMsgComponent={<InfoLink prefix={infoAAI} linkHref="https://vps.srce.hr"/>}
        required={true}
        disabled={disabled}/>
    </React.Fragment>
  )
}


export const HeadFields = ({disabled=false, institutionDisabled=true}) =>
(
  <React.Fragment>
    <RequestHorizontalRule/>
    <h4 className="mb-3 mt-4">Čelnik ustanove</h4><br/>
    <Field name="head_firstname" component={RowRequestField} label="Ime:" labelFor="firstNameHead" fieldType="text" required={true} disabled={disabled}/>
    <Field name="head_lastname" component={RowRequestField} label="Prezime:" labelFor="lastNameHead" fieldType="text" required={true} disabled={disabled}/>
    <Field name="head_institution" component={RowRequestField} label="Ustanova:" labelFor="institutionHead" fieldType="text" required={true} disabled={institutionDisabled}/>
    <Field name="head_role" component={RowRequestField} label="Funkcija:" labelFor="roleHead" fiedType="text" required={true} disabled={disabled}/>
    <Field name="head_email" component={RowRequestField} label="Email:" labelFor="emailHead" fieldType="text" required={true} disabled={disabled}/>
  </React.Fragment>
)


export const RequestDateField = () =>
(
  <React.Fragment>
    <div className="mt-5">
      <Field name="request_date" component={RowRequestField} label="Datum podnošenja:" labelFor="dateRequest" fieldType="text" disabled={true} required={true} plain={true}/>
    </div>
    <RequestHorizontalRule/>
  </React.Fragment>
)


export const StateFields = ({readOnly, requestApproved}) =>
{
  let approved = [1, 2, 3].indexOf(requestApproved) !== -1 ? true : false

  return (
    <React.Fragment>
      <RequestStateDivider/>
      <h4 className="mb-3 mt-4">Stanje</h4><br/>
      <Field name="timestamp" component={RowRequestField} label="Datum promjene:" labelFor="timestamp" fieldType="text" disabled={readOnly} plain={true}/>
      <Row>
        <Col md={{size: 2, offset: 1}} className="d-flex justify-content-end">
          <Label
            htmlFor="checkboxApproved"
            aria-label="checkboxApproved"
            className="mr-2">
            Zahtjev odobren:
          </Label>
        </Col>
        <Col md={{size: 7}}>
          <CustomInput type="checkbox" id="checkApproved" aria-label="checkboxApproved" checked={approved} readOnly={true} onChange={undefined}/>
        </Col>
      </Row>
      <Field name="vm_reason" component={RowRequestField} label="Poruka:" labelFor="vmReason" fieldType="textarea" disabled={readOnly}/>
      <Field name="approvedby" component={RowRequestField} label="Obradio:" labelFor="approvedBy" fieldType="text" disabled={readOnly} plain={true}/>
      <Field name="vm_admin_remark" component={RowRequestField} label="Napomena:" labelFor="vmAdminRemark" fieldType="textarea" disabled={readOnly}/>
      <Field name="vm_ip" component={RowRequestField} label="IP adresa:" labelFor="vmIp" fieldType="text" disabled={readOnly} required={true}/>
    </React.Fragment>
  )
}


export const SubmitNewRequest = ({acceptConditions, handleAcceptConditions, dismissAlert, stateAcceptConditionsAlert}) =>
(
  <React.Fragment>
    <RequestHorizontalRule/>
    <Row>
      <Col md={{size: 8, offset: 2}} className="text-center">
        <CustomInput type="checkbox" id="acceptedConditions" checked={acceptConditions} onChange={handleAcceptConditions}
          label={
            <InfoLink prefix="Prihvaćam "
              linkHref="https://www.srce.unizg.hr/files/srce/docs/cloud/pravilnik_usluge_vps.pdf"
              linkTitle="Pravilnik usluge Virtual Private Server, PDF, 8.642 KB"/>
          }
        />
      </Col>
    </Row>
    <Row>
      <Col md={{size: 4, offset: 4}}>
        <Alert className="mt-2" color="danger" isOpen={stateAcceptConditionsAlert} toggle={dismissAlert} fade={false}>
          <p className="text-center mt-3 ml-3">
            Morate prihvatiti pravilnik Usluge!
          </p>
        </Alert>
      </Col>
    </Row>
    <Row className="mt-2">
      <Col md={{size: 10, offset: 1}}>
        <p className="text-muted text-center">
          <small>
            Prihvaćanjem Pravilnika usluge od strane kontaktne osobe Ustanove smatra se da Ustanova i čelnik Ustanove potvrđuju i odgovaraju za istinitost podataka iz zahtjeva, da su upoznati s odredbama Pravilnika usluge, te da pristaju na korištenje usluge sukladno Pravilniku usluge.
          </small>
        </p>

        <p className="text-muted text-center">
          <small>
          Srce gore navedene osobne podatke obrađuje isključivo radi pružanja zatražene usluge, sukladno
            <InfoLink prefix=" svojoj "
              linkHref="https://www.srce.hr/politika-privatnosti"
              linkTitle="politici privatnosti"/>
            <InfoLink prefix=" i " linkHref="https://www.srce.unizg.hr/files/srce/docs/cloud/pravilnik_usluge_vps.pdf"
              linkTitle="Pravilniku usluge, PDF, 8.642 KB"/>
          </small>
        </p>
      </Col>
    </Row>
    <Row className="mt-2 mb-2 text-center">
      <Col>
        <Button className="btn-lg" color="success" id="submit-button" type="submit">Podnesi zahtjev</Button>
      </Col>
    </Row>
    <Row className="mt-3 mb-2">
      <Col md={{size: 10, offset: 1}}>
        <p className="text-muted text-center">
          <small>
            Kopija zahtjeva šalje se automatski putem e-maila kontaktnoj osobi i čelniku Ustanove.
          </small>
        </p>
      </Col>
    </Row>
  </React.Fragment>
)


export const SubmitChangeRequest = ({buttonLabel, disabled=false}) =>
(
  <React.Fragment>
    <RequestHorizontalRule/>
    <Row className="mt-2 mb-4 text-center">
      <Col>
        <Button className="btn-lg" color="success" id="submit-button"
          type="submit" disabled={disabled}>{buttonLabel}</Button>
      </Col>
    </Row>
  </React.Fragment>
)


export const ProcessFields = ({approved, handleState, handleMsgContact, handleMsgHead, stateMsgHead, stateMsgContact, canApproveRequest}) =>
(
  <React.Fragment>
    <RequestStateDivider/>
    <h4 className="mb-3 mt-4">Obrada</h4><br/>
    <Field name="vm_admin_remark" component={RowRequestField}
      label="Napomena:"
      labelFor="vmAdminRemark"
      fieldType="textarea"
      required={false}
      disabled={!canApproveRequest}/>
    <Row className="mb-3">
      <Col md={{size: 2, offset: 1}} className="d-flex justify-content-end align-items-center">
        <Label
          for='requestState'
          className='mr-2'>
          Stanje:
        </Label>
      </Col>
      <Col md={{size: 7}}>
        <FormGroup check>
          <CustomInput className="font-weight-bold m-2" type="radio" name="radioRequestState"
            checked={approved === -1}
            id="requestStateProcessing"
            onChange={() => handleState(-1)}
            label="U obradi"/>
        </FormGroup>
        <FormGroup check>
          <CustomInput className="font-weight-bold m-2" type="radio" name="radioRequestState"
            checked={approved === 1}
            id="requestStateEnabled"
            onChange={() => handleState(1)}
            label="Zahtjev odobren"/>
        </FormGroup>
        <FormGroup check>
          <CustomInput className="font-weight-bold m-2" type="radio" name="radioRequestState"
            checked={approved === 0}
            id="requestStateDenied"
            onChange={() => handleState(0)}
            label="Zahtjev nije odobren"/>
        </FormGroup>
      </Col>
    </Row>
    <Field name="vm_reason" component={RowRequestField}
      label="Razlog:"
      labelFor="vmReason"
      fieldType="textarea"
      required={canApproveRequest}
      disabled={!canApproveRequest}/>
    <div className="m-5"></div>
    <Row>
      <Col md={{size: 8, offset: 2}} className="text-center">
        <CustomInput className="m-2" type="checkbox" id="checkMsgContact" checked={stateMsgContact} onChange={handleMsgContact}
          label="Pošalju poruku kontaktnoj osobi kod spremanja promjena"
        />
      </Col>
    </Row>
    <Row>
      <Col md={{size: 8, offset: 2}} className="text-center">
        <CustomInput className="m-2" type="checkbox" id="checkMsgHead" checked={stateMsgHead} onChange={handleMsgHead}
          label="Pošalju poruku čelniku ustanove kod spremanja promjena"
        />
      </Col>
    </Row>
  </React.Fragment>
)
