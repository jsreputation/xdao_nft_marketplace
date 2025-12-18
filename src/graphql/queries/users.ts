import { gql } from 'graphql-tag';

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      totalVolume
      totalSales
      totalPurchases
      totalListings
      totalCollections
      firstActivity
      lastActivity
    }
  }
`;

export const GET_USER_OWNED_NFTS = gql`
  query GetUserOwnedNFTs($owner: Bytes!, $first: Int, $skip: Int) {
    items(where: { owner: $owner }, first: $first, skip: $skip, orderBy: timestamp, orderDirection: desc) {
      id
      collection
      tokenId
      uri
      creator
      owner
      royalty
      timestamp
    }
  }
`;

export const GET_USER_LISTINGS = gql`
  query GetUserListings($owner: Bytes!, $first: Int, $skip: Int) {
    pairs(where: { owner: $owner, bValid: true }, first: $first, skip: $skip, orderBy: timestamp, orderDirection: desc) {
      id
      collection
      tokenId
      price
      owner
      creator
      timestamp
      bValid
    }
  }
`;

export const GET_USER_COLLECTIONS = gql`
  query GetUserCollections($owner: Bytes!, $first: Int, $skip: Int) {
    collections(where: { owner: $owner, removed: false }, first: $first, skip: $skip, orderBy: timestamp, orderDirection: desc) {
      id
      address
      name
      uri
      owner
      verified
      totalItems
      totalVolume
      floorPrice
      totalSales
      timestamp
    }
  }
`;
