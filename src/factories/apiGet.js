export default function apiGetFactory (endpoint, pathCheck, config = true) {
  const apiGet = async ({ path, http, state, storage, router }) => {
    if (!state.get('authorization.authenticated')) return path.error()
    if (!endpoint || !pathCheck) return path.error({ error: 'endpoint and path required' })
    const getDataFromApi = await http.get(endpoint)
    state.set(pathCheck, getDataFromApi.result)
    // storage.set(pathCheck, getDataFromApi.result)
    const result = config.mergeResult && { result: getDataFromApi.result }
    return path.success(result)
  }
  return apiGet
}
