
-- Function to enable realtime for a specific table
CREATE OR REPLACE FUNCTION enable_realtime_subscription(table_name TEXT)
RETURNS VOID AS $$
BEGIN
  -- Add the table to the publication that allows all operations
  EXECUTE format('
    ALTER PUBLICATION supabase_realtime 
    ADD TABLE %I', table_name);

  -- Set the replica identity to FULL to ensure the entire row is sent
  EXECUTE format('
    ALTER TABLE %I REPLICA IDENTITY FULL', table_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if table is already in the publication
CREATE OR REPLACE FUNCTION is_table_in_publication(table_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  result BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = table_name
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
