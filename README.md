# 🎨 NFT Marketplace Frontend

<div align="center">

**A modern, fully decentralized NFT marketplace built with Next.js**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

[Features](#-features) • [Quick Start](#-quick-start) • [Deployment](#-deployment) • [Documentation](#-documentation)

</div>

---

## ✨ Features

### 🛍️ Marketplace Features
- **Browse & Explore** - Discover NFTs and collections with advanced filtering
- **Fixed-Price Listings** - List NFTs for sale at fixed prices
- **Auction System** - Create and participate in NFT auctions with real-time bidding
- **Offer System** - Make and manage offers on listed NFTs
- **Collection Management** - Create and manage your own NFT collections
- **Minting** - Mint new NFTs directly from the platform

### 👤 User Experience
- **User Profiles** - View owned NFTs, listings, collections, and trading history
- **Activity Tracking** - Real-time updates on sales, bids, and offers
- **Wallet Integration** - Seamless connection with MetaMask, WalletConnect, and more
- **Dark Theme** - Beautiful dark mode UI optimized for extended browsing
- **Responsive Design** - Perfect experience on desktop, tablet, and mobile

### 🚀 Performance & Technology
- **Real-time Updates** - Powered by The Graph subgraph for instant data synchronization
- **Optimized Loading** - Lazy loading, code splitting, and smart caching
- **IPFS Integration** - Decentralized storage for NFT metadata and images
- **Type Safety** - Full TypeScript coverage for reliable development

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Yarn** or **npm** package manager
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd marketplace-frontend
   ```

2. **Install dependencies**
   ```bash
   yarn install
   # or
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Then edit `.env.local` with your configuration:
   ```env
   # Required: Smart Contract Addresses
   NEXT_PUBLIC_MARKET_ADDRESS=0x...
   NEXT_PUBLIC_AUCTION_ADDRESS=0x...
   NEXT_PUBLIC_TGR_ADDRESS=0x...
   
   # Required: Subgraph URL
   NEXT_PUBLIC_SUBGRAPH_URL=https://api.thegraph.com/subgraphs/name/your-subgraph
   
   # Required: Network Configuration
   NEXT_PUBLIC_CHAIN_ID=43114
   
   # Required: WalletConnect
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
   
   # Optional: IPFS Services
   NEXT_PUBLIC_LIGHTHOUSE_API_KEY=your_key
   NEXT_PUBLIC_PINATA_API_KEY=your_key
   ```

4. **Start the development server**
   ```bash
   yarn dev
   # or
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 Project Structure

```
marketplace-frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Homepage
│   │   ├── explore/            # Browse NFTs & Collections
│   │   ├── nft/                # NFT detail pages
│   │   ├── collection/         # Collection pages
│   │   ├── profile/            # User profile pages
│   │   ├── auction/            # Auction pages
│   │   └── layout.tsx          # Root layout
│   ├── components/             # React components
│   │   ├── common/             # Shared components
│   │   ├── nft/                # NFT-related components
│   │   ├── collection/         # Collection components
│   │   ├── auction/            # Auction components
│   │   ├── explore/            # Explore page components
│   │   └── layout/             # Layout components
│   ├── hooks/                  # Custom React hooks
│   │   ├── useSubgraph.ts      # GraphQL queries
│   │   ├── useMarketplace.ts   # Marketplace interactions
│   │   ├── useAuction.ts       # Auction interactions
│   │   └── useIPFS.ts          # IPFS utilities
│   ├── lib/                    # Utilities and configurations
│   │   ├── contracts.ts        # Contract addresses & ABIs
│   │   ├── wagmi.ts            # Wagmi configuration
│   │   ├── apollo.ts           # Apollo Client setup
│   │   └── toast.ts            # Toast notifications
│   ├── graphql/                # GraphQL queries
│   │   ├── queries/            # Query definitions
│   │   └── fragments/          # Reusable fragments
│   └── contracts/              # Contract ABIs
│       └── abis/               # JSON ABIs
├── public/                     # Static assets
├── .env.example                # Environment variables template
├── next.config.js              # Next.js configuration
├── tailwind.config.js          # Tailwind CSS configuration
└── package.json                # Dependencies
```

---

## 🛠️ Available Scripts

```bash
# Development
yarn dev              # Start development server
yarn build            # Build for production
yarn start            # Start production server
yarn lint             # Run ESLint
yarn type-check       # TypeScript type checking
```

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Import to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your repository

3. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.example`
   - Set for Production, Preview, and Development

4. **Deploy**
   - Click "Deploy"
   - Your app will be live in minutes! 🚀

### Environment Variables for Production

Make sure to set these in your deployment platform:

**Required:**
- `NEXT_PUBLIC_MARKET_ADDRESS`
- `NEXT_PUBLIC_AUCTION_ADDRESS`
- `NEXT_PUBLIC_TGR_ADDRESS`
- `NEXT_PUBLIC_SUBGRAPH_URL`
- `NEXT_PUBLIC_CHAIN_ID`
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

**Optional:**
- `NEXT_PUBLIC_LIGHTHOUSE_API_KEY`
- `NEXT_PUBLIC_PINATA_API_KEY`
- `NEXT_PUBLIC_IPFS_GATEWAY`

---

## 🎨 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | [Next.js 14](https://nextjs.org/) with App Router |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **Blockchain** | [wagmi](https://wagmi.sh/) + [viem](https://viem.sh/) |
| **Wallet** | [RainbowKit](https://www.rainbowkit.com/) |
| **GraphQL** | [Apollo Client](https://www.apollographql.com/) |
| **Data** | [The Graph](https://thegraph.com/) Subgraph |
| **Storage** | IPFS (Lighthouse/Pinata) |
| **Icons** | [Heroicons](https://heroicons.com/) |
| **Charts** | [Recharts](https://recharts.org/) |

---

## 📚 Key Features Explained

### 🎯 Smart Filtering
- Filter NFTs by collection, price range, status, and more
- Filter collections by floor price, volume, and activity
- Real-time search with instant results
- Save and share filter presets

### 💰 Trading Features
- **Fixed Price Sales**: List NFTs at your desired price
- **Auctions**: Create time-limited auctions with automatic bidding
- **Offers**: Make offers on any listed NFT
- **Bulk Actions**: Manage multiple listings efficiently

### 📊 Analytics
- Collection statistics and trends
- Price history charts
- Trading volume analytics
- User activity tracking

---

## 🔧 Configuration

### Network Configuration

The app supports Avalanche networks:
- **Mainnet**: Chain ID `43114`
- **Fuji Testnet**: Chain ID `43113`

Set `NEXT_PUBLIC_CHAIN_ID` in your environment variables.

### IPFS Configuration

Choose your IPFS service:
- **Lighthouse**: Set `NEXT_PUBLIC_LIGHTHOUSE_API_KEY`
- **Pinata**: Set `NEXT_PUBLIC_PINATA_API_KEY`
- **Custom Gateway**: Set `NEXT_PUBLIC_IPFS_GATEWAY`

---

## 🐛 Troubleshooting

### Build Errors

**Issue**: TypeScript errors during build
```bash
# Fix: Run type checking
yarn type-check
```

**Issue**: Missing dependencies
```bash
# Fix: Reinstall dependencies
rm -rf node_modules yarn.lock
yarn install
```

### Runtime Errors

**Issue**: Wallet not connecting
- Verify `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set
- Check browser console for errors
- Ensure you're on the correct network

**Issue**: Subgraph queries failing
- Verify `NEXT_PUBLIC_SUBGRAPH_URL` is correct
- Check subgraph is deployed and synced
- Review network tab in browser DevTools

**Issue**: Images not loading
- Check IPFS gateway configuration
- Verify NFT metadata URIs are valid
- Check browser console for CORS errors

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- [The Graph](https://thegraph.com/) for decentralized indexing
- [RainbowKit](https://www.rainbowkit.com/) for wallet integration
- [Next.js](https://nextjs.org/) team for the amazing framework
- All contributors and the open-source community

---

## 📞 Support

Need help? Here are some resources:

- 📖 Check the [documentation](./docs)
- 🐛 [Report an issue](https://github.com/your-repo/issues)
- 💬 [Join our Discord](https://discord.gg/your-server)
- 📧 Email: support@yourmarketplace.com

---

<div align="center">

**Built with ❤️ by the Marketplace Team**

[⬆ Back to Top](#-nft-marketplace-frontend)

</div>
