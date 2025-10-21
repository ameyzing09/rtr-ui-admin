# NestJS Implementation Examples (Job-Application Service)

## Complete Working Examples

### File Structure

```
job-application-service/
├── src/
│   ├── common/
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── exceptions/
│   │   │   └── custom.exceptions.ts
│   │   └── interceptors/
│   │       └── transform.interceptor.ts
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── guards/
│   │       └── jwt.guard.ts
│   ├── jobs/
│   │   ├── jobs.controller.ts
│   │   └── jobs.service.ts
│   └── main.ts
```

---

## src/common/filters/http-exception.filter.ts

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface ErrorResponse {
  message: string;
  statusCode: number;
  error: string;
  code: string;
  details?: any;
  correlationId?: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Extract message and error from exception
    const message = this.extractMessage(exceptionResponse);
    const error = this.extractError(exceptionResponse, status);
    const code = this.extractOrGenerateCode(exceptionResponse, status, message);

    const errorResponse: ErrorResponse = {
      message: Array.isArray(message) ? message.join(', ') : message,
      statusCode: status,
      error,
      code,
    };

    // Add details if present
    if (typeof exceptionResponse === 'object' && (exceptionResponse as any).details) {
      errorResponse.details = (exceptionResponse as any).details;
    }

    // Add correlation ID for server errors
    if (status >= 500) {
      errorResponse.correlationId = this.generateCorrelationId();
      this.logError(exception, errorResponse.correlationId, request);
    }

    response.status(status).json(errorResponse);
  }

  private extractMessage(exceptionResponse: string | object): string | string[] {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    const response = exceptionResponse as any;
    return response.message || 'An error occurred';
  }

  private extractError(exceptionResponse: string | object, status: number): string {
    if (typeof exceptionResponse === 'string') {
      return HttpStatus[status];
    }

    const response = exceptionResponse as any;
    return response.error || HttpStatus[status];
  }

  private extractOrGenerateCode(
    exceptionResponse: string | object,
    status: number,
    message: string | string[]
  ): string {
    // Check if code is already provided
    if (typeof exceptionResponse === 'object' && (exceptionResponse as any).code) {
      return (exceptionResponse as any).code;
    }

    // Generate code based on status and message
    return this.generateErrorCode(status, message);
  }

  private generateErrorCode(status: number, message: string | string[]): string {
    const msg = Array.isArray(message) ? message[0] : message;
    const lowerMsg = msg.toLowerCase();

    // Authentication errors
    if (status === 401) {
      if (lowerMsg.includes('token')) return 'INVALID_TOKEN';
      if (lowerMsg.includes('credentials') || lowerMsg.includes('password')) {
        return 'INVALID_CREDENTIALS';
      }
      return 'UNAUTHORIZED';
    }

    // Authorization errors
    if (status === 403) return 'FORBIDDEN';

    // Not found errors
    if (status === 404) {
      if (lowerMsg.includes('job')) return 'JOB_NOT_FOUND';
      if (lowerMsg.includes('user')) return 'USER_NOT_FOUND';
      if (lowerMsg.includes('application')) return 'APPLICATION_NOT_FOUND';
      return 'RESOURCE_NOT_FOUND';
    }

    // Conflict errors
    if (status === 409) {
      if (lowerMsg.includes('email')) return 'EMAIL_ALREADY_EXISTS';
      return 'DUPLICATE_RESOURCE';
    }

    // Validation errors
    if (status === 422 || status === 400) return 'VALIDATION_ERROR';

    // Rate limiting
    if (status === 429) return 'RATE_LIMIT_EXCEEDED';

    // Server errors
    if (status >= 500) return 'INTERNAL_ERROR';

    return 'UNKNOWN_ERROR';
  }

  private generateCorrelationId(): string {
    return `req-${Date.now()}-${uuidv4().substring(0, 8)}`;
  }

  private logError(exception: HttpException, correlationId: string, request: any) {
    console.error('[ERROR]', {
      correlationId,
      message: exception.message,
      stack: exception.stack,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    });
  }
}
```

---

## src/common/exceptions/custom.exceptions.ts

```typescript
import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Base custom HTTP exception with error code support
 */
export class CustomHttpException extends HttpException {
  constructor(
    message: string,
    status: number,
    code: string,
    details?: any
  ) {
    super(
      {
        message,
        error: HttpStatus[status],
        code,
        details,
      },
      status
    );
  }
}

// Authentication Exceptions

export class InvalidCredentialsException extends CustomHttpException {
  constructor() {
    super(
      'Invalid email or password',
      HttpStatus.UNAUTHORIZED,
      'INVALID_CREDENTIALS'
    );
  }
}

export class InvalidTokenException extends CustomHttpException {
  constructor() {
    super(
      'Your session has expired. Please log in again.',
      HttpStatus.UNAUTHORIZED,
      'INVALID_TOKEN'
    );
  }
}

export class UnauthorizedException extends CustomHttpException {
  constructor() {
    super(
      'Authentication required. Please log in.',
      HttpStatus.UNAUTHORIZED,
      'UNAUTHORIZED'
    );
  }
}

// Authorization Exceptions

export class ForbiddenException extends CustomHttpException {
  constructor(message: string = "You don't have permission to perform this action.") {
    super(
      message,
      HttpStatus.FORBIDDEN,
      'FORBIDDEN'
    );
  }
}

export class InsufficientPermissionsException extends CustomHttpException {
  constructor(requiredPermission: string, userRole: string) {
    super(
      `Insufficient permissions. This action requires ${requiredPermission}.`,
      HttpStatus.FORBIDDEN,
      'INSUFFICIENT_PERMISSIONS',
      { required: requiredPermission, userRole }
    );
  }
}

// Resource Exceptions

export class ResourceNotFoundException extends CustomHttpException {
  constructor(resource: string, id?: string) {
    const resourceUpper = resource.toUpperCase().replace(' ', '_');
    super(
      `${resource} not found${id ? ` or no longer available` : ''}`,
      HttpStatus.NOT_FOUND,
      `${resourceUpper}_NOT_FOUND`,
      id ? { id } : undefined
    );
  }
}

export class JobNotFoundException extends CustomHttpException {
  constructor(jobId?: string) {
    super(
      'Job not found or no longer available',
      HttpStatus.NOT_FOUND,
      'JOB_NOT_FOUND',
      jobId ? { jobId } : undefined
    );
  }
}

export class ApplicationNotFoundException extends CustomHttpException {
  constructor(applicationId?: string) {
    super(
      'Application not found',
      HttpStatus.NOT_FOUND,
      'APPLICATION_NOT_FOUND',
      applicationId ? { applicationId } : undefined
    );
  }
}

// Validation Exceptions

export class ValidationException extends CustomHttpException {
  constructor(message: string = 'Validation failed. Please check the required fields.', details?: any) {
    super(
      message,
      HttpStatus.UNPROCESSABLE_ENTITY,
      'VALIDATION_ERROR',
      details
    );
  }
}

export class InvalidEmailException extends CustomHttpException {
  constructor() {
    super(
      'Please enter a valid email address.',
      HttpStatus.UNPROCESSABLE_ENTITY,
      'INVALID_EMAIL'
    );
  }
}

export class WeakPasswordException extends CustomHttpException {
  constructor() {
    super(
      'Password must be at least 8 characters and include uppercase, lowercase, and numbers.',
      HttpStatus.UNPROCESSABLE_ENTITY,
      'WEAK_PASSWORD'
    );
  }
}

// Conflict Exceptions

export class DuplicateResourceException extends CustomHttpException {
  constructor(resource: string, field?: string) {
    super(
      `A ${resource} with this ${field || 'identifier'} already exists.`,
      HttpStatus.CONFLICT,
      'DUPLICATE_RESOURCE',
      field ? { field } : undefined
    );
  }
}

export class EmailAlreadyExistsException extends CustomHttpException {
  constructor(email: string) {
    super(
      'This email is already registered. Please use a different email or try logging in.',
      HttpStatus.CONFLICT,
      'EMAIL_ALREADY_EXISTS',
      { email }
    );
  }
}

// Rate Limiting Exceptions

export class RateLimitExceededException extends CustomHttpException {
  constructor(retryAfter: number) {
    super(
      `Too many requests. Please try again in ${retryAfter} seconds.`,
      HttpStatus.TOO_MANY_REQUESTS,
      'RATE_LIMIT_EXCEEDED',
      { retryAfter }
    );
  }
}

// Server Exceptions

export class InternalServerErrorException extends CustomHttpException {
  constructor(correlationId?: string) {
    super(
      'An unexpected error occurred. Our team has been notified.',
      HttpStatus.INTERNAL_SERVER_ERROR,
      'INTERNAL_ERROR',
      correlationId ? { correlationId } : undefined
    );
  }
}

export class ServiceUnavailableException extends CustomHttpException {
  constructor() {
    super(
      'Service is temporarily unavailable. Please try again later.',
      HttpStatus.SERVICE_UNAVAILABLE,
      'SERVICE_UNAVAILABLE'
    );
  }
}
```

---

## src/auth/auth.service.ts

```typescript
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  InvalidCredentialsException,
  InvalidTokenException,
} from '../common/exceptions/custom.exceptions';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new InvalidCredentialsException();
    }

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    return {
      Token: this.jwtService.sign(payload),
      ExpiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
      User: {
        ID: user.id,
        Email: user.email,
        Name: user.name,
        Role: user.role,
        TenantID: user.tenantId,
      },
    };
  }

  async validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new InvalidTokenException();
    }
  }
}
```

---

## src/jobs/jobs.service.ts

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './entities/job.entity';
import {
  JobNotFoundException,
  ValidationException,
} from '../common/exceptions/custom.exceptions';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
  ) {}

  async findAll(tenantId: string): Promise<Job[]> {
    return this.jobRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<Job> {
    const job = await this.jobRepository.findOne({
      where: { id, tenantId },
    });

    if (!job) {
      throw new JobNotFoundException(id);
    }

    return job;
  }

  async create(createJobDto: CreateJobDto, tenantId: string): Promise<Job> {
    // Validation example
    if (!createJobDto.title || createJobDto.title.trim().length === 0) {
      throw new ValidationException('Job title is required', {
        field: 'title',
        constraint: 'Title cannot be empty',
      });
    }

    const job = this.jobRepository.create({
      ...createJobDto,
      tenantId,
    });

    return this.jobRepository.save(job);
  }

  async update(id: string, updateJobDto: UpdateJobDto, tenantId: string): Promise<Job> {
    const job = await this.findOne(id, tenantId);

    Object.assign(job, updateJobDto);

    return this.jobRepository.save(job);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const job = await this.findOne(id, tenantId);

    await this.jobRepository.remove(job);
  }
}
```

---

## src/jobs/jobs.controller.ts

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CreateJobDto, UpdateJobDto } from './dto';

@Controller('job')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  async findAll(@Request() req) {
    const tenantId = req.user.tenantId;
    return this.jobsService.findAll(tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const tenantId = req.user.tenantId;
    return this.jobsService.findOne(id, tenantId);
  }

  @Post()
  async create(@Body() createJobDto: CreateJobDto, @Request() req) {
    const tenantId = req.user.tenantId;
    return this.jobsService.create(createJobDto, tenantId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
    @Request() req
  ) {
    const tenantId = req.user.tenantId;
    return this.jobsService.update(id, updateJobDto, tenantId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const tenantId = req.user.tenantId;
    await this.jobsService.remove(id, tenantId);
    return {
      success: true,
      message: 'Job deleted successfully',
    };
  }
}
```

---

## src/auth/guards/jwt.guard.ts

```typescript
import {
  Injectable,
  ExecutionContext,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UnauthorizedException } from '../../common/exceptions/custom.exceptions';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
```

---

## src/main.ts

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // CORS
  app.enableCors();

  await app.listen(8080);
}
bootstrap();
```

---

## Testing Example

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('JobsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return standardized error for invalid token', () => {
    return request(app.getHttpServer())
      .get('/job')
      .set('Authorization', 'Bearer invalid-token')
      .expect(HttpStatus.UNAUTHORIZED)
      .expect((res) => {
        expect(res.body).toEqual({
          message: 'Your session has expired. Please log in again.',
          statusCode: 401,
          error: 'Unauthorized',
          code: 'INVALID_TOKEN',
        });
      });
  });

  it('should return standardized error for job not found', () => {
    return request(app.getHttpServer())
      .get('/job/non-existent-id')
      .set('Authorization', 'Bearer valid-token')
      .expect(HttpStatus.NOT_FOUND)
      .expect((res) => {
        expect(res.body).toMatchObject({
          message: 'Job not found or no longer available',
          statusCode: 404,
          error: 'Not Found',
          code: 'JOB_NOT_FOUND',
        });
      });
  });

  it('should return standardized validation error', () => {
    return request(app.getHttpServer())
      .post('/job')
      .set('Authorization', 'Bearer valid-token')
      .send({ title: '' }) // Invalid: empty title
      .expect(HttpStatus.UNPROCESSABLE_ENTITY)
      .expect((res) => {
        expect(res.body).toMatchObject({
          statusCode: 422,
          error: 'Unprocessable Entity',
          code: 'VALIDATION_ERROR',
        });
      });
  });
});
```

---

## Summary

This implementation provides:
- ✅ Global exception filter for standardized responses
- ✅ Custom exception classes with error codes
- ✅ Automatic error code generation
- ✅ User-friendly error messages
- ✅ Correlation IDs for server errors
- ✅ Comprehensive error logging
- ✅ Validation pipe integration
- ✅ TypeScript type safety

All responses follow the standardized format expected by the frontend.
