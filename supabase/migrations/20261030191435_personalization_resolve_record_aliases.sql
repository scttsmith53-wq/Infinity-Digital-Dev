do $$begin execute replace(pg_get_functiondef('prospecting.personalization_api(text,jsonb)'::regprocedure),E'declare worker boolean',E'#variable_conflict use_column\ndeclare worker boolean');end$$;
