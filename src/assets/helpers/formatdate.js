export const formatDateToISO = (payloadDate) => {
  const oldDate = payloadDate
  const separateDay = oldDate.split('-')
  const date = `${separateDay[2] + '-' + separateDay[1] + '-' + separateDay[0]}`
  const newDate = new Date(date).toISOString()

  return newDate
}
