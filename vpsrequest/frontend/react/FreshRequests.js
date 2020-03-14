import React, { Component } from 'react';
import { Backend } from './DataManager';
import { BaseView, LoadingAnim, DateFormatHR, FilterField } from './UIElements';
import ReactTable from 'react-table';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCog,
  faPencilAlt,
  faSearch,
  } from '@fortawesome/free-solid-svg-icons';
import { vpsFilterMethod } from './util'

import 'react-table/react-table.css';
import './StateRequest.css'

export class FreshRequest extends Component
{
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      newRequests: null,
      searchContactName: '',
      searchDate: '',
      searchInstitution: ''
    }

    this.apiListRequests = '/api/v1/internal/requests/new'

    this.location = props.location;
    this.backend = new Backend();
  }

  componentDidMount() {
    this.setState({
      loading: true,
    })
    this.fetchDataFromAPI()
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
    var {loading, newRequests, searchDate, searchContactName, searchVmHost,
      searchInstitution} = this.state

    if (searchDate && newRequests) {
      newRequests = newRequests.filter(
        r => DateFormatHR(r.request_date).indexOf(searchDate) !== -1
      )
    }

    if (searchContactName && newRequests) {
      newRequests = newRequests.filter(
        r => `${r.contact_name} ${r.contact_lastname}`.toLowerCase().includes(searchContactName.toLowerCase())
      )
    }

    if (searchInstitution && newRequests) {
      newRequests = newRequests.filter(
        r => r.head_institution.toLowerCase().includes(searchInstitution.toLowerCase())
      )
    }

    if (searchVmHost && newRequests) {
      newRequests = newRequests.filter(
        r => r.vm_host.toLowerCase().includes(searchVmHost.toLowerCase())
      )
    }

    if (loading)
      return (<LoadingAnim />)

    else if (!loading && newRequests) {
      const columns = [
        {
          id: 'cardNumber',
          Header: 'r. br.',
          accessor: r => Number(newRequests.indexOf(r) + 1),
          maxWidth: 50,
          filterable: true,
          Filter: () => <FontAwesomeIcon size="lg" icon={faSearch}/>
        },
        {
          id: 'isApproved',
          Header: 'Odobreno',
          accessor: () => <FontAwesomeIcon className="text-warning" size="2x" icon={faCog}/>,
          maxWidth: 90,
        },
        {
          id: 'requestDate',
          Header: 'Datum podnošenja',
          accessor: r => DateFormatHR(r.request_date),
          filterable: true,
          Filter: <FilterField
            value={this.state.searchDate}
            onChange={event => this.setState({searchDate: event.target.value})}
          />,
          maxWidth: 180
        },
        {
          Header: 'Ustanova',
          accessor: 'head_institution',
          filterable: true,
          Filter: <FilterField
            value={this.state.searchInstitution}
            onChange={event => this.setState({searchInstitution: event.target.value})}
          />
        },
        {
          id: 'contactNameLastName',
          Header: 'Kontaktna osoba',
          accessor: r => `${r.contact_name} ${r.contact_lastname}`,
          filterable: true,
          Filter: <FilterField
            value={this.state.searchContactName}
            onChange={event => this.setState({searchContactName: event.target.value})}
          />,
          maxWidth: 180
        },
        {
          Header: 'Poslužitelj',
          accessor: 'vm_host',
          filterable: true,
          Filter: <FilterField
            value={this.state.searchVmHost}
            onChange={event => this.setState({searchVmHost: event.target.value})}
          />,
          maxWidth: 180
        },
        {
          id: 'edit',
          Header: 'Uredi',
          accessor: r => (
              <Link to={`/ui/stanje-zahtjeva/${r.id}`}>
                <FontAwesomeIcon className="text-success" size="lg" icon={faPencilAlt}/>
              </Link>
            ),
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
            getTheadThProps={() => ({className: 'table-active p-2'})}
            getTheadFilterThProps={() => ({className: 'table-light align-self-center'})}
            getTdProps={() => ({className: 'pt-2 pb-2 align-self-center'})}
          />
        </BaseView>
      )
    }
    else
      return null
  }
}

export default FreshRequest;
