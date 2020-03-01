import Cookies from 'universal-cookie';

export class Backend {
  isActiveSession() {
    return fetch('/api/v1/sessionactive')
      .then(response => {
        if (response.ok)
          return response.json()
        else
          return false
      })
      .catch(() => false);
  }

  fetchData(url) {
    return fetch(url)
      .then(response => response.json())
      .catch(err => alert(`Something went wrong: ${err}`));
  }

  fetchListOfNames(url) {
    return fetch(url)
      .then(response => response.json())
      .then(json => {
        let list = [];
        json.forEach((e) => list.push(e.name));
        return list;
      })
      .catch(err => alert(`Something went wrong: ${err}`));
  }

  fetchResult(url) {
    return fetch(url)
      .then(response => response.json())
      .then(json => json['result'])
      .catch(err => alert(`Something went wrong: ${err}`));
  }

  changeObject(url, data) {
    return this.send(url, 'PUT', data);
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
