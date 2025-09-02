export interface MicroserviceConfig {
  name: string;
  port: number;
  host?: string;
  timeout?: number;
  retries?: number;
}

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ServiceRequest<T = any> {
  pattern: string;
  data: T;
  userId?: string;
  traceId?: string;
}
