import React, { Component } from 'react';
import { Backend } from './DataManager';
import { BaseView, LoadingAnim, DateFormatHR } from './UIElements';
import ReactTable from 'react-table';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCog,
  faPencilAlt,
  } from '@fortawesome/free-solid-svg-icons';

import 'react-table/react-table.css';
import './StateRequest.css'

export class FreshRequest extends Component
{
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      newRequests: null
    }

    this.apiListRequests = '/api/v1/internal/requests/new'

    this.location = props.location;
    this.backend = new Backend();
  }

  componentDidMount() {
    this.setState({loading: true})
    this.fetchDataFromAPI().then();
  }

  async fetchDataFromAPI(){
    const sessionActive = await this.backend.isActiveSession();
    if(sessionActive.active){
      const newReq = await this.backend.fetchData(this.apiListRequests);
      this.setState({
        newRequests: newReq,
        loading: false
      })
    }
  }

  render() {
    const {loading, newRequests} = this.state

    if (loading)
      return (<LoadingAnim />)

    else if (!loading && newRequests) {
      const columns = [
        {
          id: 'cardNumber',
          Header: 'r. br.',
          accessor: r => Number(newRequests.indexOf(r) + 1),
          maxWidth: 50,
        },
        {
          id: 'isApproved',
          Header: 'Odobreno',
          accessor: () => {
                return (<FontAwesomeIcon className="text-warning" size="2x" icon={faCog}/>)
          },
          maxWidth: 100,
        },
        {
          id: 'requestDate',
          Header: 'Datum podnošenja',
          accessor: r => r.request_date,
          Cell: r => <span>{DateFormatHR(r.original.request_date)}</span>
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
          title='Novi zahtjevi'
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

export default FreshRequest;
