export const vpsFilterMethod = (filter, row) => {
    const id = filter.pivotId || filter.id
    return row[id] !== undefined ? String(row[id]).toLocaleLowerCase().includes(filter.value.toLocaleLowerCase()) : true
}

