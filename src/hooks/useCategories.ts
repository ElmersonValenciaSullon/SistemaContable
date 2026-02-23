import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Category, FormCategoria, OpResult } from '../types';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      setCategories((data || []) as Category[]);
    } catch (err) {
      console.error('Error categorías:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const crearCategoria = useCallback(async (form: FormCategoria): Promise<OpResult> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');
      const { error } = await supabase.from('categories').insert({ ...form, user_id: user.id });
      if (error) throw error;
      await fetchCategories();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [fetchCategories]);

  const eliminarCategoria = useCallback(async (id: string): Promise<OpResult> => {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      await fetchCategories();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [fetchCategories]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  return { categories, loading, fetchCategories, crearCategoria, eliminarCategoria };
}
