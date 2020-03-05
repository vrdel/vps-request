import React, { Component } from 'react';
import { Backend } from './DataManager';
import { BaseView, LoadingAnim, DateFormatHR } from './UIElements';
import ReactTable from 'react-table';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCog,
  faPencilAlt,
  faTimes,
  faCheck
  } from '@fortawesome/free-solid-svg-icons';

import 'react-table/react-table.css';
import './ApprovedRequest.css'

export class ApprovedRequest extends Component
{
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      listMyRequests: null
    }

    this.apiListRequests = '/api/v1/internal/requests'

    this.location = props.location;
    this.backend = new Backend();
  }

  componentDidMount() {
    this.setState({loading: true})

    this.backend.isActiveSession().then(sessionActive =>
      sessionActive.active &&
      Promise.all([this.backend.fetchData(`${this.apiListRequests}/approved`)])
        .then(([requests]) => this.setState({
          listApprovedRequests: requests,
          userDetails: sessionActive.userdetails,
          loading: false
        }))
    )
  }

  render() {
    const {loading, listApprovedRequests, userDetails} = this.state

    if (loading)
      return (<LoadingAnim />)

    else if (!loading && listApprovedRequests && userDetails) {
      const columns = [
        {
          id: 'cardNumber',
          Header: 'r. br.',
          accessor: r => `${listApprovedRequests.length - listApprovedRequests.indexOf(r)}.`,
          maxWidth: 50,
        },
        {
          id: 'isApproved',
          Header: 'Odobreno',
          accessor: r => <FontAwesomeIcon className="text-success" size="2x" icon={faCheck}/>,
          maxWidth: 100,
        },
        {
          id: 'requestDate',
          Header: 'Datum odobrenja',
          accessor: r => DateFormatHR(r.approved_date)
        },
        {
          Header: 'Ustanova',
          accessor: 'head_institution'
        },
        {
          id: 'contactNameLastName',
          Header: 'Kontaktna osoba',
          accessor: r => `${r.user.first_name} ${r.user.last_name}`
        },
        {
          Header: 'Poslužitelj',
          accessor: 'vm_fqdn'
        },
        {
          id: 'edit',
          Header: 'Uredi',
          accessor: r => {
            return (
              <Link to={`/ui/odobreni-zahtjevi/${r.id}`}>
                <FontAwesomeIcon className="text-success" size="lg" icon={faPencilAlt}/>
              </Link>
            )
          },
          maxWidth: 70
        }
      ]
      return (
        <BaseView
          title='Odobreni zahtjevi'
          location={this.location}>
          <ReactTable
            data={listApprovedRequests}
            columns={columns}
            className="-highlight mt-4 text-center align-middle"
            defaultPageSize={100}
            previousText='Prethodni'
            nextText='Sljedeći'
            noDataText='Nema zahtjeva'
            pageText='Stranica'
            ofText='od'
            rowsText='zahtjeva'
            getTheadThProps={() => ({className: 'table-active p-2'})}
            getTdProps={() => ({className: 'pt-2 pb-2 align-self-center'})}
          />
        </BaseView>
      )
    }
    else
      return null
  }
}

export default ApprovedRequest;
