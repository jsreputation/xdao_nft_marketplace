import { gql } from 'graphql-tag';

export const GET_EVENTS = gql`
  query GetEvents($where: Event_filter, $orderBy: Event_orderBy, $orderDirection: OrderDirection, $first: Int, $skip: Int) {
    events(where: $where, orderBy: $orderBy, orderDirection: $orderDirection, first: $first, skip: $skip) {
      id
      name
      collection
      tokenId
      from
      to
      price
      timestamp
      txhash
      logIndex
    }
  }
`;

export const GET_NFT_EVENTS = gql`
  query GetNFTEvents($collection: Bytes!, $tokenId: BigInt!) {
    events(where: { collection: $collection, tokenId: $tokenId }, orderBy: timestamp, orderDirection: desc) {
      id
      name
      from
      to
      price
      timestamp
      txhash
      logIndex
    }
  }
`;

export const GET_NFT_PRICE_EVENTS = gql`
  query GetNFTPriceEvents($collection: Bytes!, $tokenId: BigInt!) {
    events(
      where: { 
        collection: $collection, 
        tokenId: $tokenId,
        name_in: ["Listed", "PriceUpdated", "Sold"]
      }, 
      orderBy: timestamp, 
      orderDirection: asc
    ) {
      id
      name
      price
      timestamp
      txhash
      logIndex
    }
  }
`;

export const GET_COLLECTION_SALES = gql`
  query GetCollectionSales($collection: Bytes!, $first: Int) {
    events(
      where: { 
        collection: $collection,
        name: "Sold"
      },
      orderBy: timestamp,
      orderDirection: desc,
      first: $first
    ) {
      id
      tokenId
      from
      to
      price
      timestamp
      txhash
      logIndex
    }
  }
`;

