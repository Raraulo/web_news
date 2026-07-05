const https = require('https');

https.get('https://www.youtube.com/@teleamazonasec', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const match = data.match(/channelId":"([^"]+)"/);
    console.log("Channel ID:", match ? match[1] : "Not found");
  });
}).on('error', err => console.log(err));
