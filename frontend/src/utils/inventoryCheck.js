import { supabase } from '../config/supabase';

export const checkNearExpiryItems = async () => {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    try {
        const { error } = await supabase
            .from('inventory')
            .update({ 
                status: 'near-expiry',
                discounted_price: supabase.raw('price * 0.7')
            })
            .eq('status', 'available')
            .gte('expiry_date', new Date().toISOString())
            .lte('expiry_date', threeDaysFromNow.toISOString());

        if (error) throw error;
    } catch (error) {
        console.error('Error checking near-expiry items:', error);
    }
};