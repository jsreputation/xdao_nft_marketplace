import { gql } from 'graphql-tag';

export const GET_NFTS = gql`
  query GetNFTs($where: Pair_filter, $orderBy: Pair_orderBy, $orderDirection: OrderDirection, $first: Int, $skip: Int) {
    pairs(where: $where, orderBy: $orderBy, orderDirection: $orderDirection, first: $first, skip: $skip) {
      id
      collection
      tokenId
      price
      owner
      creator
      creatorFee
      bValid
      sold
      salePrice
      saleTimestamp
      buyer
      offerCount
      priceUpdated
      lastPriceUpdate
      timestamp
    }
  }
`;

export const GET_NFT_DETAILS = gql`
  query GetNFTDetails($collection: Bytes!, $tokenId: BigInt!) {
    items(where: { collection: $collection, tokenId: $tokenId }, first: 1) {
      id
      collection
      tokenId
      uri
      creator
      owner
      royalty
      timestamp
    }
    pairs(where: { collection: $collection, tokenId: $tokenId }, first: 1) {
      id
      price
      owner
      creator
      creatorFee
      offerCount
      bValid
      priceUpdated
      lastPriceUpdate
      timestamp
    }
  }
`;

export const GET_TRENDING_NFTS = gql`
  query GetTrendingNFTs($first: Int) {
    pairs(first: $first, where: { bValid: true }, orderBy: timestamp, orderDirection: desc) {
      id
      collection
      tokenId
      price
      owner
      timestamp
    }
  }
`;

export const GET_ITEMS_BY_COLLECTION = gql`
  query GetItemsByCollection($collection: Bytes!, $first: Int, $skip: Int, $orderBy: Item_orderBy, $orderDirection: OrderDirection) {
    items(where: { collection: $collection }, first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
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

