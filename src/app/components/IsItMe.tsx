"use client"

import { useWalletConnection } from "~/components/FrameOrWalletConnection";

export const IsItMe = ({ address }: { address: string }) => {
    const { address: myAddress } = useWalletConnection();

    if (myAddress === address) {
        return (
            <div>
                <p>You are the owner of this profile</p>
            </div>
        )
    }
    return <div>this is not you bro</div>;
}