"use client"

import { useState } from 'react';
import { FrameOrWalletConnection } from '~/components/FrameOrWalletConnection';

export default function WhoAmI() {

  const [address, setAddress] = useState<string | null>(null);
  const handleAddressChange = (address: string | null) => {
    console.log('Address changed:', address);
    // Do something with the address
    setAddress(address);
  };


  
  return (
    <div className="page">      
      <FrameOrWalletConnection >
        {({ address, isFrame, connectWallet, disconnectWallet, isConnecting, error }) => (
          <div className="content">
            {/* Your app content here */}
            <p>Addy: { address }</p>
            {address ? <button onClick={disconnectWallet}>Disconnect Wallet</button> : <button onClick={connectWallet}>Connect Wallet</button>}
            {error && <p className="error">{error.message}</p>}
            {isConnecting && <p>Connecting...</p>}
            {isFrame && <p>In Frame</p>}
          </div>
        )}
      </FrameOrWalletConnection>

    </div>
  );
} 
