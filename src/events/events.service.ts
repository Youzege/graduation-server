import { paginate, PaginateOptions } from './../pagination/pagination'
import { ListEvents, WhenEventFilter } from './input/list.events'
import { AttendeeAnswerEnum } from './attendee.entity'
import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeleteResult, Repository } from 'typeorm'
import { Event } from './event.entity'

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name)

  constructor(
    @InjectRepository(Event)
    private readonly eventsRespository: Repository<Event>,
  ) {}

  private getEventsBaseQuery() {
    return this.eventsRespository
      .createQueryBuilder('e')
      .orderBy('e.id', 'DESC')
  }

  public getEventsWithAttendeeCountQuery() {
    return this.getEventsBaseQuery()
  }

  private async getEventsWithAttendeeCountFiltered(filter?: ListEvents) {
    const query = this.getEventsWithAttendeeCountQuery()

    if (!filter) {
      return query
    }

    return await query
  }

  public async getEventsWithAttendeeCountFilteredPaginated(
    filter: ListEvents,
    paginateOptions: PaginateOptions,
  ) {
    return await paginate(
      await this.getEventsWithAttendeeCountFiltered(filter),
      paginateOptions,
    )
  }

  public async getEvent(id: number): Promise<Event | undefined> {
    const query = this.getEventsWithAttendeeCountQuery().andWhere(
      'e.id = :id',
      { id },
    )

    this.logger.debug(query.getSql())

    return await query.getOne()
  }

  public async deleteEvent(id: number): Promise<DeleteResult> {
    return await this.eventsRespository
      .createQueryBuilder('e')
      .delete()
      .where('id = :id', { id })
      .execute()
  }
}
