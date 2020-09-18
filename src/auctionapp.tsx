import React, {ReactElement, useEffect, useState} from "react";
import {AuctionManager, Bid, BidEvent, DeleteBidEvent, Item, OpenItemEvent} from "./utils/auction";
import './auctionapp.css';
import {BidList} from "./bidlist";
import {ItemImage} from "./itemimage";

export interface AuctionOverlayProps {
    auction: AuctionManager;
    bigWebcam?: boolean;
}

export function AuctionOverlay(props: AuctionOverlayProps): ReactElement {
    const [currentItem, setCurrentItem] = useState(props.auction.getCurrentItem() || undefined);
    const [currentBids, setCurrentBids] = useState([] as Bid[]);
    const [items, setItems] = useState([] as Item[]);
    const [totalRaised, setTotalRaised] = useState(0);

    useEffect(() => {
        async function updateTotal() {
            setTotalRaised(await props.auction.getTotalCents());
        }

        props.auction.addEventListener('openitem', updateTotal);
        props.auction.addEventListener('closeitem', updateTotal);
        updateTotal();

        return () => {
            props.auction.removeEventListener('openitem', updateTotal);
            props.auction.removeEventListener('closeite,', updateTotal);
        }
    }, [props.auction]);

    useEffect(() => {
        const updateCurrentItem = (e: Event) => {
            if (!(e instanceof OpenItemEvent)) {
                return;
            }
            setCurrentItem(e.currentItem || undefined);
            setItems(props.auction.getItems());
        }

        const closeItem = (e: Event) => {
            setCurrentItem(undefined);
            setItems(props.auction.getItems());
        }

        props.auction.addEventListener('openitem', updateCurrentItem);
        props.auction.addEventListener('closeitem', closeItem);
        setItems(props.auction.getItems());

        return () => {
            props.auction.removeEventListener('openitem', updateCurrentItem);
            props.auction.removeEventListener('closeitem', closeItem);
        }
    }, [props.auction]);

    useEffect(() => {
        if (!currentItem) {
            setCurrentBids([]);
            return;
        }

        (async () => {
            setCurrentBids((await props.auction.getItemBids(currentItem.id)).reverse());
        })();
    }, [props.auction, currentItem]);

    useEffect(() => {
        const bidCreated = (e: Event) => {
            if (!(e instanceof BidEvent)) {
                return;
            }
            setCurrentBids([e.bid].concat(currentBids));
        }

        const bidDeleted = (e: Event) => {
            if (!(e instanceof DeleteBidEvent)) {
                return;
            }
            console.log(e, e.bidId, currentBids);
            setCurrentBids(currentBids.filter(x => x.id != e.bidId));
        }

        props.auction.addEventListener('bid', bidCreated);
        props.auction.addEventListener('deletebid', bidDeleted);

        return () => {
            props.auction.removeEventListener('bid', bidCreated);
            props.auction.removeEventListener('deletebid', bidDeleted);
        }
    }, [props.auction, currentBids]);

    let itemInfo = <></>
    if (currentItem) {
        itemInfo = (
            <>
                <p className="item-name">
                    <span className="title">{currentItem.title}</span>
                    <span className="donator">{currentItem.donator} — {currentItem.country}</span>
                </p>
                <div className="bid-list-holder">
                    <BidList bids={currentBids} />
                </div>
            </>
        );
    }

    return (
        <div className={"AuctionApp " + (props.bigWebcam ? 'big-webcam' : '')}>
            <p className="charity-desc">Benefiting the National Alliance on Mental Illness</p>
            <p className="total-raised-label">Total Raised:<br/><span className="total-raised">${(totalRaised/100).toFixed(2)}</span></p>
            <div className="item-image-holder">
                <ItemImage item={currentItem} />
            </div>
            {itemInfo}
        </div>
    )
}