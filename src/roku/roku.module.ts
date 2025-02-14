import { Module } from '@nestjs/common';
import { RokuService } from 'src/roku/roku.service';

@Module({ providers: [RokuService], exports: [RokuService] })
export class RokuModule {}
