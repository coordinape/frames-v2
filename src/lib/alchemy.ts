import { Alchemy, Network, AlchemySettings } from 'alchemy-sdk';

if (!process.env.ALCHEMY_API_KEY) {
  throw new Error('ALCHEMY_API_KEY is required');
}

const settings: AlchemySettings = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.BASE_MAINNET,
  connectionInfoOverrides: {
    skipFetchSetup: true,
  },
};

console.log('settings', settings);
export const alchemy = new Alchemy(settings);