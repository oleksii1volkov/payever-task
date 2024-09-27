import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { connect, Connection, Channel } from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: Connection;
  private channel: Channel;

  async onModuleInit() {
    try {
      // Establish a connection to RabbitMQ
      this.connection = await connect(
        process.env.RABBITMQ_URI || 'amqp://localhost',
      );
      // Create a channel
      this.channel = await this.connection.createChannel();
      console.log('Connected to RabbitMQ');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
    }
  }

  async onModuleDestroy() {
    // Clean up when the module is destroyed
    await this.channel.close();
    await this.connection.close();
  }

  async sendToQueue(queue: string, message: string) {
    // Ensure the queue exists
    await this.channel.assertQueue(queue, { durable: true });
    // Send a message to the queue
    return this.channel.sendToQueue(queue, Buffer.from(message));
  }

  async consume(queue: string, onMessage: (msg: Buffer) => void) {
    await this.channel.assertQueue(queue, { durable: true });
    this.channel.consume(queue, (message) => {
      if (message) {
        onMessage(message.content);
        this.channel.ack(message); // Acknowledge the message
      }
    });
  }

  async publishEvent(
    exchange: string,
    routingKey: string,
    message: any,
  ): Promise<boolean> {
    try {
      await this.channel.assertExchange(exchange, 'direct', { durable: true });
    } catch (error) {
      console.error('Failed to assert exchange:', error);
      throw new Error('Failed to setup the exchange in RabbitMQ');
    }

    return this.channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(message)),
    );
  }
}
