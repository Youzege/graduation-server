# tnest JS

## 基础入门

### controller

http 请求 request -> controller -> 处理请求 方法&路由 (GET /user) -> 请求响应 response

简单说，就是 前端发送请求 controller 进行请求处理，最后响应数据的过程



简单的示例

```ts
// app.controller.ts

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
// GET请求
  @Get('/bye')
  getBye(): string {
    return 'bye123';
  }
}

```



##### resource controller

数据库作为数据源 进行操作，crud，http请求进行增删改查



##### 创建一个新 controller

restful 规范的接口

```ts
// events.controller.ts
import { Controller, Delete, Get, Patch, Post } from '@nestjs/common';

@Controller('/events')
export class EventsController {
  @Get()
  findAll() {}
  @Get()
  findOne() {}
  @Post()
  create() {}
  @Patch()
  update() {}
  @Delete()
  delete() {}
}
```

记得导入module

```ts
// app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsController } from './events.controller';

@Module({
  imports: [],
  controllers: [AppController, EventsController],
  providers: [AppService],
})
export class AppModule {}

```



##### 路由参数

希望通过id来查询字段，通过路由中添加参数

需要一个装饰器来完成这个操作 @Param

```ts
// events.controller.ts
import { Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

@Controller('/events')
export class EventsController {
  @Get()
  findAll() {}
  @Get(':id')
  findOne(@Param('id') id) {
    return id;
  }
  @Post()
  create() {}
  @Patch(':id')
  update(@Param('id') id) {
    return id;
  }
  @Delete(':id')
  delete(@Param('id') id) {
    return id;
  }
}

```



##### request body 请求体

Post请求需要接收参数，请求体

装饰器 @Body

```ts
// events.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

@Controller('/events')
export class EventsController {
  @Get()
  findAll() {}
  @Get(':id')
  findOne(@Param('id') id) {
    return id;
  }
  @Post()
  create(@Body() input) {
    return input;
  }
  @Patch(':id')
  update(@Param('id') id) {
    return id;
  }
  @Delete(':id')
  delete(@Param('id') id) {
    return id;
  }
}

```



##### 返回响应数据

发送请求后，nest 需要返回 响应数据 json

删除后，HttpCode 响应码更改为 204

```ts
// events.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

@Controller('/events')
export class EventsController {
  @Get()
  findAll() {}
  @Get(':id')
  findOne(@Param('id') id) {
    return [
      { id: 1, name: 'youzege' },
      { id: 2, name: 'lizehang' },
    ];
  }
  @Post()
  create(@Body() input) {
    return input;
  }
  @Patch(':id')
  update(@Param('id') id, @Body() input) {
    return input;
  }
  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id') id) {
    return id;
  }
}

```



##### 数据传输对象

数据传输过程中，配置好需要的请求参数，用来给他人使用

###### CreateEventDto

```ts
// create-events.dto.ts
export class CreateEventDto {
  name: 'string';
  description: 'string';
  when: 'string';
  address: 'string';
}

```

###### UpdateEventDto

继承 create-event Dto

npm i --save @nestjs/mapped-types

用来判断 请求参数 是否存在

```ts
// update-events.dto.ts
import { CreateEventDto } from './create-event.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateEventDto extends PartialType(CreateEventDto) {}

```



##### 实体对象 entity

创建一个数据实体

```ts
// event.entity.ts
export class Event {
  id: number;
  name: string;
  description: string;
  when: Date;
  address: string;
}

```

在controller中创建一个实体对象

所有路由操作都基于实体对象来进行crud

```ts
import { CreateEventDto } from './create-event.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UpdateEventDto } from './update-event.dto';
import { Event } from './event.entity';

@Controller('/events')
export class EventsController {
  private events: Event[] = [];
  @Get()
  findAll() {
    return this.events;
  }
  @Get(':id')
  findOne(@Param('id') id) {
    const event = this.events.find((event) => event.id === parseInt(id));
    return event;
  }
  @Post()
  create(@Body() input: CreateEventDto) {
    const event = {
      ...input,
      when: new Date(input.when),
      id: this.events.length + 1,
    };
    this.events.push(event);
    return event;
  }
  @Patch(':id')
  update(@Param('id') id, @Body() input: UpdateEventDto) {
    const index = this.events.findIndex((event) => event.id === parseInt(id));

    this.events[index] = {
      ...this.events[index],
      ...input,
      when: input.when ? new Date(input.when) : this.events[index].when,
    };
    return this.events[index];
  }
  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id') id) {
    this.events = this.events.filter((event) => event.id !== parseInt(id));
    return this.events;
  }
}

```



#### ORM

对象关系映射，后台和数据库之间的联系



nest的插件

npm install --save @nestjs/typeorm typeorm mysql



##### nest 中 加载mysql

这个是 阿里云服务器上的 mysql

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsController } from './events.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '112.74.95.70',
      port: 3306,
      username: 'root',
      password: '123456',
      database: 'graduation-server',
    }),
  ],
  controllers: [AppController, EventsController],
  providers: [AppService],
})
export class AppModule {}

```



##### entity创建表

给Event实体创建一张表，module中需要添加几个字段，用来给数据库新建表

```ts
import { Column, Entity, PrimaryColumn } from 'typeorm';

// @Entity('event')
@Entity()
export class Event {
  @PrimaryColumn()
  id: number;
  @Column({ length: 100 })
  name: string;
  @Column()
  description: string;
  // @Column({ name: 'when_date' })
  @Column()
  when: Date;
  @Column()
  address: string;
}

```

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Event } from './event.entity';
import { EventsController } from './events.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
  	  ...
      entities: [Event],
      synchronize: true,
    }),
  ],
  controllers: [AppController, EventsController],
  providers: [AppService],
})
export class AppModule {}

```



##### typeorm

使用typeorm ，实现crud

在entity中设置Column

```ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// @Entity('event')
@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ length: 100 })
  name: string;
  @Column()
  description: string;
  // @Column({ name: 'when_date' })
  @Column()
  when: Date;
  @Column()
  address: string;
}

```

event controller

使用 orm来操作实例

InjectRepository用来加载entity实体，进行crud

this.repository可以用几个方法来操作数据库 find findOne save remove等

```ts
import { CreateEventDto } from './create-event.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UpdateEventDto } from './update-event.dto';
import { Event } from './event.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('/events')
export class EventsController {
  constructor(
    @InjectRepository(Event)
    private readonly repository: Repository<Event>,
  ) {}
  @Get()
  async findAll() {
    return await this.repository.find();
  }
  @Get(':id')
  async findOne(@Param('id') id) {
    const event = await this.repository.findOne(id);
    return event;
  }
  @Post()
  async create(@Body() input: CreateEventDto) {
    return await this.repository.save({
      ...input,
      when: new Date(input.when),
    });
  }
  @Patch(':id')
  async update(@Param('id') id, @Body() input: UpdateEventDto) {
    const event = await this.repository.findOne(id);

    return await this.repository.save({
      ...event,
      ...input,
      when: input.when ? new Date(input.when) : event.when,
    });
  }
  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id) {
    const event = await this.repository.findOne(id);
    await this.repository.remove(event);
  }
}

```



##### 条件查询

repository中的条件查询

[查找选项|类型ORM (typeorm.io)](https://typeorm.io/find-options#advanced-options)

```ts
@Get('/practice')
  async practice() {
    return await this.repository.find({
      select: ['id', 'when'],
      where: [{ id: MoreThan(0) }, { description: Like('%a%') }],
      take: 2,
      order: { id: 'DESC' },
    });
  }
```



##### pipe

中间件，通俗来讲就是对请求接口的入参进行验证和转换的前置操作，验证好了我才会将内容给到路由对应的方法中去。

```ts
@Get(':id')
  async findOne(@Param('id', ParseIntPipe) id) {
    console.log(typeof id); // number
    const event = await this.repository.findOne(id);
    return event;
  }
```



##### 输入验证

`npm i --save class-validator class-transformer`

```ts
import { IsDateString, IsString, Length } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @Length(5, 255, {
    message: '请输入5至255字符',
  })
  name: 'string';
  @Length(5, 255, {
    message: '请输入5至255字符',
  })
  description: 'string';
  @IsDateString()
  when: 'string';
  @Length(5, 255)
  address: 'string';
}

```



**开启全局验证**

```ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();

```



**验证组、配置项**

针对不同的状态做验证

记得关掉全局验证

```ts
@Length(5, 255, { groups: ['create'] })
  @Length(10, 20, { groups: ['update'] })
```

```ts
@Post()
  async create(
    @Body(new ValidationPipe({ groups: ['create'] })) input: CreateEventDto,
  ) {
    return await this.repository.save({
      ...input,
      when: new Date(input.when),
    });
  }
  @Patch(':id')
  async update(
    @Param('id') id,
    @Body(new ValidationPipe({ groups: ['update'] })) input: UpdateEventDto,
  ) {
    const event = await this.repository.findOne(id);

    return await this.repository.save({
      ...event,
      ...input,
      when: input.when ? new Date(input.when) : event.when,
    });
  }
```



#### 创建自定义模型

创建一个模型

nest generate module events



#### 配置环境

开发环境、线上环境的配置

`npm i --save @nestjs/config`



src目录下新建 config文件夹

创建 orm.config.ts

```ts
import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Event } from 'src/events/event.entity';

export default registerAs(
  'orm.config',
  (): TypeOrmModuleOptions => ({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [Event],
    synchronize: true,
  }),
);

```



app.module.ts

改造后

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { ConfigModule } from '@nestjs/config';
import ormConfig from './config/orm.config';
import ormConfigProd from './config/orm.config.prod';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [ormConfig],
      expandVariables: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory:
        process.env.NODE_ENV !== 'production' ? ormConfig : ormConfigProd,
    }),
    EventsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

```





### 日志 Log



在controller中使用 日志

```ts
import { CreateEventDto } from './create-event.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { UpdateEventDto } from './update-event.dto';
import { Event } from './event.entity';
import { Like, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('/events')
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(
    @InjectRepository(Event)
    private readonly repository: Repository<Event>,
  ) {}
  @Get()
  async findAll() {
    this.logger.log(`查找所有 路由`);
    const event = await this.repository.find();
    this.logger.debug(`查找 ${event.length} events`);
    return event;
  }
  ....
}

```



在main.ts中可以设置显示哪个级别的日志信息

```ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug'],
  });
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();

```



### 错误处理

当遇到不存在的请求时

```ts
@Get(':id')
  async findOne(@Param('id', ParseIntPipe) id) {
    // console.log(typeof id); // number
    const event = await this.repository.findOne(id);

    if (!event) {
      throw new NotFoundException();
    }

    return event;
  }
```





### 查询构建器

Query Builder Introduction

`QueryBuilder`是 TypeORM 最强大的功能之一 ，它允许你使用优雅便捷的语法构建 SQL 查询，执行并获得自动转换的实体。

[使用 Query Builder 查询 | TypeORM 中文文档 (biunav.com)](https://typeorm.biunav.com/zh/select-query-builder.html#什么是querybuilder)



### 输入数据过滤
