export const vpsFilterMethod = (filter, row) => {
    const id = filter.pivotId || filter.id
    return row[id] !== undefined ? String(row[id]).toLocaleLowerCase().includes(filter.value.toLocaleLowerCase()) : true
}

export function EmptyIfNull(field) {
  if (field === null)
    return ''
  else
    return field
}

export function elemInArray(elem, array) {
  let pos = array.indexOf(elem)
  if (pos !== -1)
    return true
  else
    return false
}

export function canApprove(userDetails) {
  if (userDetails.is_superuser)
    return true

  if (userDetails.perms) {
    let index = userDetails.perms.indexOf('approve_request')
    if (index !== -1)
      return true
  }

  return false
}

export function DateFormatHR(dateStr, onlydate=false, onlytime=false)
{
  var dateObj = new Date(dateStr)
  var options = {year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false,
    timeZone: 'Europe/Zagreb'}

  if (!dateStr || dateStr === '-')
    return '-'
  else if (onlydate) {
    let year = new Intl.DateTimeFormat('hr-HR', {year: '2-digit'}).format(dateObj)
    let month = new Intl.DateTimeFormat('hr-HR', {month: '2-digit'}).format(dateObj)
    let day = new Intl.DateTimeFormat('hr-HR', {day: '2-digit'}).format(dateObj)
    return `${day}${month}${year}`
  }
  else if (onlytime) {
    let hours = new Intl.DateTimeFormat('hr-HR', {hour: '2-digit'}).format(dateObj)
    let minutes = new Intl.DateTimeFormat('hr-HR', {minute: '2-digit'}).format(dateObj)
    let seconds = new Intl.DateTimeFormat('hr-HR', {second: '2-digit'}).format(dateObj)
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`
  }
  else
    return new Intl.DateTimeFormat('hr-HR', options).format(dateObj)
}
