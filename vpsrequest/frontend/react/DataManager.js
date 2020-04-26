import Cookies from 'universal-cookie';
import { RelativePath } from './Config'

export class Backend {
  async isActiveSession() {
    let response = await fetch(`${RelativePath}/api/v1/sessionactive`)

    if (response.ok)
      return response.json()
    else
      return false
  }

  async fetchConfigOptions() {
    let response = await fetch(`${RelativePath}/api/v1/configoptions`)

    if (response.ok)
      return response.json()
    else
      return false
  }

  async doUserPassLogin(username, password)
  {
    let cookies = new Cookies();

    let response = await fetch(`${RelativePath}/rest-auth/login/`, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-CSRFToken': cookies.get('csrftoken'),
        'Referer': 'same-origin'
      },
      body: JSON.stringify({
        'username': username,
        'password': password
      })
    })

    return this.isActiveSession()
  }

  async fetchData(url) {
    let response = await fetch(url)
    if (response.ok)
      return response.json()
    else
      alert(`Something went wrong: ${response.statusText}`)
  }

  changeObject(url, data) {
    return this.send(url, 'PATCH', data);
  }

  addObject(url, data) {
    return this.send(url, 'POST', data);
  }

  deleteObject(url) {
    return this.send(url, 'DELETE');
  }

  send(url, method, values=undefined) {
    const cookies = new Cookies();

    return fetch(url, {
      method: method,
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-CSRFToken': cookies.get('csrftoken'),
        'Referer': 'same-origin'
      },
      body: values && JSON.stringify(values)
    });
  }
}
