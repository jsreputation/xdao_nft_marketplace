import { gql } from 'graphql-tag';

export const GET_OFFERS = gql`
  query GetOffers($where: Offer_filter, $orderBy: Offer_orderBy, $orderDirection: OrderDirection) {
    offers(where: $where, orderBy: $orderBy, orderDirection: $orderDirection) {
      id
      offerId
      pairId
      offerer
      amount
      isActive
      accepted
      cancelled
      timestamp
      acceptedTimestamp
      cancelledTimestamp
    }
  }
`;

export const GET_PAIR_OFFERS = gql`
  query GetPairOffers($pairId: BigInt!) {
    offers(where: { pairId: $pairId, isActive: true }, orderBy: amount, orderDirection: desc) {
      id
      offerId
      offerer
      amount
      timestamp
      accepted
      cancelled
      acceptedTimestamp
      cancelledTimestamp
    }
  }
`;

export const GET_NFT_OFFERS = gql`
  query GetNFTOffers($collection: Bytes!, $tokenId: BigInt!) {
    pairs(where: { collection: $collection, tokenId: $tokenId }, first: 1) {
      id
      offers(orderBy: timestamp, orderDirection: desc) {
        id
        offerId
        offerer
        amount
        isActive
        accepted
        cancelled
        timestamp
        acceptedTimestamp
        cancelledTimestamp
      }
    }
  }
`;

export const GET_ALL_PAIR_OFFERS = gql`
  query GetAllPairOffers($pairId: BigInt!) {
    offers(where: { pairId: $pairId }, orderBy: timestamp, orderDirection: desc) {
      id
      offerId
      offerer
      amount
      isActive
      accepted
      cancelled
      timestamp
      acceptedTimestamp
      cancelledTimestamp
      txhash
      logIndex
    }
  }
`;

