exports.up = (pgm) => {
  pgm.sql(`
    -- Drop the old index on status column
    DROP INDEX IF EXISTS idx_subtasks_status;
    
    -- Drop the CHECK constraint on status column
    ALTER TABLE subtasks DROP CONSTRAINT IF EXISTS subtasks_status_check;
    
    -- Drop the existing default constraint
    ALTER TABLE subtasks ALTER COLUMN status DROP DEFAULT;
    
    -- Change the status column from varchar to boolean
    ALTER TABLE subtasks ALTER COLUMN status TYPE BOOLEAN USING false;
    
    -- Set default value for the boolean status column
    ALTER TABLE subtasks ALTER COLUMN status SET DEFAULT false;
    
    -- Add index on the modified boolean status column
    CREATE INDEX idx_subtasks_status ON subtasks(status);
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    -- Drop the index on boolean status column
    DROP INDEX IF EXISTS idx_subtasks_status;
    
    -- Drop the boolean default constraint
    ALTER TABLE subtasks ALTER COLUMN status DROP DEFAULT;
    
    -- Change the status column from boolean back to varchar
    ALTER TABLE subtasks ALTER COLUMN status TYPE VARCHAR(20) USING 'todo';
    
    -- Set default value for the varchar status column
    ALTER TABLE subtasks ALTER COLUMN status SET DEFAULT 'todo';
    
    -- Add back the CHECK constraint
    ALTER TABLE subtasks ADD CONSTRAINT subtasks_status_check CHECK (status IN ('todo', 'doing', 'done'));
    
    -- Add back the original index on status column
    CREATE INDEX idx_subtasks_status ON subtasks(status);
  `);
};