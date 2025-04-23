import { getApolloClientAuthed } from "~/lib/apollo-client";
import { gql } from "@apollo/client";
import { Creator } from "~/app/features/directory/types";
import { resolveBasenameOrAddress } from "~/app/hooks/useBasenameResolver";
import { CIRCLE_ID } from "./constants";

export async function getCreatorForOG(address: string) {
  try {
    const { data } = await getApolloClientAuthed().query({
      query: gql`
        query CreatorsDirGetBasicCreator(
          $circleId: bigint!
          $address: String!
        ) {
          users(
            where: {
              circle_id: { _eq: $circleId }
              profile: { address: { _ilike: $address } }
            }
          ) {
            id
            profile {
              id
              address
              name
              avatar
              description
              farcaster_account {
                username
              }
            }
          }
        }
      `,
      variables: {
        circleId: CIRCLE_ID,
        address: address,
      },
    });

    if (!data.users.length) {
      return null;
    }

    const user = data.users[0];
    const creator: Creator = {
      id: user.id,
      address: user.profile?.address || "",
      name: user.profile?.name || "",
      avatar: user.profile?.avatar
        ? user.profile.avatar.startsWith("http")
          ? user.profile.avatar
          : `https://coordinape-prod.s3.amazonaws.com/${user.profile.avatar}`
        : "",
      description: user.profile?.description || "",
      farcasterUsername: user.profile?.farcaster_account?.username || "",
    };

    const resolution = await resolveBasenameOrAddress(creator.address);

    return {
      ...creator,
      resolution: resolution
        ? {
            basename: resolution.basename || "",
            address: resolution.address || "",
            resolved: !!resolution.basename,
            textRecords: resolution.textRecords || {},
          }
        : null,
    };
  } catch (error) {
    console.error(`Error fetching creator data for ${address}:`, error);
    return null;
  }
}
