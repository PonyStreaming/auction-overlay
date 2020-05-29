import React, {ReactElement} from "react";
import {Bid} from "./utils/auction";
import "./bidlist.css";

export interface BidListProps {
    bids: Bid[];
}

export function BidList(props: BidListProps): ReactElement {
    if (props.bids.length === 0) {
        return <></>
    }
    const bid0 = props.bids[0];
    if (props.bids.length === 1) {
        return (
            <ul className="BidList">
                <li className="bid-title">Highest bid</li>
                <li key={bid0.id} className="top-bid"><span className="bid">${(bid0.bid / 100).toFixed(2)}</span><span className="divider"> — </span><span className="bidder">{bid0.bidderDisplayName}</span></li>
            </ul>
        );
    }

    return (
        <ul className="BidList">
            <li className="bid-title">Highest bid</li>
            <li key={bid0.id} className="top-bid"><span className="bid">${(bid0.bid / 100).toFixed(2)}</span><span className="bidder">{bid0.bidderDisplayName}</span></li>
            <li className="bid-title">Previous bids</li>
            {props.bids.slice(1, 5).map(bid => (
                <li key={bid.id}><span className="bid">${(bid.bid / 100).toFixed(2)}</span><span className="divider"> — </span><span className="bidder">{bid.bidderDisplayName}</span></li>
            ))}
        </ul>
    )
}