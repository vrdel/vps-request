import Cookies from 'universal-cookie';
import { BaseView, LoadingAnim, Status } from './UIElements';
import NotFound from './NotFound';
import React, { Component } from 'react';
import { Backend } from './DataManager';
import { Route, Switch, BrowserRouter, Redirect } from 'react-router-dom';
import {
  Table
} from 'reactstrap';
import './App.css';
import 'react-notifications/lib/notifications.css';
import { Formik, Field, FieldArray, Form } from 'formik';
import { CONFIG } from './Config'
import { useQuery } from 'react-query';
import { DateFormatHR } from './Util'


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
        <Formik
          initialValues={{activeRequests: requests}}
        >
          {props => (
            <Form>
              <FieldArray
                name="activeRequests"
                render={() => (
                  <Table responsive hover size="sm" className="mt-4">
                    <thead className="table-active align-middle text-center">
                      <tr>
                        <th style={{width: '90px'}}>Status</th>
                        <th style={{width: '180px'}}>Datum podnošenja</th>
                        <th style={{width: '180px'}}>Poslužitelj</th>
                        <th style={{width: '90px'}}>Potreban</th>
                        <th>Komentar</th>
                      </tr>
                    </thead>
                    <tbody className="align-middle text-center">
                      {
                        props.values.activeRequests.map((request, index) =>
                          <tr key={index}>
                            <td>
                              <Status params={CONFIG['status'][request.approved]} renderToolTip={true}/>
                            </td>
                            <td>
                              { DateFormatHR(request.request_date) }
                            </td>
                            <td>
                              { request.vm_fqdn }
                            </td>
                            <td>
                              { request.vm_isactive_response }
                            </td>
                            <td>
                              { request.vm_isactive_comment }
                            </td>
                          </tr>
                        )
                      }
                    </tbody>
                  </Table>
                )}
              />
            </Form>
          )}
        </Formik>
      </BaseView>
    )
  }
  else
    return null
}

export default MyRequestsActive;
