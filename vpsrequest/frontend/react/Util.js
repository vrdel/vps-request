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

export function DateFormatHR(dateStr)
{
  var dateObj = new Date(dateStr)
  var options = {year: 'numeric', month: 'numeric', day: 'numeric',
    hour:'numeric', minute: 'numeric', second: 'numeric', hour12: false,
    timeZone: 'Europe/Zagreb'}

  return new Intl.DateTimeFormat('hr-HR', options).format(dateObj)
}
