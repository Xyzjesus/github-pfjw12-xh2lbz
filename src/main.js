import { calculateFee } from '@cosmjs/stargate';
import { GasPrice } from '@cosmjs/launchpad';
import { SigningCyberClient } from '@cybercongress/cyber-js';
import { CYBER, configKeplr } from './utils';

const gasPrice = GasPrice.fromString('0.001boot');

window.onload = async () => {
  // Keplr extension injects the offline signer that is compatible with cosmJS.
  // You can get this offline signer from `window.getOfflineSigner(chainId:string)` after load event.
  // And it also injects the helper function to `window.keplr`.
  // If `window.getOfflineSigner` or `window.keplr` is null, Keplr extension may be not installed on browser.
  if (!window.getOfflineSigner || !window.keplr) {
    alert('Please install keplr extension');
  } else {
    if (window.keplr.experimentalSuggestChain) {
      try {
        // Keplr v0.6.4 introduces an experimental feature that supports the feature to suggests the chain from a webpage.
        // cosmoshub-3 is integrated to Keplr so the code should return without errors.
        // The code below is not needed for cosmoshub-3, but may be helpful if you’re adding a custom chain.
        // If the user approves, the chain will be added to the user's Keplr extension.
        // If the user rejects it or the suggested chain information doesn't include the required fields, it will throw an error.
        // If the same chain id is already registered, it will resolve and not require the user interactions.
        await window.keplr.experimentalSuggestChain(configKeplr('bostrom'));
      } catch {
        alert('Failed to suggest the chain');
      }
    } else {
      alert('Please use the recent version of keplr extension');
    }
  }

  // You should request Keplr to enable the wallet.
  // This method will ask the user whether or not to allow access if they haven't visited this website.
  // Also, it will request user to unlock the wallet if the wallet is locked.
  // If you don't request enabling before usage, there is no guarantee that other methods will work.
  await window.keplr.enable(CYBER.CHAIN_ID);

  const offlineSigner = window.getOfflineSigner(CYBER.CHAIN_ID);
  const [{ address }] = await offlineSigner.getAccounts();
  document.getElementById('address').append(address);

  const options = { prefix: CYBER.BECH32_PREFIX_ACC_ADDR_CYBER };
  const client = await SigningCyberClient.connectWithSigner(
    CYBER.CYBER_NODE_URL_API,
    offlineSigner,
    options
  );

  const data = {
    name: 'Test contract',
    symbol: 'AAAS',
    decimals: 6,
    initial_balances: 10,
    mint: {
      minter: address,
      cap: 9999,
    },
    marketing: {
      project: 'My Awesome Project',
      description: 'This is my awesome contract project',
      marketing: address,
      logo: {
        url: 'https://toppng.com/uploads/preview/sample-logo-11551056375txoo49urn6.png',
      },
    },
  };

  client
    .instantiate(address, 5, data, data.name, calculateFee(600000, gasPrice))
    .then((result) => {
      console.log('success', result);
    })
    .catch((err) => {
      console.log('err', err);
      alert(err);
    });
};
