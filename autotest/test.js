const puppeteer = require('puppeteer');
const url = "http://localhost:3000/";

async function runTest() {
  try {
    var browser = await puppeteer.launch({
      headless: false
    });

    const context = await browser.createIncognitoBrowserContext();
    var page = await browser.newPage();

    await context.overridePermissions(url, ['geolocation']);

    await page.setViewport({ width: 375, height: 812, isMobile: true });

    await page.setGeolocation({
      latitude: Math.random() * (90 - (-90)) + (-90),
      longitude: Math.random() * (180 - (-180)) + (-180),
    });

    await page.goto(url);

    // Add the console event listener
    page.on('console', (message) => {
      console.log(`Browser Console Log: ${message.text()}`);
    });

    // Generate and set 48 random GPS locations
    for (let i = 0; i < 148; i++) {
      const latitude = Math.random() * (90 - (-90)) + (-90);
      const longitude = Math.random() * (180 - (-180)) + (-180);
      await page.setGeolocation({ latitude, longitude });
      await page.waitForTimeout(100); // Wait for 1 second before changing location
    }

    await page.waitForTimeout(10000);//TODO:need wait for data que, check in real world

    const indexedDBData = await page.evaluate(async () => {
      const openRequest = indexedDB.open('MyDB');
      return new Promise((resolve, reject) => {
        openRequest.onsuccess = function (event) {
          const db = event.target.result;
          const dbName = db.name;
          const objectStoreNames = Array.from(db.objectStoreNames);
          const storePromises = objectStoreNames.map((storeName) => {
            return new Promise((resolveStore, rejectStore) => {
              const transaction = db.transaction(storeName, 'readonly');
              const store = transaction.objectStore(storeName);
              const request = store.getAll();
              request.onsuccess = function (event) {
                resolveStore({ storeName, data: event.target.result });
              };
              request.onerror = function (event) {
                rejectStore(new Error(`Failed to read from indexed DB store: ${storeName}`));
              };
            });
          });
          Promise.all(storePromises)
            .then((storeData) => {
              resolve({ dbName, stores: storeData });
            })
            .catch((error) => {
              reject(error);
            });
        };
        openRequest.onerror = function (event) {
          reject(new Error('Failed to open indexed DB.'));
        };
      });
    });

    console.log('Indexed DB Data:', JSON.stringify(indexedDBData));

    await page.waitForTimeout(2000);

    await browser.close();

  } catch (error) {
    console.error('Test failed:', error);
  }
}

runTest();

