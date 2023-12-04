import api from './config'

const registerCanister = (dispenserId: any, serialNumber: any) => {
  return api.post('/frugal/dispensercanisters/create/653dad8613e455caf72388c2', {
    dispenserId,
    serialNumber
  })
}

export default {
  registerCanister,
}