import { supabase } from '../config/supabase';

export const testSupabaseConnection = async () => {
    try {
        const { data, error } = await supabase
            .from('inventory')
            .select('count(*)');
        
        if (error) throw error;
        console.log('Supabase connection successful:', data);
        return true;
    } catch (error) {
        console.error('Supabase connection error:', error);
        return false;
    }
};