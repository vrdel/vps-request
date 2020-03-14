import React, { Component } from 'react';
import { Backend } from './DataManager';
import { BaseView, LoadingAnim, FilterField } from './UIElements';
import ReactTable from 'react-table';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faPencilAlt,
  faSearch
  } from '@fortawesome/free-solid-svg-icons';
import { DateFormatHR } from './Util';

import 'react-table/react-table.css';
import './StateRequest.css'

export class RejectedRequest extends Component
{
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      rejectedRequests: null,
      searchContactName: '',
      searchDate: '',
      searchInstitution: '',
      searchVmHost: ''
    }

    this.apiListRequests = '/api/v1/internal/requests/rejected'

    this.location = props.location;
    this.backend = new Backend();
    this.initializeComponent = this.initializeComponent.bind(this)
  }

  componentDidMount() {
    this.setState({loading: true})
    this.initializeComponent()
  }

  async initializeComponent(){
    const sessionActive = await this.backend.isActiveSession();

    if(sessionActive.active){
      const rejectedReq = await this.backend.fetchData(this.apiListRequests);

      this.setState({
        rejectedRequests: rejectedReq,
        loading: false
      })
    }
  }

  render() {
    let {loading, rejectedRequests, searchDate, searchContactName,
      searchInstitution, searchVmHost} = this.state

    if (searchDate && rejectedRequests) {
      rejectedRequests = rejectedRequests.filter(
        r => DateFormatHR(r.request_date).indexOf(searchDate) !== -1
      )
    }

    if (searchContactName && rejectedRequests) {
      rejectedRequests = rejectedRequests.filter(
        r => `${r.contact_name} ${r.contact_lastname}`.toLowerCase().includes(searchContactName.toLowerCase())
      )
    }

    if (searchInstitution && rejectedRequests) {
      rejectedRequests = rejectedRequests.filter(
        r => r.head_institution.toLowerCase().includes(searchInstitution.toLowerCase())
      )
    }

    if (searchVmHost && rejectedRequests) {
      rejectedRequests = rejectedRequests.filter(
        r => r.vm_host.toLowerCase().includes(searchVmHost.toLowerCase())
      )
    }

    if (loading)
      return (<LoadingAnim />)

    else if (!loading && rejectedRequests) {
      const columns = [
        {
          id: 'cardNumber',
          Header: 'r. br.',
          accessor: r => Number(rejectedRequests.length - rejectedRequests.indexOf(r)),
          filterable: true,
          Filter: () => <FontAwesomeIcon size="lg" icon={faSearch}/>,
          maxWidth: 50,
        },
        {
          id: 'isApproved',
          Header: 'Odobreno',
          accessor: () => <FontAwesomeIcon className="text-danger" size="2x" icon={faTimes}/>,
          maxWidth: 90,
        },
        {
          id: 'requestDate',
          Header: 'Datum odbijanja',
          accessor: r => DateFormatHR(r.approved_date),
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
            data={rejectedRequests}
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

export default RejectedRequest;
