import { promises as dns } from 'dns';

dns.resolveSrv('_mongodb._tcp.legalreach1.wlay2yz.mongodb.net').then(console.log).catch(console.error);