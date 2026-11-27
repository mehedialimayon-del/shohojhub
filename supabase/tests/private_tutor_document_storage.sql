do $$
begin
  if not exists (
    select from storage.buckets where id = 'tutor-verification' and not public and file_size_limit = 5242880
      and allowed_mime_types = array['application/pdf','image/jpeg','image/png']
  ) then raise exception 'Private tutor bucket settings are incorrect'; end if;

  if (select count(*) from pg_policies where schemaname = 'storage' and tablename = 'objects'
    and policyname in ('shohojhub_tutor_document_insert', 'shohojhub_tutor_document_read', 'shohojhub_tutor_document_delete')
    and roles = array['authenticated']::name[]) <> 3 then
    raise exception 'Tutor storage ownership policies are missing';
  end if;
end $$;
select 'private tutor bucket settings passed' as result;
