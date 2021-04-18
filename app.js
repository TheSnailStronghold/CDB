
if('serviceWorker' in navigator){
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => console.log('Service-worker registered!'))
      .catch(err => console.log('Service-worker not registered:', err));
  }