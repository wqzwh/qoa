function compose(middleware) {
  return (context) => {
    return dispatch(0)
    function dispatch(i) {
      let fn = middleware[i]
      if(!fn) return Promise.resolve()
      return Promise.resolve(fn(context, next => {
        return dispatch(i + 1)
      }))
    }
  }
}

module.exports = compose