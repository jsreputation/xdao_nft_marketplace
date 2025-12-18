import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_SUBGRAPH_URL || '',
});

// Error handling link to log rate limit errors
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (networkError) {
    // If we get a 429 (Too Many Requests), log it
    if ((networkError as any).statusCode === 429) {
      console.warn('Rate limit reached for:', operation.operationName);
    }
  }
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  }
});

// Create cache instance once for better performance
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        collections: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
        pairs: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
        auctions: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
      },
    },
    // Optimize cache for common entities
    Collection: {
      keyFields: ['id'],
    },
    Item: {
      keyFields: ['id'],
    },
    Pair: {
      keyFields: ['id'],
    },
    Auction: {
      keyFields: ['id'],
    },
  },
  // Increase cache size for better performance
  resultCaching: true,
  // Optimize memory usage
  addTypename: true,
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-first', // Use cache first to reduce requests
      errorPolicy: 'all',
      nextFetchPolicy: 'cache-first', // Continue using cache on subsequent fetches
      notifyOnNetworkStatusChange: false, // Reduce unnecessary re-renders
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: false,
    },
  },
  // Performance: Only enable dev tools in development
  connectToDevTools: process.env.NODE_ENV === 'development',
});

