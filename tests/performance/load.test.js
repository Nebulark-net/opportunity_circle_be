import autocannon from 'autocannon';
import logger from '../../src/utils/logger.js';

const runLoadTest = () => {
  const url = 'http://localhost:5000/api/v1/opportunities';
  
  const instance = autocannon({
    url,
    connections: 100,
    duration: 10,
  }, (err, result) => {
    if (err) {
      logger.error('Load Test Error:', err);
    } else {
      logger.info('Load Test Result:', result);
      console.log(`URL: ${url}`);
      console.log(`Requests/sec: ${result.requests.average}`);
      console.log(`Latency: ${result.latency.average} ms`);
    }
  });

  autocannon.track(instance);
};

// Only run if specifically requested or in a performance CI env
if (process.env.RUN_LOAD_TEST === 'true') {
  runLoadTest();
}

export { runLoadTest };
