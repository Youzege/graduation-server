import { EventsService } from './events.service'
import { CreateEventDto } from './input/create-event.dto'
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { UpdateEventDto } from './input/update-event.dto'
import { Event } from './event.entity'
import { Like, MoreThan, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { ListEvents } from './input/list.events'

@Controller('/events')
export class EventsController {
  private readonly logger = new Logger(EventsController.name)

  constructor(
    @InjectRepository(Event)
    private readonly repository: Repository<Event>,
    private readonly eventsService: EventsService,
  ) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Query() filter: ListEvents) {
    const event =
      await this.eventsService.getEventsWithAttendeeCountFilteredPaginated(
        filter,
        {
          total: true,
          currentPage: filter.page,
          limit: 2,
        },
      )
    return event
  }

  @Get('/practice')
  async practice() {
    return await this.repository.find({
      select: ['id', 'when'],
      where: [{ id: MoreThan(0) }, { description: Like('%a%') }],
      take: 2,
      order: { id: 'DESC' },
    })
  }

  @Get('practice2')
  async practice2() {
    // return await this.repository.findOne(1, {
    //   relations: ['attendees'],
    //   loadEagerRelations: false,
    // })
    return await this.repository
      .createQueryBuilder('e')
      .select(['e.id', 'e.name'])
      .orderBy('e.id', 'DESC')
      .getMany()
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id) {
    // console.log(typeof id); // number
    const event = await this.eventsService.getEvent(id)

    if (!event) {
      throw new NotFoundException()
    }

    return event
  }

  @Post()
  async create(@Body() input: CreateEventDto) {
    return await this.repository.save({
      ...input,
      when: new Date(input.when),
    })
  }

  @Patch(':id')
  async update(@Param('id') id, @Body() input: UpdateEventDto) {
    const event = await this.repository.findOne(id)

    if (!event) {
      throw new NotFoundException()
    }

    return await this.repository.save({
      ...event,
      ...input,
      when: input.when ? new Date(input.when) : event.when,
    })
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id) {
    const result = await this.eventsService.deleteEvent(id)
    if (result?.affected !== 1) {
      throw new NotFoundException()
    }
  }
}
