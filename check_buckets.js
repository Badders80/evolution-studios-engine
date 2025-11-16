const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://coqtijrftaklcwgbnqef.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcXRpanJmdGFrbGN3Z2JucWVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMDM4NTgsImV4cCI6MjA3NDc3OTg1OH0.0bwaWoAUcASAZYY-GOVJkwOhXkxWx__VIjXKtbDQmgc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBuckets() {
  const { data, error } = await supabase.storage.listBuckets();
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Existing buckets:');
  data.forEach(bucket => {
    console.log(`- ${bucket.id} (public: ${bucket.public})`);
  });
  
  const hasVideos = data.some(b => b.id === 'videos');
  const hasAudio = data.some(b => b.id === 'audio');
  
  console.log('\nStatus:');
  console.log(`videos bucket: ${hasVideos ? '✅ EXISTS' : '❌ MISSING'}`);
  console.log(`audio bucket: ${hasAudio ? '✅ EXISTS' : '❌ MISSING'}`);
}

checkBuckets();
