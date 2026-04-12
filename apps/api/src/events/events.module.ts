import { Module } from '@nestjs/common';
import { EventsController } from './events.gateway';

@Module({
  controllers: [EventsController],
})
export class EventsModule {}
