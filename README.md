# Demo NestJS Project

A NestJS application with PostgreSQL, Prisma ORM, and JWT authentication, made for PWD recruitment process.

## Quick Start

### Installation

First, install dependencies:

```bash
yarn install
```

### Configuration

Create `.env` file by copying `.env.example` and fill in the values.

### Authentication

Generate a JWT token and add it to the `Authorization` header in Postman (Bearer Token - auth type):

```bash
yarn generate-jwt john.doe@example.com
```

## Testing

### Test Block Numbers

Use these block numbers for testing:

- `17000000`
- `24174405`

### Example Transaction

Etherscan transaction reference:

```
https://etherscan.io/tx/0x0c0093106cb919958037a68aa3ce785a4c9a8ff430f4e49fd0c32a6348ee1c46
```

## Notes & Comments

- I would use Docker if DB was there (in this case no need)
- This repo was cloned from a base one, that is why history is long
- There are a lot of TODO comments in the code to explain/suggest improvements
- Most of the code is over-engineered to demonstrate production-ready patterns. For such a small application, multiple layers and features are not strictly necessary
- DDD and hexagonal architecture are used to demonstrate production-ready patterns
- In more complex logic, logic should be separated and much more validation will be needed to operate on blockchain data
