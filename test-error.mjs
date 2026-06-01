import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  try {
    await page.goto('http://localhost:5173/');
    console.log('Navigated to landing page');
    
    // Click 'Mulai Bermain'
    await page.waitForSelector('button');
    const buttons = await page.$$('button');
    let mulaiBtn = null;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('MULAI BERMAIN')) {
        mulaiBtn = btn;
        break;
      }
    }
    
    if (mulaiBtn) {
      await mulaiBtn.click();
      console.log('Clicked Mulai Bermain');
    }
    
    // Now on Diagnostic
    await page.waitForSelector('button');
    const diagnosticBtns = await page.$$('button');
    for (const btn of diagnosticBtns) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('MULAI TES')) {
        await btn.click();
        console.log('Clicked Mulai Tes');
        break;
      }
    }
    
    // We would need to click 10 diagnostic answers to proceed to game
    // This is tedious. Is there a way to bypass it via localstorage?
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
