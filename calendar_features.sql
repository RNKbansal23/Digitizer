    -- 1. Add Unique Constraint to daily_logs
    -- This allows us to use upsert so a teacher can edit attendance for the same day and class
    ALTER TABLE daily_logs ADD CONSTRAINT daily_logs_date_class_school_key UNIQUE (date, class_id, school_id);
