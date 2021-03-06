import Cookies from 'universal-cookie';
import { BaseView, LoadingAnim, Status } from './UIElements';
import NotFound from './NotFound';
import React, { Component } from 'react';
import { Backend } from './DataManager';
import { Route, Switch, BrowserRouter, Redirect } from 'react-router-dom';
import { VPSPage } from './UIElements';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faPencilAlt,
  } from '@fortawesome/free-solid-svg-icons';
import './App.css';
import 'react-notifications/lib/notifications.css';
import { CONFIG } from './Config'
import { useQuery } from 'react-query';


const MyRequestsActive = (props) => {
  const location = props.location;
  const backend = new Backend();
  const apiListRequests = `${CONFIG.listReqUrl}/mine_active`

  const { data: userDetails, error: errorUserDetails, isLoading: loadingUserDetails } = useQuery(
    `session-userdetails`, async () => {
      const sessionActive = await backend.isActiveSession()
      if (sessionActive.active) {
        return sessionActive.userdetails
      }
    }
  );

  const { data: requests, error: errorRequest, isLoading: loadingRequests } = useQuery(
    `aktivni-vmovi-requests`, async () => {
      const fetched = await backend.fetchData(apiListRequests)
      return fetched
    },
    {
      enabled: userDetails
    }
  );


  if (loadingRequests || loadingUserDetails)
    return (<LoadingAnim />)

  else if (!loadingRequests && requests) {
    return (
      <BaseView
        title='Aktivni poslužitelji'
        location={location}>
        {
          "I'm active VM's"
        }
      </BaseView>
    )
  }
  else
    return null
}

export default MyRequestsActive;
