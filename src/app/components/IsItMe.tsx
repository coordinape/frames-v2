"use client"

import { useWalletConnection } from "~/components/FrameOrWalletConnection";
import {useEffect, useState} from "react";

export const IsItMe = ({ address }: { address: string }) => {
    const { address: myAddress } = useWalletConnection();

    const [owner,setOwner] = useState<boolean>(false);
    useEffect(() => {
        setOwner(myAddress === address);
    }, [address,myAddress]);

    if (owner) {
        return (
            <div>
                <p>You are the owner of this profile</p>
            </div>
        )
    }
    return <div>this is not you bro</div>;
}