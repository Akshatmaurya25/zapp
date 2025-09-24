Introduction
Welcome to Nitrolite! Built on the ERC-7824 standard, Nitrolite is a powerful framework that enables developers to build high-performance decentralized applications with near-instant finality.

The following guides will walk you through the complete lifecycle of Nitrolite applications, from client initialization to application sessions. Whether you're building payment systems, games, financial applications, or any use case requiring high-frequency transactions, Nitrolite provides the infrastructure you need.

Quick Start
Set up your first Nitrolite application with step-by-step instructions.

Create a channel
Visit apps.yellow.com to create a channel from your account. Manage your apps, and channel settings.

Connect to the ClearNode
Establish connection with ClearNode for reliable off-chain transaction processing and verification.

Channel Assets
Monitor and manage the assets and allocations within your active state channels.

Create Application Session
Initialize a new application instance

Close Application Session
Properly finalize an application session while preserving final state.

Key Features
Instant Transactions: Off-chain operations mean no waiting for block confirmations.
Minimal Gas Fees: On-chain gas is primarily for channel opening and settlement.
High Throughput: Capable of handling thousands of transactions per second.
Application Flexibility: Ideal for games, payment systems, real-time interactions, and more.
Core SDK Architecture
The Nitrolite SDK is designed with modularity and broad compatibility in mind:

NitroliteClient: This is the main entry point for developers. It provides a high-level API to manage the lifecycle of state channels, including deposits, channel creation, application session management, and withdrawals.

Nitrolite RPC: This component handles the secure, real-time, off-chain communication between channel participants and the broker. It's responsible for message signing, verification, and routing.