"use server";

import { getApolloClientAuthed } from "~/lib/apollo-client";
import { gql } from "@apollo/client";
import { CIRCLE_ID, ENTRANCE } from "./constants";

/**
 * Checks if an address is a member of the hardcoded circle
 * @param address Ethereum address to check
 * @returns Promise<boolean> True if address is a member, false otherwise
 */
export async function addressIsMember(address: string): Promise<boolean> {
  try {
    const { data } = await getApolloClientAuthed().query({
      query: gql`
        query CreatorsDirCheckMembership(
          $address: String!
          $circleId: bigint!
        ) {
          users(
            where: {
              circle_id: { _eq: $circleId }
              profile: { address: { _ilike: $address } }
            }
          ) {
            id
            profile {
              name
              id
            }
          }
        }
      `,
      variables: {
        address: address,
        circleId: CIRCLE_ID,
      },
    });

    return data.users.length > 0;
  } catch (error) {
    console.error("Error checking membership:", error);
    return false;
  }
}

/**
 * Adds a user to the directory circle
 * @param address Ethereum address of the user
 * @param name Name of the user
 * @returns Promise<boolean> True if successfully added, false otherwise
 */
export async function joinDirectory(
  address: string,
  name: string,
): Promise<boolean> {
  try {
    const { data } = await getApolloClientAuthed().mutate({
      mutation: gql`
        mutation CreatorsDirJoinDirectory(
          $circleId: Int!
          $address: String!
          $name: String!
          $entrance: String!
        ) {
          createUsers(
            payload: {
              circle_id: $circleId
              users: { address: $address, name: $name, entrance: $entrance }
            }
          ) {
            id
          }
        }
      `,
      variables: {
        circleId: CIRCLE_ID,
        address,
        name,
        entrance: ENTRANCE,
      },
    });

    console.log("Join directory response:", data);
    return !!data.createUsers?.[0]?.id;
  } catch (error) {
    console.error("Error joining directory:", error);
    return false;
  }
}
