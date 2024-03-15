import Vapi from './vapi';

const vapi = new Vapi(process.env.api_key || '');

export default vapi;
