import api from './config'

const getDispenserWithTime = (params: any) => {
  return api.get('/frugal/dispenserownerships/time/653dad8613e455caf72388c2', {...params})
}

const getDispenserWithCanister = (params: any) => {
  return api.get('/frugal/dispenserownerships/canister/653dad8613e455caf72388c2', {...params})
}

const getDispenserByMacAddress = (macAddress: string) => {
  return api.get(`/frugal/dispenserownerships/macAddress/653dad8613e455caf72388c2/${macAddress}`)
}

const registerDispenser = (serialNumber: any) => {
  return api.post('/frugal/dispenserownerships/create/653dad8613e455caf72388c2', {
    serialNumber
  })
}

const updateDispenser = (id: any, data: any) => {
  return api.put(`/frugal/dispensers/id/653dad8613e455caf72388c2/${id}`, {...data})
}

const updateDispenserTime = (id: any, data: any) => {
  return api.put(`/frugal/dispensertimes/id/653dad8613e455caf72388c2/${id}`, {...data})
}

const createDispenserTime = (data: any) => {
  return api.post('/frugal/dispensertimes/create/653dad8613e455caf72388c2', {...data})
}

const deleteDispenserTime = (id: any) => {
  return api.delete(`/frugal/dispensertimes/id/653dad8613e455caf72388c2/${id}`)
}

const clearSchedule = (id: any) => {
  return api.post(`/frugal/dispensers/clear/653dad8613e455caf72388c2/${id}`)
}

export default {
  getDispenserWithTime,
  getDispenserWithCanister,
  getDispenserByMacAddress,
  registerDispenser,
  updateDispenser,
  updateDispenserTime,
  createDispenserTime,
  deleteDispenserTime,
  clearSchedule,
}