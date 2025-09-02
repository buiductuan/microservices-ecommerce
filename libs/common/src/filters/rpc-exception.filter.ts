import { Catch, RpcExceptionFilter, ArgumentsHost, Logger } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class AllRpcExceptionFilter implements RpcExceptionFilter<RpcException> {
  private readonly logger = new Logger(AllRpcExceptionFilter.name);

  catch(exception: RpcException, host: ArgumentsHost): Observable<any> {
    const error = exception.getError();
    
    this.logger.error('RPC Exception:', error);

    return throwError(() => exception.getError());
  }
}
