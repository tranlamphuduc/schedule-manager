exports.up = function(knex) {
  return knex.schema.createTable('notifications', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
    table.uuid('event_id').nullable().references('id').inTable('events').onDelete('CASCADE')
    table.string('title', 200).notNullable()
    table.text('message').notNullable()
    table.enum('type', ['event', 'system', 'reminder']).notNullable()
    table.boolean('is_read').defaultTo(false)
    table.timestamp('scheduled_for').nullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
    
    // Indexes
    table.index(['user_id'])
    table.index(['event_id'])
    table.index(['type'])
    table.index(['is_read'])
    table.index(['scheduled_for'])
    table.index(['user_id', 'is_read'])
    table.index(['user_id', 'type'])
  })
}

exports.down = function(knex) {
  return knex.schema.dropTable('notifications')
}
