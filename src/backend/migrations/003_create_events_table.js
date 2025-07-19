exports.up = function(knex) {
  return knex.schema.createTable('events', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
    table.uuid('category_id').notNullable().references('id').inTable('categories').onDelete('CASCADE')
    table.string('title', 200).notNullable()
    table.text('description')
    table.timestamp('start_date').notNullable()
    table.timestamp('end_date').notNullable()
    table.boolean('all_day').defaultTo(false)
    table.string('location', 200)
    table.json('reminder') // { enabled: boolean, minutes: number }
    table.json('repeat') // { type: string, end_date: date, dates: date[] }
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
    
    // Indexes
    table.index(['user_id'])
    table.index(['category_id'])
    table.index(['start_date'])
    table.index(['end_date'])
    table.index(['user_id', 'start_date'])
    table.index(['user_id', 'category_id'])
  })
}

exports.down = function(knex) {
  return knex.schema.dropTable('events')
}
