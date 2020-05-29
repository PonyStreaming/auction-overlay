import React, {ReactElement, useEffect, useState} from 'react';
import {AuctionManager} from "./utils/auction";
import {AuctionOverlay} from "./auctionapp";

interface Room {
  endpoint: string;
  key: string;
  name: string;
  techStream: string;
}

function App(): ReactElement {
  const [ready, setReady] = useState(false);
  const [auctionManager, setAuctionManager] = useState(null as null | AuctionManager);

  useEffect(() => {
    let am = new AuctionManager((new URLSearchParams(window.location.search)).get("password") || "");

    const onReady = () => {
      setReady(true);
    }

    am.addEventListener('ready', onReady);
    setAuctionManager(am);

    return () => {
      am.removeEventListener('ready', onReady);
      setAuctionManager(null);
    }
  }, []);

  if (!ready || !auctionManager) {
    return <p>Loading...</p>
  }

  const bigWebcam = (new URLSearchParams(window.location.search)).get("webcam") === "big";

  return <AuctionOverlay auction={auctionManager} bigWebcam={bigWebcam} />
}

export default App;
