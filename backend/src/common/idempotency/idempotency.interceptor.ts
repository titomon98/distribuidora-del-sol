import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  ConflictException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Observable, from, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { IdempotencyKey } from './idempotency-key.entity';

/**
 * Interceptor de idempotencia para operaciones de escritura.
 *
 * Uso: decorar el controlador/handler con `@UseInterceptors(IdempotencyInterceptor)`.
 * El cliente debe enviar la cabecera `Idempotency-Key`.
 *
 * Flujo:
 *  1. Si no hay cabecera, se deja pasar la petición sin control (útil para GET).
 *  2. Se intenta INSERTAR la clave con estado EN_PROCESO. El índice único hace
 *     que dos clicks simultáneos compitan: solo uno gana el INSERT.
 *     - Si el INSERT falla por clave duplicada => ya existe:
 *         - si está COMPLETADO, se devuelve la respuesta guardada.
 *         - si sigue EN_PROCESO, se responde 409 (la otra petición va en camino).
 *  3. El que gana ejecuta el handler y guarda la respuesta (COMPLETADO).
 *
 * NOTA: implementación base. Se afinará (TTL, hash del body, alcance por
 * usuario/endpoint) cuando se conecten los módulos de venta/compra.
 */
@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const clave: string | undefined =
      req.headers['idempotency-key'] || req.headers['Idempotency-Key'];

    if (!clave) {
      return next.handle();
    }

    const repo = this.dataSource.getRepository(IdempotencyKey);

    return from(
      (async () => {
        const existente = await repo.findOne({ where: { clave } });
        if (existente) {
          if (existente.estado === 'COMPLETADO') {
            return { yaResuelto: true, body: existente.responseBody };
          }
          throw new ConflictException(
            'Operación en proceso: la misma solicitud ya se está ejecutando.',
          );
        }

        // Insert "gana la carrera": el índice único bloquea duplicados.
        try {
          await repo.insert({
            clave,
            metodo: req.method,
            endpoint: req.originalUrl ?? req.url,
            usuarioId: req.user?.id ?? null,
            estado: 'EN_PROCESO',
          });
        } catch {
          throw new ConflictException(
            'Operación duplicada: solicitud idéntica en curso.',
          );
        }
        return { yaResuelto: false };
      })(),
    ).pipe(
      switchMap((estado: { yaResuelto: boolean; body?: unknown }) => {
        if (estado.yaResuelto) {
          return of(estado.body);
        }
        return next.handle().pipe(
          switchMap((body) =>
            from(
              repo
                .update({ clave }, { estado: 'COMPLETADO', responseBody: body })
                .then(() => body),
            ),
          ),
        );
      }),
    );
  }
}
