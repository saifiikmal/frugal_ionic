import api from './config'

const registerCanister = (dispenserId: any, serialNumber: any) => {
  return api.post('/frugal/dispensercanisters/create/653dad8613e455caf72388c2', {
    dispenserId,
    serialNumber
  })
}

const updateCanister = (id: any, data: any) => {
  return api.put(`/frugal/canisters/id/653dad8613e455caf72388c2/${id}`, {...data})
}

export default {
  registerCanister,
  updateCanister,
}