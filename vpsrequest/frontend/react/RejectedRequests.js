import React, { Component } from 'react';
import { Backend } from './DataManager';
import { BaseView, LoadingAnim, DateFormatHR } from './UIElements';
import ReactTable from 'react-table';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faPencilAlt,
  } from '@fortawesome/free-solid-svg-icons';

import 'react-table/react-table.css';
import './StateRequest.css'

export class RejectedRequest extends Component
{
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      newRequests: null
    }

    this.apiListRequests = '/api/v1/internal/reqlist/rejected'

    this.location = props.location;
    this.backend = new Backend();
  }

  componentDidMount() {
    this.setState({loading: true})

    this.backend.isActiveSession().then(sessionActive =>
      sessionActive.active &&
      Promise.all([this.backend.fetchData(`${this.apiListRequests}`)])
        .then(([requests]) => this.setState({
          newRequests: requests,
          userDetails: sessionActive.userdetails,
          loading: false
        }))
    )
  }

  render() {
    const {loading, newRequests, userDetails} = this.state

    if (loading)
      return (<LoadingAnim />)

    else if (!loading && newRequests && userDetails) {
      const columns = [
        {
          id: 'cardNumber',
          Header: 'r. br.',
          accessor: r => `${newRequests.indexOf(r) + 1}.`,
          maxWidth: 50,
        },
        {
          id: 'isApproved',
          Header: 'Odobreno',
          accessor: () => {
                return (<FontAwesomeIcon className="text-danger" size="2x" icon={faTimes}/>)
          },
          maxWidth: 100,
        },
        {
          id: 'requestDate',
          Header: 'Datum odbijanja',
          accessor: r => DateFormatHR(r.approved_date)
        },
        {
          Header: 'Ustanova',
          accessor: 'head_institution'
        },
        {
          id: 'contactNameLastName',
          Header: 'Kontaktna osoba',
          accessor: r => `${r.contact_name} ${r.contact_lastname}`
        },
        {
          Header: 'Poslužitelj',
          accessor: 'vm_host'
        },
        {
          id: 'edit',
          Header: 'Uredi',
          accessor: r => {
            return (
              <Link to={`/ui/stanje-zahtjeva/${r.id}`}>
                <FontAwesomeIcon className="text-success" size="lg" icon={faPencilAlt}/>
              </Link>
            )
          },
          maxWidth: 70
        }
      ]
      return (
        <BaseView
          title='Odbijeni zahtjevi'
          location={this.location}>
          <ReactTable
            data={newRequests}
            columns={columns}
            className="-highlight mt-4 text-center align-middle"
            defaultPageSize={10}
            previousText='Prethodni'
            nextText='Sljedeći'
            noDataText='Nema zahtjeva'
            pageText='Stranica'
            ofText='od'
            rowsText='zahtjeva'
            getTheadThProps={(state, rowInfo, column) => ({className: 'table-active p-2'})}
            getTdProps={(state, rowInfo, column) => ({className: 'pt-2 pb-2 align-self-center'})}
          />
        </BaseView>
      )
    }
    else
      return null
  }
}

export default RejectedRequest;
