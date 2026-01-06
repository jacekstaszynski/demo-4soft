# Demo NestJS Project

A NestJS application with PostgreSQL, Prisma ORM, and JWT authentication,
made for PWD recruitment process.

## Quick Start

Create `.env` file by copying `.env.example` and fill in the values.

generate jwt token and pass it to postman:

```bash
yarn generate-jwt john.doe@example.com
```

test block numbers:
17000000
24174405

etherscan
https://etherscan.io/tx/0x0c0093106cb919958037a68aa3ce785a4c9a8ff430f4e49fd0c32a6348ee1c46

## Improvements

- Most of the code is over-engineered to demonstrate production-ready patterns. For such a small application, multiple layers and features are not strictly necessary.
- DDD and hexagonal architecture are used to demonstrate production-ready patterns. For such a small application, multiple layers and features are not strictly necessary.
- In more complex logic logic should be separated and much more validation will be needed to operate on blockchain data
