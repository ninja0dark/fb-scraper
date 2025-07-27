const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', async (req, res) => {
  const { previewUrl, targetFb } = req.query;

  if (!previewUrl || !targetFb) {
    return res.send('يرجى إدخال الرابطين معًا.');
  }

  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(previewUrl, { waitUntil: 'networkidle2' });

    const result = await page.evaluate((targetFb) => {
      const rows = Array.from(document.querySelectorAll('tr, div, span, td'));
      const match = rows.find(el => el.innerText && el.innerText.includes(targetFb));
      return match ? match.innerText : 'لم يتم العثور على السطر المطلوب.';
    }, targetFb);

    await browser.close();
    res.send(`<pre>${result}</pre>`);
  } catch (err) {
    res.send('حدث خطأ أثناء التحليل: ' + err.message);
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));