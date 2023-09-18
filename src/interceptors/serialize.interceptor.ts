import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Observable, map } from 'rxjs';
import { ClassConstructor } from 'class-transformer';

export function Serialize<T>(dto: ClassConstructor<T>) {
  return UseInterceptors(new ClassSerializerInterceptor(dto));
}

export class ClassSerializerInterceptor<T> implements NestInterceptor {
  constructor(private readonly dto: ClassConstructor<T>) {}
  intercept(context: ExecutionContext, handler: CallHandler): Observable<T> {
    return handler.handle().pipe(
      map((data: T) => {
        return plainToInstance(this.dto, data, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
