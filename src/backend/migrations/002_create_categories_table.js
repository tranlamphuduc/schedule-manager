exports.up = function(knex) {
  return knex.schema.createTable('categories', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
    table.string('name', 100).notNullable()
    table.string('color', 7).notNullable() // Hex color code
    table.text('description')
    table.boolean('is_default').defaultTo(false)
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
    
    // Indexes
    table.index(['user_id'])
    table.index(['user_id', 'name'])
    table.index(['is_default'])
  })
}

exports.down = function(knex) {
  return knex.schema.dropTable('categories')
}
