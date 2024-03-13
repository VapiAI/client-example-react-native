import Vapi from './vapi';

const vapi = new Vapi(process.env.api_key || '');
// const vapi = new Vapi('812437de-42ce-4bca-a9e7-e62cd170e882', 'http://localhost:3001');

export default vapi;
