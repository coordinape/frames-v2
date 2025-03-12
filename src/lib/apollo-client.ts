import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  gql,
} from "@apollo/client";

// Apollo client setup
const httpLink = createHttpLink({
  uri: "https://coordinape-prod.hasura.app/v1/graphql",
  headers: {
    Authorization:
      process.env.HASURA_AUTH ??
      (() => {
        throw new Error("HASURA_AUTH environment variable not found");
      })(),
  },
});

export const apolloClient = new ApolloClient({
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
