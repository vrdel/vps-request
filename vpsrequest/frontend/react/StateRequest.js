import React, { Component } from 'react';
import { Backend } from './DataManager';
import { BaseView, LoadingAnim } from './UIElements';
import ReactTable from 'react-table';
import {Link} from 'react-router-dom';

import 'react-table/react-table.css';


export class StateRequest extends Component
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
      Promise.all([this.backend.fetchData(`${this.apiListRequests}/${sessionActive.userdetails.username}`)])
        .then(([requests]) => this.setState({
          listMyRequests: requests,
          userDetails: sessionActive.userdetails,
          loading: false
        }))
    )
  }

  render() {
    const {loading, listMyRequests, userDetails} = this.state

    if (loading)
      return (<LoadingAnim />)

    else if (!loading && listMyRequests && userDetails) {
      const columns = [
        {
          id: 'cardNumber',
          Header: 'r. br.',
          accessor: r => listMyRequests.indexOf(r) + 1
        },
        {
          Header: 'Odobreno',
          accessor: 'approved'
        },
        {
          Header: 'Datum podnošenja',
          accessor: 'request_date'
        },
        {
          Header: 'Ustanova',
          accessor: 'head_institution'
        },
        {
          id: 'contactNameLastName',
          Header: 'Kontaktna osoba',
          accessor: r => `${userDetails.first_name} ${userDetails.last_name}`
        },
        {
          Header: 'Poslužitelj',
          accessor: 'vm_fqdn'
        }
      ]
      return (
        <BaseView
          title='Stanje zahtjeva'
          location={this.location}>
          <ReactTable
            data={listMyRequests}
            columns={columns}
            className="-striped -highlight"
            defaultPageSize={20}
          />
        </BaseView>
      )
    }
    else
      return null
  }
}

export default StateRequest;
