import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import { AnalyticsService } from './analytics.service';
import { AnalyticsEvent } from './models/analytics.model';

interface Conditions {
  $gte?: HttpStatus;
  $lte?: HttpStatus;
  $gt?: HttpStatus;
  $lt?: HttpStatus;
  $eq?: HttpStatus;
  $ne?: HttpStatus;
  $in?: HttpStatus[];
  $nin?: HttpStatus[];
}

interface MapItem {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  status: Conditions;
  result: AnalyticsEvent;
  userID?: string;
}

interface PathMapper {
  [key: string]: MapItem[];
}

enum Paths {
  SIGNIN = '/auth/signin',
  REGISTER = '/auth/signup',
  UPDATE_USER = '/users/update',
}

const mapping: PathMapper = {
  [Paths.SIGNIN]: [
    {
      method: 'POST',
      status: { $gte: HttpStatus.BAD_REQUEST },
      result: AnalyticsEvent.FAILED_LOGIN_ATTEMPT,
    },
    {
      method: 'POST',
      status: { $eq: HttpStatus.CREATED },
      result: AnalyticsEvent.SUCCESSFUL_LOGIN,
      userID: 'id', // Inside the respnose object, the user ID is stored in the id field.
    },
  ],
  [Paths.REGISTER]: [
    {
      method: 'POST',
      status: { $eq: HttpStatus.CREATED },
      result: AnalyticsEvent.NEW_USER,
    },
  ],
  [Paths.UPDATE_USER]: [
    {
      method: 'PUT',
      status: { $eq: HttpStatus.OK },
      result: AnalyticsEvent.UPDATED_USER,
      userID: 'user.id',
    },
  ],
};

const pathMapper = (
  path: string,
  method: string,
  status: number,
): MapItem | false => {
  const pathMapping = mapping[path] || [];
  const result = pathMapping.filter(
    (item: Record<string, any>) => item.method === method,
  );

  for (const item of result) {
    if (item.status.$gte && status >= item.status.$gte) return item;
    if (item.status.$lte && status <= item.status.$lte) return item;
    if (item.status.$gt && status > item.status.$gt) return item;
    if (item.status.$lt && status < item.status.$lt) return item;
    if (item.status.$eq && status === item.status.$eq) return item;
    if (item.status.$ne && status !== item.status.$ne) return item;
    if (item.status.$in && item.status.$in.includes(status)) return item;
    if (item.status.$nin && !item.status.$nin.includes(status)) {
      return item;
    }
  }

  return false;
};

@Injectable()
export class AnalyticsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AnalyticsInterceptor.name);

  constructor(private readonly analyticsService: AnalyticsService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const path = req.path;
    const method = req.method;

    return next.handle().pipe(
      tap((response) => {
        const statusCode = res.statusCode;
        const event = pathMapper(path, method, statusCode);

        if (event) {
          let userID = response[event.userID];
          if (event.userID?.split('.').length > 1) {
            for (let i = 0; i < event.userID.split('.').length; i++) {
              if (response[event.userID.split('.')[i]]) {
                response['user'] = response[event.userID.split('.')[i]];
              }
            }
            userID = response['user']?.id;
          }

          // Note: We're not awaiting the result of the call for performance reasons.
          this.analyticsService.create({
            event: event.result,
            userID: userID,
            status: statusCode,
            method: method,
          });
        }
      }),
      catchError((error) => {
        this.logger.error(error);
        let statusCode = 500; // Default to 500 for non-HTTP exceptions.
        if (error instanceof HttpException) {
          statusCode = error.getStatus();
        }

        const event = pathMapper(path, method, statusCode);
        if (event) {
          // Note: We're not awaiting the result of the call for performance reasons.
          this.analyticsService.create({
            event: event.result,
            userID: req.user?.id,
            status: statusCode,
            method: method,
          });
        }

        // Rethrow the error to ensure it propagates correctly.
        return throwError(() => error);
      }),
    );
  }
}
