/**
 * Supabase Storage Helpers
 * Upload files to Supabase Storage and get public URLs
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UploadResult {
  url: string;
  path: string;
}

/**
 * Upload a file to Supabase Storage
 * @param file - File to upload
 * @param bucket - Storage bucket name
 * @param folder - Folder path within bucket
 * @returns Public URL and storage path
 */
export async function uploadFile(
  file: File,
  bucket: string,
  folder: string = ''
): Promise<UploadResult> {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}-${randomStr}.${extension}`;
    const path = folder ? `${folder}/${filename}` : filename;

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return {
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
}

/**
 * Upload video file to videos bucket
 */
export async function uploadVideo(file: File, userId: string): Promise<UploadResult> {
  return uploadFile(file, 'videos', userId);
}

/**
 * Upload audio file to audio bucket
 */
export async function uploadAudio(file: File, userId: string): Promise<UploadResult> {
  return uploadFile(file, 'audio', userId);
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  
  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}
