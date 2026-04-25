import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

async function test() {
  const fd = new FormData();
  fs.writeFileSync('test.txt', 'hello');
  fd.append('images', fs.createReadStream('test.txt'), 'test.txt');
  fd.append('notes', 'a note');

  // Create session
  const res1 = await fetch('http://localhost:5135/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ materialName: 'Test' })
  });
  const session = await res1.json();
  console.log('Created:', session.id);

  // Upload image
  const res2 = await fetch(`http://localhost:5135/api/sessions/${session.id}/images`, {
    method: 'POST',
    body: fd
  });
  console.log('Upload status:', res2.status);
  const text = await res2.text();
  console.log('Upload response:', text);
}

test();
