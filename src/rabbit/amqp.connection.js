import amqplib from 'amqplib'

let connection = null
let channel = null

/**
 * Get a shared AMQP channel.
 * @returns {Promise<import('amqplib').Channel>}
 */
export async function getChannel() {
  if (channel) return channel

  const url = process.env.AMQP_URL
  if (!url) throw new Error('AMQP_URL is not set')

  connection = await amqplib.connect(url)

  connection.on('close', () => {
    connection = null
    channel = null
  })

  connection.on('error', () => {
    connection = null
    channel = null
  })

  channel = await connection.createChannel()
  return channel
}
