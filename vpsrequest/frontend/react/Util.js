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

export function DateFormatHR(dateStr)
{
  var dateObj = new Date(dateStr)
  var options = {year: 'numeric', month: 'numeric', day: 'numeric',
    hour:'numeric', minute: 'numeric', second: 'numeric', hour12: false,
    timeZone: 'Europe/Zagreb'}

  return new Intl.DateTimeFormat('hr-HR', options).format(dateObj)
}
