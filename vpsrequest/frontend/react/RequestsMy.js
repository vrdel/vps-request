import React, { Component } from 'react';
import { Backend } from './DataManager';
import { BaseView, LoadingAnim, Status } from './UIElements';
import ReactTable from 'react-table';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CONFIG } from './Config'
import {
  faPencilAlt,
  faSearch
  } from '@fortawesome/free-solid-svg-icons';
import { DateFormatHR } from './Util'

import 'react-table/react-table.css';
import './RequestsMy.css'

export class MyRequests extends Component
{
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      requests: null
    }

    this.apiListRequests = `${CONFIG.listReqUrl}/mine`

    this.location = props.location
    this.backend = new Backend()
    this.initializeComponent = this.initializeComponent.bind(this)
  }

  componentDidMount() {
    this.setState({loading: true})
    this.initializeComponent();
  }

  async initializeComponent(){
    const sessionActive = await this.backend.isActiveSession();

    if (sessionActive.active) {
      const fetched = await this.backend.fetchData(this.apiListRequests);

      this.setState({
        requests: fetched,
        loading: false,
        userDetails: sessionActive.userdetails
      })
    }
  }

  render() {
    const {loading, requests, userDetails} = this.state

    if (loading)
      return (<LoadingAnim />)

    else if (!loading && requests && userDetails) {
      const columns = [
        {
          id: 'cardNumber',
          Header: 'r. br.',
          accessor: r => Number(requests.indexOf(r) + 1),
          maxWidth: 50,
        },
        {
          id: 'isApproved',
          Header: 'Status',
          accessor: r => {
              return (<Status params={CONFIG['status'][r.approved]} renderToolTip={true}/>)
          },
          maxWidth: 90,
        },
        {
          id: 'requestDate',
          Header: 'Datum podnošenja',
          accessor: r => DateFormatHR(r.request_date),
          maxWidth: 180
        },
        {
          Header: 'Ustanova',
          accessor: 'head_institution',
        },
        {
          id: 'contactNameLastName',
          Header: 'Kontaktna osoba',
          accessor: r => `${userDetails.first_name} ${userDetails.last_name}`,
          maxWidth: 180
        },
        {
          Header: 'Poslužitelj',
          accessor: 'vm_fqdn',
          maxWidth: 180
        },
        {
          id: 'edit',
          Header: 'Akcija',
          accessor: r => {
            let url = ''
            let icon = undefined

            if (r.approved === 3 || r.approved === 0) {
              let path_segment = r.approved === 3 ? 'umirovljen' : 'odbijen'
              url = `/ui/stanje-zahtjeva/${path_segment}/${r.id}`
              icon = <FontAwesomeIcon className="text-primary" size="lg" icon={faSearch}/>
            }
            else {
              url = '/ui/stanje-zahtjeva/' + r.id
              icon = <FontAwesomeIcon className="text-success" size="lg" icon={faPencilAlt}/>
            }

            return (
              <Link to={url}>
                {icon}
              </Link>
            )
          },
          maxWidth: 70
        }
      ]
      return (
        <BaseView
          title='Stanje zahtjeva'
          location={this.location}>
          <ReactTable
            data={requests}
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
            getTdProps={() => ({className: 'pt-2 pb-2 align-self-center'})}
          />
        </BaseView>
      )
    }
    else
      return null
  }
}

export default MyRequests;
