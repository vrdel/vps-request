import React, { Component } from 'react';
import { Backend } from './DataManager';
import { BaseView, LoadingAnim, FilterField, Status } from './UIElements';
import ReactTable from 'react-table';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import { DateFormatHR } from './Util';

import 'react-table/react-table.css';
import './RequestsMy.css';
import { CONFIG } from './Config'


export function ListRequests(typeRequest) {
  return class extends Component {
    constructor(props) {
      super(props);

      this.state = {
        loading: false,
        requests: null,
        searchContactName: '',
        searchDate: '',
        searchInstitution: '',
        searchVmHost: ''
      }

      this.apiListRequests = typeRequest.api

      this.location = props.location;
      this.backend = new Backend();
      this.initializeComponent = this.initializeComponent.bind(this)
    }

    componentDidMount() {
      this.setState({loading: true})
      this.initializeComponent()
    }

    async initializeComponent() {
      const sessionActive = await this.backend.isActiveSession();

      if (sessionActive.active) {
        const fetched = await this.backend.fetchData(this.apiListRequests);

        this.setState({
          requests: fetched,
          loading: false
        })
      }
    }

    render() {
      let {loading, requests, searchDate, searchContactName,
        searchInstitution, searchVmHost} = this.state

      if (searchDate)
        requests = requests.filter(
          r => DateFormatHR(eval(`r.${typeRequest.dateFieldSearch}`)).indexOf(searchDate) !== -1
        )

      if (searchContactName)
        requests = requests.filter(
          r => `${r.user.first_name} ${r.user.last_name}`.toLowerCase().includes(searchContactName.toLowerCase())
        )

      if (searchInstitution)
        requests = requests.filter(
          r => r.head_institution.toLowerCase().includes(searchInstitution.toLowerCase())
        )

      if (searchVmHost)
        requests = requests.filter(
          r => r.vm_host.toLowerCase().includes(searchVmHost.toLowerCase())
        )

      if (loading)
        return (<LoadingAnim />)

      else if (!loading && requests) {
        const columns = [
          {
            id: 'cardNumber',
            Header: 'r. br.',
            accessor: r => Number(requests.length - requests.indexOf(r)),
            maxWidth: 50,
            filterable: true,
            Filter: () => <FontAwesomeIcon size="lg" icon={faSearch}/>
          },
          {
            id: 'isApproved',
            Header: 'Status',
            accessor: r => {
              return (<Status params={CONFIG['status'][r.approved]}/>)
            },
            maxWidth: 90,
          },
          {
            id: 'requestDate',
            Header: typeRequest.headerDate,
            accessor: r => DateFormatHR(eval(`r.${typeRequest.dateFieldSearch}`)),
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
            accessor: r => `${r.user.first_name} ${r.user.last_name}`,
            filterable: true,
            Filter: <FilterField
              value={this.state.searchContactName}
              onChange={event => this.setState({searchContactName: event.target.value})}
            />,
            maxWidth: 180
          },
          {
            Header: 'Poslužitelj',
            accessor: 'vm_fqdn',
            filterable: true,
            Filter: <FilterField
              value={this.state.searchVmHost}
              onChange={event => this.setState({searchVmHost: event.target.value})}
            />,
            maxWidth: 180
          },
          {
            id: 'edit',
            Header: typeRequest.lastColHeader,
            accessor: r => {
              let linkPath = typeRequest.linkPath
              let lastColIcon = typeRequest.lastColIcon
              if (r.approved === 3) {
                linkPath = `${linkPath}/${typeRequest.linkPathReadOnly}`
                lastColIcon = typeRequest.lastColIconReadOnly
              }
              return (
                <Link to={`/ui/${linkPath}/${r.id}`}>
                  {lastColIcon}
                </Link>
              )
            },
            maxWidth: 70
          }
        ]
        return (
          <BaseView
            title={typeRequest.title}
            location={this.location}>
            <ReactTable
              data={requests}
              columns={columns}
              className="-highlight mt-4 text-center align-middle"
              defaultPageSize={15}
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
}

export default ListRequests;
