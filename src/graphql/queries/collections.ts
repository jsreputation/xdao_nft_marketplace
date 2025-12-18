import { gql } from 'graphql-tag';

export const GET_COLLECTIONS = gql`
  query GetCollections($first: Int, $skip: Int, $orderBy: Collection_orderBy, $orderDirection: OrderDirection, $where: Collection_filter) {
    collections(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection, where: $where) {
      id
      address
      name
      uri
      owner
      verified
      isPublic
      totalItems
      totalListings
      totalVolume
      floorPrice
      totalSales
      uniqueOwners
      volume24h
      volume7d
      volume30d
      sales24h
      sales7d
      sales30d
      timestamp
    }
  }
`;

export const GET_COLLECTION = gql`
  query GetCollection($id: ID!) {
    collection(id: $id) {
      id
      address
      name
      uri
      owner
      verified
      isPublic
      totalItems
      totalListings
      totalVolume
      floorPrice
      totalSales
      volume24h
      volume7d
      volume30d
      sales24h
      sales7d
      sales30d
    }
  }
`;

export const GET_TOP_COLLECTIONS = gql`
  query GetTopCollections($first: Int) {
    collections(first: $first, orderBy: totalVolume, orderDirection: desc, where: { removed: false }) {
      id
      address
      name
      uri
      owner
      verified
      totalVolume
      floorPrice
      totalSales
      volume24h
      totalItems
    }
  }
`;

