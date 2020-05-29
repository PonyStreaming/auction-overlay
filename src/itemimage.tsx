import {Item} from "./utils/auction";
import React, {ReactElement, useEffect, useState} from "react";
import './itemimage.css';
import {CSSTransition, SwitchTransition} from "react-transition-group";
import standbyImage from './standby.png';

const DEFAULT_IMAGE = standbyImage;

export interface ItemImageProps {
    item?: Item;
}

export function ItemImage(props: ItemImageProps): ReactElement {
    const [imageURL, setImageURL] = useState(DEFAULT_IMAGE);

    useEffect(() => {
        if (!props.item?.images?.length) {
            setImageURL(DEFAULT_IMAGE);
            return;
        }
        let index = 0;
        setImageURL(props.item.images[index]);
        if (props.item?.images?.length === 1) {
            return;
        }
        const timeout = setInterval(() => {
           index = (index + 1) % props.item!.images!.length;
           setImageURL(props.item!.images![index]);
        }, 20000);

        return () => {
            clearInterval(timeout);
        }
    }, [props.item]);

    // props.item.
    return (
        <div className="ItemImage">
            <SwitchTransition mode="in-out">
                <CSSTransition key={imageURL} classNames='ItemImage-fade' addEndListener={(node, done) => node.addEventListener("transitionend", done, false)}>
                    <img src={imageURL} />
                </CSSTransition>
            </SwitchTransition>
        </div>
    );
}