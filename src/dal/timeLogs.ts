// TODO: Student implementation - Part 2: DAL for time logs
import { db, TimeLog } from '../db/database.js';

export async function insertTimeLog(
  ticketId: number,
  userId: number,
  hours: number,
): Promise<TimeLog> {
  // TODO: Student implementation
  const result = await db
    .insertInto('time_logs')
    .values({ ticket_id: ticketId, user_id: userId, hours })
    .returningAll()
    .executeTakeFirstOrThrow();

  return result;
}

export async function getTotalHoursForTicket(
  ticketId: number,
): Promise<number> {
  // TODO: Student implementation
  const result = await db
    .selectFrom('time_logs')
    .select((eb) =>
      eb.fn.sum<string | number | null>('hours').as('total_hours'),
    )
    .where('ticket_id', '=', ticketId)
    .executeTakeFirst();

  return result?.total_hours != null ? Number(result.total_hours) : 0;
}
