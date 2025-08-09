exports.up = (pgm) => {
    pgm.sql(`
    ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_column_id_position_key;
    ALTER TABLE tasks
      ADD CONSTRAINT tasks_column_id_position_key
      UNIQUE (column_id, position) DEFERRABLE INITIALLY DEFERRED;
  `);
};

exports.down = (pgm) => {
    pgm.sql(`
    ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_column_id_position_key;
    ALTER TABLE tasks
      ADD CONSTRAINT tasks_column_id_position_key
      UNIQUE (column_id, position) NOT DEFERRABLE;
  `);
};


