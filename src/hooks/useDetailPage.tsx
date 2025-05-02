import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient, QueryKey } from '@tanstack/react-query';
import { useForm, UseFormProps, UseFormReturn, FieldValues, DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { NEW_ID } from '@/utils/constants';


interface UseDetailPageOptions<
  TEntity,        // Type of the entity being fetched/edited
  TFormData extends FieldValues, // Type for form data (usually matches TEntity shape)
  TCreateInput,   // Type for the create API function input
  TUpdateInput,   // Type for the update API function input
> {
  id: string;   // Unique ID from route params, or 'new' 
  entityQueryKey: QueryKey;  // key for fetching the single entity (e.g., ['facet', id]) 
  setSelectKey?: (key: number) => void; // Optional function to set selected key in the parent component
  listQueryKey: QueryKey;  // key for the list view (to invalidate on create/update/delete) (e.g., ['facets']) 
  fetchByIdFn: (id: string) => Promise<TEntity | null>;  // API function to fetch entity by ID 
  createFn: (data: TCreateInput) => Promise<TEntity>; 
 // API function to update an existing entity 
  updateFn: (id: string, data: TUpdateInput) => Promise<TEntity>;
  schema: z.ZodType<TFormData>;  // Zod schema for form validation 
 // Optional function to transform form data before sending to create API 
  transformCreateInput?: (formData: TFormData) => TCreateInput;
 // Optional function to transform form data before sending to update API 
  transformUpdateInput?: (formData: TFormData) => TUpdateInput;
 // Optional function to map fetched entity data to form defaults 
  mapEntityToFormDefaults?: (entity: TEntity) => TFormData;
  formOptions?: UseFormProps<TFormData>;
  successMessage?: string;
  createNavigateTo?: string; // e.g '../$id'
}


interface UseDetailPageReturn<TEntity, TFormData extends FieldValues> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<TFormData, any, FieldValues>;
  entity: TEntity | null | undefined; // Data from useQuery
  isFetching: boolean; 
  isSaving: boolean;   
  isNew: boolean;
  submitHandler: (event?: React.BaseSyntheticEvent) => Promise<void>; 
}




export function useDetailPage<
  TEntity,
  TFormData extends FieldValues,
  TCreateInput = TFormData,
  TUpdateInput = TFormData 
>({
  id,
  entityQueryKey,
  listQueryKey,
  fetchByIdFn,
  createFn,
  updateFn,
  setSelectKey,
  schema,
  transformCreateInput,
  transformUpdateInput,
  mapEntityToFormDefaults,
  formOptions,
  successMessage = 'Saved successfully!',
  createNavigateTo = '../$id', 
}: UseDetailPageOptions<TEntity, TFormData, TCreateInput, TUpdateInput>): UseDetailPageReturn<TEntity, TFormData> {

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = id === NEW_ID;

  const { data: entity, isFetching, isError, error } = useQuery({
    queryKey: entityQueryKey,
    queryFn: () => fetchByIdFn(id),
    enabled: !isNew, // Only fetch if ID is not 'new'
    retry: false, // Optional: Disable retries on fetch error for detail view
  });

  useEffect(() => {
    if (isError && !isNew) {
      console.error(`Failed to fetch entity ${id}:`, error);
      toast.error(`Failed to load data: ${error.message}`);
      // TODO: navigate to a not-found page
      // navigate({ to: '..', replace: true });
    }
  }, [isError, error, isNew, id, navigate]);


  // Initialize useForm
  const form = useForm<TFormData>({
    resolver: zodResolver(schema),
    // Let useForm handle async defaults if isNew, otherwise start empty
    defaultValues: isNew ? formOptions?.defaultValues : undefined,
    ...formOptions, // Spread other options after defaultValues
  });

  // Reset form when entity data loads for editing, or when switching back to new
  useEffect(() => {
    if (!isNew && entity) {
      // Editing: Reset with fetched data (mapped or cast)
      const resetData = mapEntityToFormDefaults
        ? mapEntityToFormDefaults(entity)
        : entity as unknown as DefaultValues<TFormData>;
      form.reset(resetData);
      if(setSelectKey && resetData)
      setSelectKey(Number((prev: number)=>prev+1));
    } else if (isNew) {
      // Switching to New: Reset using the original defaultValues configuration
      form.reset();
      if(setSelectKey)
     setSelectKey(Number((prev: number)=>prev+1));
    }
  }, [entity, isNew, form, mapEntityToFormDefaults]);


  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: TFormData) => {
      const apiInput = transformCreateInput ? transformCreateInput(data) : (data as unknown as TCreateInput);
      return createFn(apiInput);
    },
    onSuccess: (createdEntity) => {
      toast.success(successMessage);
      queryClient.invalidateQueries({ queryKey: listQueryKey }); // Invalidate list
      // Navigate to the edit page of the new entity
      if (createNavigateTo) {
        navigate({
          to: createNavigateTo.replace('$id', (createdEntity as any).id), // Replace $id placeholder
          replace: true // Replace 'new' URL
        });
      } else {
        // Or just update cache and reset form if staying on same conceptual page
        queryClient.setQueryData(entityQueryKey, createdEntity);
        form.reset(createdEntity as unknown as TFormData);
      }
    },
    onError: (error) => {
      console.error("Create mutation error:", error);
      toast.error(`Failed to create: ${error.message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: TFormData) => {
      const apiInput = transformUpdateInput ? transformUpdateInput(data) : (data as unknown as TUpdateInput);
      return updateFn(id, apiInput);
    },
    onSuccess: (updatedEntity) => {
      toast.success(successMessage);
      queryClient.invalidateQueries({ queryKey: listQueryKey }); // Invalidate list
      queryClient.setQueryData(entityQueryKey, updatedEntity); // Update detail cache
      form.reset(updatedEntity as unknown as TFormData); // Reset form to clear dirty state
    },
    onError: (error) => {
      console.error("Update mutation error:", error);
      toast.error(`Failed to update: ${error.message}`);
    }
  });

  // Submit Handler
  const submitHandler = form.handleSubmit((data) => {
    console.log("Submitting form data:", data);
    const formData = data as unknown as TFormData;
    if (isNew) {
      createMutation.mutate(formData);
    } else {
      updateMutation.mutate(formData);
    }
  });

  return {
    form,
    entity: entity,
    isFetching: isFetching && !isNew,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isNew,
    submitHandler,
  };
}