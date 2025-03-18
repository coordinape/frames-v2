import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

// Common Apollo client configuration
function createApolloClient(headers?: Record<string, string>) {
  const httpLink = createHttpLink({
    uri: "https://coordinape-prod.hasura.app/v1/graphql",
    headers,
  });

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "network-only",
      },
      query: {
        fetchPolicy: "network-only",
      },
    },
  });
}

// Create a function to get the authenticated Apollo client
export function getApolloClientAuthed() {
  return createApolloClient({
    Authorization:
      process.env.HASURA_AUTH ??
      (() => {
        throw new Error("HASURA_AUTH environment variable not found");
      })(),
  });
}

// Create a function to get an unauthed Apollo client
export function getApolloClient() {
  return createApolloClient({
    Authorization: "anon",
  });
}

// Example query for CoSouls
export const CO_SOULS_QUERY = `
  query CoSouls {
    cosouls(limit: 10) {
      token_id
      id
      address
    }
  }
`;
