
-- Function to get the current server timestamp
CREATE OR REPLACE FUNCTION get_server_timestamp()
RETURNS timestamp with time zone
LANGUAGE SQL
AS $$
  SELECT NOW();
$$;
