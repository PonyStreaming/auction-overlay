const AUCTION_SERVICE_URL = "https://auction-api.charity.ponyfest.horse";

interface ReceivedCloseItemEvent {
    type: 'closeItem';
    event: {
        itemId: string;
    }
}

interface ReceivedOpenItemEvent {
    type: 'openItem';
    event: {
        itemId: string;
    }
}

interface ReceivedDeleteBidEvent {
    type: 'deleteBid';
    event: {
        itemId: string;
        bidId: string;
    }
}

interface ReceivedBidEvent {
    type: 'bid';
    event: Bid;
}

type Event = ReceivedCloseItemEvent | ReceivedOpenItemEvent | ReceivedDeleteBidEvent | ReceivedBidEvent;

export interface Item {
    title: string;
    description: string;
    images?: string[];
    startBid: number;
    closed: boolean;
    id: string;
    donator: string;
    country: string;
}

export interface Bid {
    bid: number;
    bidder: string;
    bidderDisplayName: string;
    id: string;
    itemId: string;
}

export class ReadyEvent extends Event {
    constructor(eventInit?: EventInit) {
        super("ready", eventInit);
    }
}

export class OpenItemEvent extends Event {
    public readonly currentItem: Item;

    constructor(eventInit: EventInit & {item: Item}) {
        super("openitem", eventInit);
        this.currentItem = eventInit.item;
    }
}

export class CloseItemEvent extends Event {
    public readonly itemId: string;

    constructor(eventInit: EventInit & {itemId: string}) {
        super("closeitem", eventInit);

        this.itemId = eventInit.itemId;
    }
}

export class BidEvent extends Event {
    public readonly bid: Bid;

    constructor(eventInit: EventInit & {bid: Bid}) {
        super("bid", eventInit);
        this.bid = eventInit.bid;
    }
}

export class DeleteBidEvent extends Event {
    public readonly itemId: string;
    public readonly bidId: string;

    constructor(eventInit: EventInit & {bidId: string, itemId: string}) {
        super("deletebid", eventInit);
        this.itemId = eventInit.itemId;
        this.bidId = eventInit.bidId;
    }
}

export class AuctionManager extends EventTarget {
    private events: EventSource;
    private items: Item[] = [];
    private currentItem: Item | null = null;
    private ready = false;

    constructor(private password: string) {
        super();
        this.events = new EventSource(`${AUCTION_SERVICE_URL}/api/events?password=${encodeURIComponent(password)}`);
        this.events.onmessage = (e) => this.handleMessage(e.data);
        this.fetchItems();
    }

    public getItem(id: string): Item | undefined {
        return this.items.filter(x => x.id == id)[0];
    }

    public getCurrentItem(): Item | null {
        return this.currentItem;
    }

    public getItems(): Item[] {
        return this.items;
    }

    public async getItemBids(itemId: string): Promise<Bid[]> {
        const response = await this.fetch(`${AUCTION_SERVICE_URL}/api/items/${itemId}/bids`);
        const json = await response.json();
        return json.bids;
    }

    public async openItem(itemId: string): Promise<void> {
        await this.fetch(`${AUCTION_SERVICE_URL}/api/openItem`, {method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, body: `itemId=${itemId}`})
    }

    public async closeItem(): Promise<void> {
        await this.fetch(`${AUCTION_SERVICE_URL}/api/closeItem`, {method: 'POST'});
    }

    public async deleteBid(itemId: string, bidId: string): Promise<void> {
        await this.fetch(`${AUCTION_SERVICE_URL}/api/items/${itemId}/bids/${bidId}`, {method: "DELETE"});
    }

    public async getTotalCents(): Promise<number> {
        const response = await this.fetch(`${AUCTION_SERVICE_URL}/api/total`);
        const json = await response.json();
        return json.totalCents;
    }

    private async fetchItems() {
        let request = await this.fetch(`${AUCTION_SERVICE_URL}/api/items`);
        let json = await request.json();
        this.items = json.items;
        request = await this.fetch(`${AUCTION_SERVICE_URL}/api/currentItem`);
        json = await request.json();
        this.currentItem = json.item;
        this.ready = true;
        this.dispatchEvent(new ReadyEvent());
    }

    private handleMessage(data: string) {
        const json = JSON.parse(data) as Event;
        switch (json.type) {
            case "openItem":
                let item = this.getItem(json.event.itemId);
                if (!item) {
                    window.location.reload();
                    return;
                }
                this.currentItem = item;
                this.dispatchEvent(new OpenItemEvent({item}));
                break;
            case "closeItem":
                this.currentItem = null;
                if (this.getItem(json.event.itemId)) {
                    this.getItem(json.event.itemId)!.closed = true;
                }
                this.dispatchEvent(new CloseItemEvent({itemId: json.event.itemId}));
                break;
            case "bid":
                this.dispatchEvent(new BidEvent({bid: json.event}))
                break;
            case "deleteBid":
                this.dispatchEvent(new DeleteBidEvent(json.event));
                break;
        }
    }

    private fetch(url: string, init?: RequestInit): Promise<Response> {
        if (url.indexOf('?') !== -1) {
            url += '&password=' + this.password;
        }  else {
            url += '?password=' + this.password;
        }
        return fetch(url, init);
    }
}