-- The server validates the edited draft before calling this function.
create function public.save_reviewed_question(p_question jsonb)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  saved_id uuid;
  draft_key text := p_question->>'id';
  answer_ids text[] := array(select jsonb_array_elements_text(p_question->'correctAnswerIds'));
begin
  if draft_key is null or draft_key !~ '^generated-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    raise exception 'Expected a generated question ID.' using errcode = '22023';
  end if;

  insert into public.questions (
    external_key, source_kind, validation_status, domain, topic, difficulty,
    question_type, question_text, select_count, correct_answer_ids,
    explanation, memory_hook, source_basis, tags
  ) values (
    draft_key, 'generated', 'valid', p_question->>'domain', p_question->>'topic',
    p_question->>'difficulty', p_question->>'questionType', p_question->>'questionText',
    (p_question->>'selectCount')::smallint, answer_ids, p_question->>'explanation',
    p_question->>'memoryHook', p_question->>'sourceBasis',
    array(select jsonb_array_elements_text(p_question->'tags'))
  )
  on conflict (external_key) do nothing
  returning id into saved_id;

  if saved_id is not null then
    insert into public.question_options (question_id, option_id, option_text, is_correct, sort_order)
    select saved_id, opt->>'id', opt->>'text', (opt->>'id') = any(answer_ids), position - 1
    from jsonb_array_elements(p_question->'options') with ordinality as options(opt, position);

    return saved_id;
  end if;

  -- The unique index waits for concurrent inserts. This separate statement can
  -- now see the committed question and its options at READ COMMITTED isolation.
  select q.id into saved_id
  from public.questions q
  where q.external_key = draft_key
    and q.source_kind = 'generated'
    and jsonb_build_object(
      'id', q.external_key, 'domain', q.domain, 'topic', q.topic,
      'difficulty', q.difficulty, 'questionType', q.question_type,
      'selectCount', q.select_count, 'questionText', q.question_text,
      'correctAnswerIds', q.correct_answer_ids, 'explanation', q.explanation,
      'memoryHook', q.memory_hook, 'sourceBasis', q.source_basis, 'tags', q.tags,
      'options', (
        select jsonb_agg(jsonb_build_object('id', o.option_id, 'text', o.option_text) order by o.sort_order)
        from public.question_options o where o.question_id = q.id
      )
    ) = p_question;

  if saved_id is null then
    raise exception 'This generated question was already saved with different content.'
      using errcode = '23505';
  end if;

  return saved_id;
end;
$$;

revoke all on function public.save_reviewed_question(jsonb) from public, anon, authenticated;
grant execute on function public.save_reviewed_question(jsonb) to service_role;
grant select, insert on public.questions, public.question_options to service_role;
