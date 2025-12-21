// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hviozmodqjjegyvnxhtp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2aW96bW9kcWpqZWd5dm54aHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwODE2OTAsImV4cCI6MjA4MTY1NzY5MH0.3JqAX6cPeUguVegv8Z6BIPaV8R2Lk2r5LrM6aICyP5Y';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const uploadMenuImage = async (file, folder = 'menu-items') => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('menu-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('menu-images')
      .getPublicUrl(filePath);

    return { success: true, url: publicUrl, path: filePath };
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, error: error.message };
  }
};

export const deleteMenuImage = async (imageUrl) => {
  try {
    const urlParts = imageUrl.split('/storage/v1/object/public/menu-images/');
    if (urlParts.length < 2) return { success: false, error: 'Invalid URL' };
    
    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from('menu-images')
      .remove([filePath]);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    return { success: false, error: error.message };
  }
};

export const replaceMenuImage = async (oldImageUrl, newFile, folder = 'menu-items') => {
  try {
    if (oldImageUrl) {
      await deleteMenuImage(oldImageUrl);
    }

    return await uploadMenuImage(newFile, folder);
  } catch (error) {
    console.error('Replace error:', error);
    return { success: false, error: error.message };
  }
};