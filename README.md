# Qlub Backoffice API

The Qlub API for Backoffice Operations. User Management & Analytics Platform

## How to Run?

### with Docker & Docker Compose

```
docker-compose up --build
```

### Local

Note: use Node Version 18 for avoiding version compatibility.

#### Pre-requisites
- Node.js
- Redis
- PostgreSQL

Install
```
npm i
```

Run build
```
npm run build
npm run start:prod
```

Or run it as a development server
```
npm run start:dev
```

<br>

## Usage

After running application, signin with the credentials below

```
{
  "email": "sample_admin_accountt@gmail.com",
  "password": "admin"
}
```

### Or

Create an account via `/auth/signup`

## Implemented Features

I fully completed the cases including Optionals and Additional Challenges. Here is the overview:

- **Required**:
  - User Registration and Athentication ✅
  - Role-Based Access Control (RBAC) ✅
  - User Activity Tracking ✅
  - Admin Analytics Dashboard ✅
  - Background Jobs ✅
- **Optional**
  - WebSocket Integration ✅
- **Additional**

  - Rate Limiting for Login Attempts ✅
  - Activity-Based Notification System ✅
  - Dynamic Role-Based Filtering ✅
  - Data Consistency in Caching ✅
  - Postman Collection ✅

- **Extras** (I wanted to add a couple of features too):
  - Health checks for database and redis to monitor & alert possible issues
  - Indexing columns
  - Strict body validation with class-validator & class-transformer
  - Swagger documentation
  - Logger implementation
  - Docker & Docker-Compose for kernel-independent runs and avoiding compatibility issues
  - Response type declarations
  - Eslint rules & Prettier setup
  - Husky

<br>

# My Approach

I created a robust structure considering low technical debt requirements. So I declared models for database tables, interfaces for handling schema-only operations, and responses for consistent API documentation. So we can avoid unexpected changes, alerts.

### Controllers

I ensured that the controllers handle only business logic by offloading non-business concerns (like caching and logging) to custom decorators and interceptors. This separation keeps the controllers clean, making them easier to read and maintain.

### Services

Services for each entity. So we can easily manage the business logic and keep the controllers clean. So we can avoid code duplication and keep the codebase DRY.

### Interceptors

Any changes in the interceptor will affect all the controllers which means we can easily manage the cross-cutting concerns.

### Data Transfer Objects

I used DTOs for request validation for avoiding unexpected data.
Custom decorators add flexibility to keep the code concise and readable

## What could be improved?

As you know a codebase is never perfect. So there are always things to improve. Here are some of them:

- **Dynamic Module Imports:** Instead of relying on long relative paths (e.g., ../../../), we can explore dynamic imports or barrel files to clean up imports and enhance scalability. Such as `import { User } from '@models/user.model';`
- **Debugging:** More detailed logging for better debugging.
- **Database Optimization:** Model repositories for better data management.
- **Test Coverage:** Although the app is functional, end-to-end tests could be implemented for more comprehensive validation.
- **CI/CD:** Implementing CI/CD pipelines for automated testing and deployment.
- **Security:** More security features like CSRF protection, JWT expiration, and token revocation.
- **Error Handling:** More detailed error handling for better user experience.

## Conclusion

I enjoyed working on this project. I hope you like my approach and the features I implemented. I'm looking forward to your feedback and suggestions. Thank you for this opportunity.

Best,
Yusuf