import puppeteer from 'puppeteer';
import fetch from 'node-fetch';
import fs from 'fs';
import { jsonFileToObject, objectToJsonFile } from './file-helper.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { CLIENT_RENEG_LIMIT } from 'tls';

const currentFilePath = new URL(import.meta.url).pathname;
const currentDirectory = path.dirname(currentFilePath);
const PATH_TO_SCOTCH_JSON = path.resolve(currentDirectory, '../mocks/scotches.json');

const createScotch = async (scotchObject) => {
	const scotchesMap = await jsonFileToObject(PATH_TO_SCOTCH_JSON);
	const id = uuidv4();
	scotchesMap[id] = { ...scotchObject, id };
	await objectToJsonFile(PATH_TO_SCOTCH_JSON, scotchesMap);
	return scotchesMap[id];
}

const run = async () => {
	const browser = await puppeteer.launch({headless: false});
	const page = await browser.newPage();
	await page.setViewport( {width: 1400, height: 1024});
	await page.goto('https://www.saq.com/en/products/spirit/scotch-and-whisky?product_list_limit=24');

	await page.waitForSelector('body');
	// const elements = await page.$$eval('.product .photo .product-item-photo');
	// const elements = await page.$$('.product-item-link');

	// grab the link to open in new tab
	const spiritLink = await page.$eval('.product-item-link', el => el.href);

	// open new tab (has to be blank, I think)
	const p = await browser.newPage();
	await p.setViewport( {width: 1400, height: 1024});

	// navigate to spirit's individual link
	await p.goto(spiritLink);
	
	// grab the details I'm after - title
	const titleSelector2 = await p.$('.page-title');
	const titleHandle2 = await titleSelector2.getProperty('textContent');
	const messyTitle2 = await titleHandle2.jsonValue();
	const titleRegex2 = /^\s+|\s+$/g;
	const title2 = messyTitle2.replace(titleRegex2, '');
	console.log(title2);

	// kind of whiskey
	const typeSelector = await p.$('.product.attribute.identity .value .type');
	const typeHandle = await typeSelector.getProperty('textContent');
	const messyType = await typeHandle.jsonValue();
	const type = messyType.replace(titleRegex2, '');
	console.log(type);

	// photo
	// const image = await p.waitForSelector('.MagicZoom')
	const image = await p.$eval('.MagicZoom', el => el.href);
	console.log(image);
	// const hrefHandle = await image.getProperty('href');
	// const hrefImage = await hrefHandle.jsonValue();
	// const filename = `${hrefImage}.png`;
	// console.log(filename);

	// alcohol percentage
	const percentageSelector = await p.$('.list-attributs li:nth-child(3) strong');
	const percentageHandle = await percentageSelector.getProperty('textContent');
	const messyPercentage = await percentageHandle.jsonValue();
	const abv = messyPercentage.replace(titleRegex2, '');
	console.log(abv);
	
	// try closing that tab
	p.close();

	// await page.click('.product-item-link');
	// const elementText = await (await element.getProperty('textContent')).jsonValue();
	// console.log(elementText);

	// const element2 = await page.$eval('.product-item-link', async (el) => {
	// 	await page.click(el);
	// });
	// const elementText2 = await (await element2.getProperty('textContent')).jsonValue();
	// console.log(elementText2);
	// await page.click(element);

	// elements.map(async (el) => {
	// 	const title = await (await el.getProperty('textContent')).jsonValue();
	// 	console.log(title);
	// })
	
	// for(const element of elements) {
	// 	const title = await page.evaluate(el => el.querySelector('product name product-item-name').textContent, element)
	// 	console.log(title);
	// }
	// await element.click();
	// await page.setViewport( {width: 1400, height: 1024});

	// const scotch = {
	// 	title: title,
	// 	image: filename
	// }

	// createScotch(scotch);
	
	// await browser.close();

}
		
run();
