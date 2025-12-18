import { gql } from 'graphql-tag';

export const GET_AUCTIONS = gql`
  query GetAuctions($where: Auction_filter, $orderBy: Auction_orderBy, $orderDirection: OrderDirection, $first: Int, $skip: Int) {
    auctions(where: $where, orderBy: $orderBy, orderDirection: $orderDirection, first: $first, skip: $skip) {
      id
      collection
      tokenId
      startTime
      endTime
      startPrice
      creator
      owner
      active
      currentBid
      currentBidder
      bidCount
      extended
      extendedCount
    }
  }
`;

export const GET_AUCTION = gql`
  query GetAuction($id: ID!) {
    auction(id: $id) {
      id
      collection
      tokenId
      startTime
      endTime
      startPrice
      creator
      owner
      active
      currentBid
      currentBidder
      bidCount
      extended
      extendedCount
    }
  }
`;

export const GET_AUCTION_BIDS = gql`
  query GetAuctionBids($auctionId: BigInt!, $orderBy: Bid_orderBy, $orderDirection: OrderDirection) {
    bids(where: { auctionId: $auctionId }, orderBy: $orderBy, orderDirection: $orderDirection) {
      id
      from
      bidPrice
      timestamp
      txhash
      logIndex
    }
  }
`;

export const GET_NFT_BIDS = gql`
  query GetNFTBids($collection: Bytes!, $tokenId: BigInt!) {
    bids(
      where: { collection: $collection, tokenId: $tokenId },
      orderBy: timestamp,
      orderDirection: desc
    ) {
      id
      auctionId
      from
      bidPrice
      timestamp
      txhash
      logIndex
    }
  }
`;

